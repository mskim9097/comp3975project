<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 임시숫자
        $pendingCount = 12; 
        $completedCount = 48; 
        $aiMatchingCount = 5; 

        return view('admin.dashboard', compact('pendingCount', 'completedCount', 'aiMatchingCount'));
    }
}
