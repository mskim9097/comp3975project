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
            'owner_id' => 'nullable|exists:users,id',
            'status' => 'required|string|in:pending,active,returned',
        ]);

        $item = Item::create([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'color' => $request->color,
            'brand' => $request->brand,
            'location' => $request->location,
            'finder_id' => $request->finder_id,
            'owner_id' => $request->owner_id,
            'status' => $request->status,
        ]);

        if ($item->status === 'returned' && $item->owner_id !== null) {
            ReturnLog::create([
                'item_id' => $item->id,
                'finder_id' => $item->finder_id,
                'owner_id' => $item->owner_id,
                'returned_at' => now(),
            ]);
        }

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
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'brand' => 'nullable|string|max:255',
            'location' => 'required|string|max:255',
            'finder_id' => 'nullable|exists:users,id',
            'owner_id' => 'nullable|exists:users,id',
            'status' => 'required|string|in:active,returned',
        ]);

        $wasReturnedBefore = $item->status === 'returned';

        $item->update([
            'name' => $request->name,
            'description' => $request->description,
            'category' => $request->category,
            'color' => $request->color,
            'brand' => $request->brand,
            'location' => $request->location,
            'finder_id' => $request->finder_id,
            'owner_id' => $request->owner_id,
            'status' => $request->status,
        ]);

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

        return response()->json([
            'success' => true,
            'data' => $item->load(['finder', 'owner']),
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