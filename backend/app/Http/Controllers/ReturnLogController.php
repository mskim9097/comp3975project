<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ReturnLog;

class ReturnLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ReturnLog::with(['item', 'finder', 'owner']);

        if ($request->filled('student_id')) {
            $studentId = $request->student_id;

            $query->where(function ($q) use ($studentId) {
                $q->whereHas('finder', function ($sub) use ($studentId) {
                    $sub->where('student_id', 'like', "%{$studentId}%");
                })->orWhereHas('owner', function ($sub) use ($studentId) {
                    $sub->where('student_id', 'like', "%{$studentId}%");
                });
            });
        }

        if ($request->filled('date')) {
            $query->whereDate('returned_at', $request->date);
        }

        $logs = $query
            ->orderBy('returned_at', 'desc')
            ->get();

        return view('admin.logs', compact('logs'));
    }

    public function show(string $id)
    {
        $log = ReturnLog::with(['item', 'finder', 'owner'])->find($id);

        if (!$log) {
            return response()->json(['message' => 'Log not found'], 404);
        }

        return response()->json($log);
    }
}