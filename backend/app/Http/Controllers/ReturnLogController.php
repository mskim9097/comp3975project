<?php

namespace App\Http\Controllers;

use App\Models\ReturnLog;

class ReturnLogController extends Controller
{
    public function index()
    {
        return response()->json(
            ReturnLog::with(['item', 'finder', 'owner'])
                ->orderBy('returned_at', 'desc')
                ->get()
        );
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