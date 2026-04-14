<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;

class ItemController extends Controller
{
    public function index()
    {
        $items = Item::where('status', 'pending')->latest()->get();
        
        return view('admin.items', compact('items'));
    }

    public function approve($id)
    {
        $item = Item::findOrFail($id);
        $item->status = 'approved';
        $item->save();

        return redirect()->back();
    }

    public function reject($id)
    {
        $item = Item::findOrFail($id);
        $item->status = 'rejected';
        $item->save();

        return redirect()->back();
    }
}