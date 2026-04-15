<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ReturnLog;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        return response()->json(
            Item::with(['finder', 'owner'])->orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'finder_id' => 'required|exists:users,id',
            'found_at' => 'nullable|date',
        ]);

        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'color' => $request->color,
            'brand' => $request->brand,
            'location' => $request->location,
            'finder_id' => $request->finder_id,
            'owner_id' => null,
            'status' => 'Pending',
            'found_at' => $request->found_at,
        ]);

        return response()->json($item->load(['finder', 'owner']), 201);
    }

    public function show(string $id)
    {
        $item = Item::with(['finder', 'owner'])->find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        return response()->json($item);
    }

    public function update(Request $request, string $id)
    {
        $item = Item::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'finder_id' => 'required|exists:users,id',
            'owner_id' => 'nullable|exists:users,id',
            'status' => 'required|in:Pending,Active,Claim Pending,Returned',
            'found_at' => 'nullable|date',
        ]);

        $isClaimRequest =
            $validated['status'] === 'Claim Pending' &&
            !empty($validated['owner_id']);

        if ($isClaimRequest) {
            if ($item->status !== 'Active') {
                return response()->json([
                    'message' => 'This item is no longer available for claim.',
                ], 409);
            }

            if (!empty($item->owner_id) && (int) $item->owner_id !== (int) $validated['owner_id']) {
                return response()->json([
                    'message' => 'This item has already been claimed by another user.',
                ], 409);
            }
        }

        $wasReturnedBefore = $item->status === 'returned';

        $item->update($validated);

        if (
            !$wasReturnedBefore &&
            $item->status === 'returned' &&
            $item->owner_id !== null
        ) {
            ReturnLog::create([
                'item_id' => $item->id,
                'finder_id' => $item->finder_id,
                'owner_id' => $item->owner_id,
                'returned_at' => now(),
            ]);
        }

        return response()->json($item->load(['finder', 'owner']));
    }

    public function claim(Request $request, string $id)
    {
        $item = Item::findOrFail($id);
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if ($item->status !== 'Active') {
            return response()->json([
                'message' => 'This item is no longer available for claim.',
            ], 409);
        }

        if (!empty($item->owner_id) && (int) $item->owner_id !== (int) $user->id) {
            return response()->json([
                'message' => 'This item has already been claimed by another user.',
            ], 409);
        }

        $item->owner_id = $validated['owner_id'];
        $item->status = 'Claim Pending';
        $item->save();

        return response()->json([
            'message' => 'Claim submitted successfully.',
            'item' => $item,
        ]);
    }

    public function destroy(string $id)
    {
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $item->delete();

        return response()->json([
            'success' => true,
        ]);
    }
}