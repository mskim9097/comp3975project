<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Services\GithubModelsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AIChatController extends Controller
{
    /**
     * The GitHub models service.
     *
     * @var GithubModelsService
     */
    private GithubModelsService $githubModelsService;

    /**
     * Creates a new controller instance.
     *
     * @param GithubModelsService $githubModelsService the AI service
     */
    public function __construct(GithubModelsService $githubModelsService)
    {
        $this->githubModelsService = $githubModelsService;
    }

    /**
     * Handles AI chat search requests.
     *
     * @param Request $request the HTTP request
     * @return JsonResponse
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'previous_structured_data' => 'nullable|array',
            'conversation_messages' => 'nullable|array',
        ]);

        $message = trim($validated['message']);
        $previousStructuredData = $validated['previous_structured_data'] ?? null;
        $conversationMessages = $validated['conversation_messages'] ?? [];

        $lastRequestedField = $previousStructuredData['last_requested_field'] ?? null;

        $mergedStructuredData = $previousStructuredData ?? [
            'item_type' => null,
            'category' => null,
            'color' => null,
            'brand' => null,
            'location' => null,
            'lost_time' => null,
            'keywords' => [],
            'attributes' => [],
            'skipped_fields' => [],
            'last_requested_field' => null,
            'needs_followup' => true,
            'followup_question' => null,
        ];

        $aiStructuredData = $this->githubModelsService->extractStructuredData($message);
        $ruleStructuredData = $this->extractDetailsFromMessageRules($message);

        $mergedStructuredData = $this->mergeStructuredData(
            $mergedStructuredData,
            $aiStructuredData
        );

        $mergedStructuredData = $this->mergeStructuredData(
            $mergedStructuredData,
            $ruleStructuredData
        );

        $mergedStructuredData = $this->applyDirectAnswerToRequestedField(
            $message,
            $mergedStructuredData,
            $lastRequestedField
        );

        if ($lastRequestedField !== null && $this->isSkipAnswerForField($message, $lastRequestedField)) {
            $skippedFields = $mergedStructuredData['skipped_fields'] ?? [];

            if (!in_array($lastRequestedField, $skippedFields, true)) {
                $skippedFields[] = $lastRequestedField;
            }

            $mergedStructuredData['skipped_fields'] = $skippedFields;
        }

        if ($lastRequestedField === 'attributes' && $this->isNegativeFeatureAnswer($message)) {
            $skippedFields = $mergedStructuredData['skipped_fields'] ?? [];

            if (!in_array('attributes', $skippedFields, true)) {
                $skippedFields[] = 'attributes';
            }

            $mergedStructuredData['skipped_fields'] = $skippedFields;
        }

        $mergedStructuredData = $this->normalizeStructuredData($mergedStructuredData, $message);

        $nextQuestion = $this->determineNextQuestion($mergedStructuredData);

        if ($nextQuestion !== null) {
            $mergedStructuredData['needs_followup'] = true;
            $mergedStructuredData['followup_question'] = $nextQuestion['question'];
            $mergedStructuredData['last_requested_field'] = $nextQuestion['field'];

            $matches = [];
            $assistantReply = $nextQuestion['question'];
        } else {
            $mergedStructuredData['needs_followup'] = false;
            $mergedStructuredData['followup_question'] = null;
            $mergedStructuredData['last_requested_field'] = null;

            $matches = $this->findMatches($mergedStructuredData);
            $assistantReply = $this->buildAssistantReply($mergedStructuredData, $matches);
        }

        $conversationMessages[] = [
            'role' => 'assistant',
            'content' => $assistantReply,
        ];

        return response()->json([
            'structured_data' => $mergedStructuredData,
            'matches' => $matches,
            'assistant_reply' => $assistantReply,
            'conversation_messages' => $conversationMessages,
        ]);
    }

    /**
     * Merges old and new structured data.
     *
     * @param array<string, mixed>|null $previous previous structured data
     * @param array<string, mixed> $current current structured data
     * @return array<string, mixed>
     */
    private function mergeStructuredData(?array $previous, array $current): array
    {
        $base = $previous ?? [
            'item_type' => null,
            'category' => null,
            'color' => null,
            'brand' => null,
            'location' => null,
            'lost_time' => null,
            'keywords' => [],
            'attributes' => [],
            'skipped_fields' => [],
            'last_requested_field' => null,
            'needs_followup' => true,
            'followup_question' => null,
        ];

        $base['keywords'] = $base['keywords'] ?? [];
        $base['attributes'] = $base['attributes'] ?? [];
        $base['skipped_fields'] = $base['skipped_fields'] ?? [];

        foreach (['item_type', 'category', 'color', 'brand', 'location', 'lost_time'] as $field) {
            if (!empty($current[$field])) {
                $base[$field] = $current[$field];
            }
        }

        $base['keywords'] = array_values(array_unique(array_filter(array_merge(
            $base['keywords'],
            $current['keywords'] ?? []
        ))));

        $base['attributes'] = array_values(array_unique(array_filter(array_merge(
            $base['attributes'],
            $current['attributes'] ?? []
        ))));

        return $base;
    }

    /**
     * Detects whether the user is saying they do not know or remember.
     *
     * @param string $message the user message
     * @return bool
     */
    private function isUnknownAnswer(string $message): bool
    {
        $normalized = Str::lower(trim($message));

        $unknownPhrases = [
            "i don't know",
            'i dont know',
            "don't know",
            'dont know',
            "i do not know",
            "i don't remember",
            'i dont remember',
            "don't remember",
            'dont remember',
            'not sure',
            'no idea',
            'unknown',
            'idk',
            'nope',
            'nah',
        ];

        foreach ($unknownPhrases as $phrase) {
            if ($normalized === $phrase || Str::contains($normalized, $phrase)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Detects whether the user wants to skip the currently requested field.
     *
     * @param string $message the user message
     * @param string|null $lastRequestedField the last requested field
     * @return bool
     */
    private function isSkipAnswerForField(string $message, ?string $lastRequestedField): bool
    {
        $normalized = Str::lower(trim($message));

        if ($this->isUnknownAnswer($message)) {
            return true;
        }

        $optionalFields = ['brand', 'lost_time', 'location'];

        if (
            in_array($lastRequestedField, $optionalFields, true) &&
            in_array($normalized, ['no', 'n', 'none'], true)
        ) {
            return true;
        }

        return false;
    }
    
    /**
     * Detects whether the user is saying there is no extra feature.
     *
     * @param string $message the user message
     * @return bool
     */
    private function isNegativeFeatureAnswer(string $message): bool
    {
        $normalized = Str::lower(trim($message));

        $negativePhrases = [
            'no',
            'none',
            'nothing',
            'nope',
            'not really',
            'no feature',
            'no special feature',
            'nothing special',
        ];

        foreach ($negativePhrases as $phrase) {
            if ($normalized === $phrase || Str::contains($normalized, $phrase)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Applies a direct short answer to the last requested field when possible.
     *
     * @param string $message the user message
     * @param array<string, mixed> $structuredData merged structured data
     * @param string|null $lastRequestedField last requested field
     * @return array<string, mixed>
     */
    private function applyDirectAnswerToRequestedField(
        string $message,
        array $structuredData,
        ?string $lastRequestedField
    ): array {
        if ($lastRequestedField === null) {
            return $structuredData;
        }

        $rawValue = trim($message);
        $value = Str::lower($rawValue);

        if ($value === '') {
            return $structuredData;
        }

        if (
            $this->isSkipAnswerForField($message, $lastRequestedField) ||
            ($lastRequestedField === 'attributes' && $this->isNegativeFeatureAnswer($message))
        ) {
            return $structuredData;
        }

        if ($lastRequestedField === 'lost_time' && empty($structuredData['lost_time'])) {
            if (
                Str::contains($value, 'morning') ||
                preg_match('/\b(6|7|8|9|10|11)\s*am\b/', $value)
            ) {
                $structuredData['lost_time'] = 'Morning';
                return $structuredData;
            }

            if (
                Str::contains($value, 'afternoon') ||
                preg_match('/\b(12|1|2|3|4)\s*pm\b/', $value)
            ) {
                $structuredData['lost_time'] = 'Afternoon';
                return $structuredData;
            }

            if (
                Str::contains($value, 'evening') ||
                preg_match('/\b(5|6|7|8)\s*pm\b/', $value)
            ) {
                $structuredData['lost_time'] = 'Evening';
                return $structuredData;
            }

            if (
                Str::contains($value, 'night') ||
                preg_match('/\b(9|10|11)\s*pm\b/', $value)
            ) {
                $structuredData['lost_time'] = 'Night';
                return $structuredData;
            }

            $structuredData['lost_time'] = ucfirst($rawValue);
            return $structuredData;
        }

        if ($lastRequestedField === 'color' && empty($structuredData['color'])) {
            $structuredData['color'] = ucfirst($rawValue);
            return $structuredData;
        }

        if ($lastRequestedField === 'location' && empty($structuredData['location'])) {
            $structuredData['location'] = strtoupper($rawValue);
            return $structuredData;
        }

        if ($lastRequestedField === 'brand' && empty($structuredData['brand'])) {
            $structuredData['brand'] = ucfirst($rawValue);
            $structuredData['keywords'][] = $value;
            $structuredData['keywords'] = array_values(array_unique($structuredData['keywords']));
            return $structuredData;
        }

        if ($lastRequestedField === 'category' && empty($structuredData['category'])) {
            $structuredData['keywords'][] = $value;
            $structuredData['keywords'] = array_values(array_unique($structuredData['keywords']));
            $structuredData['category'] = ucfirst($rawValue);
            return $structuredData;
        }

        if ($lastRequestedField === 'attributes') {
            $structuredData['attributes'][] = $rawValue;
            $structuredData['attributes'] = array_values(
                array_unique(array_filter($structuredData['attributes']))
            );
            return $structuredData;
        }

        return $structuredData;
    }

    /**
     * Extracts simple lost-item details from a free-form message using rules.
     *
     * @param string $message the user message
     * @return array<string, mixed>
     */
    private function extractDetailsFromMessageRules(string $message): array
    {
        $text = Str::lower(trim($message));

        $data = [
            'category' => null,
            'color' => null,
            'location' => null,
            'brand' => null,
            'lost_time' => null,
            'attributes' => [],
            'keywords' => [],
        ];

        $categories = [
            'wallet', 'phone', 'backpack', 'bag', 'laptop',
            'tablet', 'airpods', 'keys', 'key', 'card', 'bottle',
        ];

        $colors = [
            'black', 'white', 'red', 'blue', 'green',
            'pink', 'gray', 'grey', 'silver', 'gold', 'brown',
        ];

        foreach ($categories as $category) {
            if (preg_match('/\b' . preg_quote($category, '/') . '\b/', $text)) {
                $data['category'] = ucfirst($category);
                $data['keywords'][] = $category;
                break;
            }
        }

        foreach ($colors as $color) {
            if (preg_match('/\b' . preg_quote($color, '/') . '\b/', $text)) {
                $data['color'] = ucfirst($color);
                $data['keywords'][] = $color;
                break;
            }
        }

        if (
            preg_match('/\b(?:at|near|in)\s+the\s+([a-z][a-z0-9\s-]{1,40})/i', $text, $matches) ||
            preg_match('/\b(?:at|near|in)\s+([a-z][a-z0-9\s-]{1,40})/i', $text, $matches)
        ) {
            $location = trim($matches[1]);
            $location = preg_replace(
                '/\b(this|today|yesterday|morning|moring|afternoon|evening|night)\b.*$/i',
                '',
                $location
            );
            $location = trim((string) $location);

            if ($location !== '') {
                $data['location'] = ucwords($location);
                $data['keywords'][] = Str::lower($location);
            }
        }

        if (
            Str::contains($text, 'this morning') ||
            Str::contains($text, 'in the morning') ||
            Str::contains($text, 'today morning') ||
            Str::contains($text, 'this moring') ||
            preg_match('/\bmorning\b/i', $text)
        ) {
            $data['lost_time'] = 'Morning';
        } elseif (
            Str::contains($text, 'this afternoon') ||
            Str::contains($text, 'in the afternoon') ||
            preg_match('/\bafternoon\b/i', $text)
        ) {
            $data['lost_time'] = 'Afternoon';
        } elseif (
            Str::contains($text, 'this evening') ||
            Str::contains($text, 'in the evening') ||
            preg_match('/\bevening\b/i', $text)
        ) {
            $data['lost_time'] = 'Evening';
        } elseif (
            Str::contains($text, 'tonight') ||
            Str::contains($text, 'at night') ||
            preg_match('/\bnight\b/i', $text)
        ) {
            $data['lost_time'] = 'Night';
        } elseif (preg_match('/\b(6|7|8|9|10|11)\s*am\b/i', $text)) {
            $data['lost_time'] = 'Morning';
        } elseif (preg_match('/\b(12|1|2|3|4)\s*pm\b/i', $text)) {
            $data['lost_time'] = 'Afternoon';
        } elseif (preg_match('/\b(5|6|7|8)\s*pm\b/i', $text)) {
            $data['lost_time'] = 'Evening';
        } elseif (preg_match('/\b(9|10|11)\s*pm\b/i', $text)) {
            $data['lost_time'] = 'Night';
        }

        $data['keywords'] = array_values(array_unique(array_filter($data['keywords'])));

        return $data;
    }

    /**
     * Normalizes structured data to fit the application's item categories.
     *
     * @param array<string, mixed> $structuredData extracted search data
     * @return array<string, mixed>
     */
    private function normalizeStructuredData(array $structuredData, string $rawMessage = ''): array
    {
        $category = Str::lower((string) ($structuredData['category'] ?? ''));
        $itemType = Str::lower((string) ($structuredData['item_type'] ?? ''));
        $brand = Str::lower((string) ($structuredData['brand'] ?? ''));
        $location = Str::lower((string) ($structuredData['location'] ?? ''));
        $raw = Str::lower($rawMessage);

        $keywords = collect($structuredData['keywords'] ?? [])
            ->map(fn (mixed $keyword): string => Str::lower((string) $keyword))
            ->values()
            ->all();

        $attributes = collect($structuredData['attributes'] ?? [])
            ->map(fn (mixed $attribute): string => Str::lower((string) $attribute))
            ->values()
            ->all();

        $allSignals = array_filter(array_merge(
            [$category, $itemType, $brand, $location, $raw],
            $keywords,
            $attributes
        ));

        foreach ($allSignals as $signal) {
            if (
                Str::contains($signal, 'iphone') ||
                Str::contains($signal, 'phone') ||
                Str::contains($signal, 'cellphone') ||
                Str::contains($signal, 'cell phone') ||
                Str::contains($signal, 'mobile')
            ) {
                $structuredData['category'] = 'Phone';
                $structuredData['item_type'] = 'phone';
                break;
            }

            if (
                Str::contains($signal, 'airpods') ||
                Str::contains($signal, 'earbuds') ||
                Str::contains($signal, 'ear buds')
            ) {
                $structuredData['category'] = 'Earbuds';
                $structuredData['item_type'] = 'earbuds';
                break;
            }

            if (
                Str::contains($signal, 'headphone') ||
                Str::contains($signal, 'headset') ||
                Str::contains($signal, 'head set')
            ) {
                $structuredData['category'] = 'Headphones';
                $structuredData['item_type'] = 'headphones';
                break;
            }

            if (
                Str::contains($signal, 'wallet') ||
                Str::contains($signal, 'card holder') ||
                Str::contains($signal, 'purse')
            ) {
                $structuredData['category'] = 'Wallet';
                $structuredData['item_type'] = 'wallet';
                break;
            }

            if (
                Str::contains($signal, 'backpack') ||
                Str::contains($signal, 'school bag') ||
                Str::contains($signal, 'bag')
            ) {
                $structuredData['category'] = 'Backpack';
                $structuredData['item_type'] = 'backpack';
                break;
            }

            if (
                Str::contains($signal, 'keychain') ||
                Str::contains($signal, 'keys') ||
                Str::contains($signal, 'key')
            ) {
                $structuredData['category'] = 'Keys';
                $structuredData['item_type'] = 'keys';
                break;
            }

            if (
                Str::contains($signal, 'water bottle') ||
                Str::contains($signal, 'hydro flask') ||
                Str::contains($signal, 'flask') ||
                Str::contains($signal, 'bottle')
            ) {
                $structuredData['category'] = 'Bottle';
                $structuredData['item_type'] = 'bottle';
                break;
            }

            if (
                Str::contains($signal, 'student card') ||
                Str::contains($signal, 'id card') ||
                Str::contains($signal, 'bcit card') ||
                Str::contains($signal, 'identification') ||
                $signal === 'id' ||
                Str::contains($signal, 'card')
            ) {
                $structuredData['category'] = 'ID';
                $structuredData['item_type'] = 'id';
                break;
            }

            if (
                Str::contains($signal, 'macbook') ||
                Str::contains($signal, 'notebook computer') ||
                Str::contains($signal, 'laptop')
            ) {
                $structuredData['category'] = 'Laptop';
                $structuredData['item_type'] = 'laptop';
                break;
            }
        }

        if (empty($structuredData['lost_time'])) {
            if (Str::contains($raw, 'morning')) {
                $structuredData['lost_time'] = 'Morning';
            } elseif (Str::contains($raw, 'afternoon')) {
                $structuredData['lost_time'] = 'Afternoon';
            } elseif (Str::contains($raw, 'evening')) {
                $structuredData['lost_time'] = 'Evening';
            } elseif (Str::contains($raw, 'night')) {
                $structuredData['lost_time'] = 'Night';
            }
        }

        return $structuredData;
    }
    /**
     * Determines the next follow-up question and target field.
     *
     * @param array<string, mixed> $structuredData search data
     * @return array<string, string>|null
     */
    private function determineNextQuestion(array $structuredData): ?array
    {
        $skipped = $structuredData['skipped_fields'] ?? [];

        if (
            empty($structuredData['category']) &&
            empty($structuredData['item_type']) &&
            !in_array('category', $skipped, true)
        ) {
            return [
                'field' => 'category',
                'question' => 'What kind of item did you lose?',
            ];
        }

        if (
            empty($structuredData['location']) &&
            !in_array('location', $skipped, true)
        ) {
            return [
                'field' => 'location',
                'question' => 'Where do you think you lost it?',
            ];
        }

        if (
            empty($structuredData['lost_time']) &&
            !in_array('lost_time', $skipped, true)
        ) {
            return [
                'field' => 'lost_time',
                'question' => 'Do you remember around what time you lost it? For example, morning, afternoon, evening, or night.',
            ];
        }

        if (
            empty($structuredData['color']) &&
            !in_array('color', $skipped, true)
        ) {
            return [
                'field' => 'color',
                'question' => 'What color is it?',
            ];
        }

        if (
            empty($structuredData['brand']) &&
            !in_array('brand', $skipped, true)
        ) {
            return [
                'field' => 'brand',
                'question' => 'Do you know the brand?',
            ];
        }

        if (
            count($structuredData['attributes'] ?? []) === 0 &&
            !in_array('attributes', $skipped, true)
        ) {
            return [
                'field' => 'attributes',
                'question' => 'Does it have any unique feature, such as a case, sticker, keychain, or scratch?',
            ];
        }

        return null;
    }

    /**
     * Finds matching items from the database.
     *
     * @param array<string, mixed> $structuredData extracted search data
     * @return array<int, array<string, mixed>>
     */
    private function findMatches(array $structuredData): array
    {
        $items = Item::query()
            ->whereIn('status', 'active')
            ->get();

        $scored = $items->map(function (Item $item) use ($structuredData): array {
            $score = $this->calculateScore($item, $structuredData);

            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => null,
                'category' => $item->category,
                'color' => null,
                'brand' => null,
                'location' => $item->location,
                'finder_id' => null,
                'owner_id' => null,
                'found_at' => $item->found_at,
                'similarity_score' => $score,
            ];
        });

        return $scored
            ->filter(fn (array $item): bool => $item['similarity_score'] > 0)
            ->sortByDesc('similarity_score')
            ->take(5)
            ->values()
            ->all();
    }

    /**
     * Calculates a similarity score for an item.
     *
     * Category must match exactly.
     *
     * @param Item $item the item being scored
     * @param array<string, mixed> $structuredData extracted search data
     * @return int
     */
    private function calculateScore(Item $item, array $structuredData): int
    {
        $itemName = Str::lower($item->name ?? '');
        $itemDescription = Str::lower($item->description ?? '');
        $itemCategory = Str::lower($item->category ?? '');
        $itemColor = Str::lower($item->color ?? '');
        $itemBrand = Str::lower($item->brand ?? '');
        $itemLocation = Str::lower($item->location ?? '');

        $category = Str::lower((string) ($structuredData['category'] ?? ''));
        $color = Str::lower((string) ($structuredData['color'] ?? ''));
        $brand = Str::lower((string) ($structuredData['brand'] ?? ''));
        $location = Str::lower((string) ($structuredData['location'] ?? ''));
        $lostTime = Str::lower((string) ($structuredData['lost_time'] ?? ''));

        $keywords = collect($structuredData['keywords'] ?? [])
            ->map(fn (mixed $keyword): string => Str::lower((string) $keyword))
            ->filter()
            ->values();

        $attributes = collect($structuredData['attributes'] ?? [])
            ->map(fn (mixed $attribute): string => Str::lower((string) $attribute))
            ->filter()
            ->values();

        if ($category === '' || $itemCategory !== $category) {
            return 0;
        }

        $score = 50;

        if ($location !== '') {
            if ($itemLocation === $location) {
                $score += 20;
            } elseif (
                Str::contains($itemLocation, $location) ||
                Str::contains($location, $itemLocation)
            ) {
                $score += 10;
            }
        }

        if ($lostTime !== '' && !empty($item->found_at)) {
            $foundHour = (int) date('G', strtotime((string) $item->found_at));
            $foundTimeOfDay = '';

            if ($foundHour < 12) {
                $foundTimeOfDay = 'morning';
            } elseif ($foundHour < 17) {
                $foundTimeOfDay = 'afternoon';
            } elseif ($foundHour < 21) {
                $foundTimeOfDay = 'evening';
            } else {
                $foundTimeOfDay = 'night';
            }

            if ($foundTimeOfDay === $lostTime) {
                $score += 8;
            }
        }

        if ($color !== '' && $itemColor !== '' && $itemColor === $color) {
            $score += 10;
        }

        if ($brand !== '' && $itemBrand !== '' && $itemBrand === $brand) {
            $score += 10;
        }

        foreach ($keywords as $keyword) {
            if (
                Str::contains($itemName, $keyword) ||
                Str::contains($itemDescription, $keyword)
            ) {
                $score += 3;
            }
        }

        foreach ($attributes as $attribute) {
            if (Str::contains($itemDescription, $attribute)) {
                $score += 4;
            }
        }

        return min($score, 100);
    }

    /**
     * Builds the assistant reply shown to the user.
     *
     * @param array<string, mixed> $structuredData extracted search data
     * @param array<int, array<string, mixed>> $matches match results
     * @return string
     */
    private function buildAssistantReply(array $structuredData, array $matches): string
    {
        if (count($matches) === 0) {
            return 'I could not find a strong match with the details provided. You can try adding more details if you remember them later.';
        }

        return 'I found some possible matches. Only general public details are shown below.';
    }
}