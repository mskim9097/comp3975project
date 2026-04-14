<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Item;

class DashboardController extends Controller
{
    public function index()
    {
        
        $pendingCount = Item::where('status', 'pending')->count(); 
        
        $completedCount = Item::where('status', 'returned')->count(); 
        
        $aiMatchingCount = Item::where('status', 'approved')->count(); 

        return view('admin.dashboard', compact('pendingCount', 'completedCount', 'aiMatchingCount'));
    }
}