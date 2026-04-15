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
        $query = Item::query()->with('owner');

        if ($request->filled('student_id')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('finder', function($subQ) use ($request) {
                    $subQ->where('student_id', 'like', '%' . $request->input('student_id') . '%');
                })->orWhereHas('owner', function($subQ) use ($request) {
                    $subQ->where('student_id', 'like', '%' . $request->input('student_id') . '%');
                });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $items = $query->latest()->get(); 

        $statuses = ['pending', 'active', 'claim pending', 'returned'];
        
        return view('admin.items', [
            'items' => $items,
            'statuses' => $statuses,
            'selectedStudentId' => $request->input('student_id'),
            'selectedStatus' => $request->input('status'),
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