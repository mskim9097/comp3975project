<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Services\GithubModelsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        ]);

        $message = trim($validated['message']);

        $structuredData = $this->githubModelsService->extractStructuredData($message);
        $matches = $this->findMatches($structuredData);
        $assistantReply = $this->buildAssistantReply($message, $structuredData, $matches);

        return response()->json([
            'structured_data' => $structuredData,
            'matches' => $matches,
            'assistant_reply' => $assistantReply,
        ]);
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
            ->with(['finder', 'owner'])
            ->whereIn('status', ['active', 'pending', 'claim_pending'])
            ->get();

        $scored = $items->map(function (Item $item) use ($structuredData): array {
            $score = $this->calculateScore($item, $structuredData);
            $reasons = $this->buildReasons($item, $structuredData);

            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'color' => $item->color,
                'brand' => $item->brand,
                'location' => $item->location,
                'status' => $item->status,
                'found_at' => $item->found_at,
                'similarity_score' => $score,
                'match_reasons' => $reasons,
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
     * @param Item $item the item being scored
     * @param array<string, mixed> $structuredData extracted search data
     * @return int
     */
    private function calculateScore(Item $item, array $structuredData): int
    {
        $score = 0;

        $itemName = Str::lower($item->name ?? '');
        $itemDescription = Str::lower($item->description ?? '');
        $itemCategory = Str::lower($item->category ?? '');
        $itemColor = Str::lower($item->color ?? '');
        $itemBrand = Str::lower($item->brand ?? '');
        $itemLocation = Str::lower($item->location ?? '');

        $category = Str::lower((string) ($structuredData['category'] ?? ''));
        $itemType = Str::lower((string) ($structuredData['item_type'] ?? ''));
        $color = Str::lower((string) ($structuredData['color'] ?? ''));
        $brand = Str::lower((string) ($structuredData['brand'] ?? ''));
        $location = Str::lower((string) ($structuredData['location'] ?? ''));
        $keywords = collect($structuredData['keywords'] ?? [])
            ->map(fn (mixed $keyword): string => Str::lower((string) $keyword))
            ->filter()
            ->values();

        if ($category !== '') {
            if ($itemCategory === $category) {
                $score += 40;
            } elseif (Str::contains($itemName, $category) || Str::contains($itemDescription, $category)) {
                $score += 25;
            }
        }

        if ($itemType !== '') {
            if (
                Str::contains($itemName, $itemType) ||
                Str::contains($itemDescription, $itemType) ||
                Str::contains($itemCategory, $itemType)
            ) {
                $score += 30;
            }
        }

        if ($color !== '' && $itemColor !== '' && $itemColor === $color) {
            $score += 20;
        }

        if ($brand !== '' && $itemBrand !== '' && $itemBrand === $brand) {
            $score += 20;
        }

        if ($location !== '' && $itemLocation !== '') {
            if ($itemLocation === $location) {
                $score += 20;
            } elseif (Str::contains($itemLocation, $location) || Str::contains($location, $itemLocation)) {
                $score += 10;
            }
        }

        foreach ($keywords as $keyword) {
            if (
                Str::contains($itemName, $keyword) ||
                Str::contains($itemDescription, $keyword) ||
                Str::contains($itemCategory, $keyword) ||
                Str::contains($itemLocation, $keyword) ||
                Str::contains($itemBrand, $keyword)
            ) {
                $score += 5;
            }
        }

        return min($score, 100);
    }

    /**
     * Builds short reasons explaining the match.
     *
     * @param Item $item the matched item
     * @param array<string, mixed> $structuredData extracted search data
     * @return array<int, string>
     */
    private function buildReasons(Item $item, array $structuredData): array
    {
        $reasons = [];

        if (!empty($structuredData['category']) && Str::lower($item->category ?? '') === Str::lower((string) $structuredData['category'])) {
            $reasons[] = 'Same category';
        }

        if (!empty($structuredData['color']) && Str::lower($item->color ?? '') === Str::lower((string) $structuredData['color'])) {
            $reasons[] = 'Same color';
        }

        if (!empty($structuredData['brand']) && Str::lower($item->brand ?? '') === Str::lower((string) $structuredData['brand'])) {
            $reasons[] = 'Same brand';
        }

        if (!empty($structuredData['location']) && Str::lower($item->location ?? '') === Str::lower((string) $structuredData['location'])) {
            $reasons[] = 'Same location';
        }

        return $reasons;
    }

    /**
     * Builds the assistant reply.
     *
     * @param string $message the original message
     * @param array<string, mixed> $structuredData extracted search data
     * @param array<int, array<string, mixed>> $matches match results
     * @return string
     */
    private function buildAssistantReply(
        string $message,
        array $structuredData,
        array $matches
    ): string {
        if ($structuredData['needs_followup'] === true && count($matches) === 0) {
            return (string) ($structuredData['followup_question'] ?? 'Can you share more details about the item?');
        }

        return $this->githubModelsService->summarizeMatches(
            $message,
            $structuredData,
            $matches
        );
    }
}