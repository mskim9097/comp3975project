<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;
use App\Models\ReturnLog;

class ItemController extends Controller
{
    public function index(Request $request) 
    {
        $query = Item::query();

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('location')) {
            $query->where('location', $request->input('location'));
        }

        $items = $query->latest()->get(); 

        $categories = Item::select('category')->whereNotNull('category')->distinct()->pluck('category');
        $locations = Item::select('location')->whereNotNull('location')->distinct()->pluck('location');
        
        return view('admin.items', [
            'items' => $items,
            'categories' => $categories,
            'locations' => $locations,
            'selectedCategory' => $request->input('category'),
            'selectedLocation' => $request->input('location'),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,active,claim pending,returned',
        ]);

        $item = Item::findOrFail($id);
        $newStatus = $request->input('status'); 

        $wasReturnedBefore = $item->status === 'returned';

        if ($newStatus === 'active') {
            $item->owner_id = null;
        }

        $item->status = $newStatus;
        $item->save();

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

        return redirect()->back();
    }
}