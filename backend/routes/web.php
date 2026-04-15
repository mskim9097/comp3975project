<?php

use App\Http\Controllers\Admin\ItemController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LogController;

Route::get('/', function () {
    return redirect('/login');
});

Route::get('/dashboard', function () {
    return redirect()->route('admin.items.index');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/admin/logs', [LogController::class, 'index'])->name('admin.logs');
    Route::get('/admin/items', [App\Http\Controllers\Admin\ItemController::class, 'index'])->name('admin.items.index');
    Route::patch('/admin/items/{id}/approve', [ItemController::class, 'approve'])->name('admin.items.approve');
    Route::patch('/admin/items/{id}/reject', [ItemController::class, 'reject'])->name('admin.items.reject');
});

require __DIR__.'/auth.php';
