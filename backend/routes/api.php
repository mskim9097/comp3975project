<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReturnLogController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('users', UserController::class);
Route::apiResource('items', ItemController::class);

Route::get('return-logs', [ReturnLogController::class, 'index']);
Route::get('return-logs/{id}', [ReturnLogController::class, 'show']);