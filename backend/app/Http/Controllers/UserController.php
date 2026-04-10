<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(
            User::orderBy('created_at', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'nullable|string|unique:users,student_id',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:4',
            'is_admin' => 'boolean',
        ]);

        $user = User::create([
            'name' => $request->first_name . ' ' . $request->last_name,
            'student_id' => $request->student_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => $request->password, // 자동 hash됨
            'is_admin' => $request->is_admin ?? false,
        ]);

        return response()->json($user, 201);
    }

    public function show(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($user);
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $request->validate([
            'student_id' => 'nullable|string|unique:users,student_id,' . $id,
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:4',
            'is_admin' => 'boolean',
        ]);

        $data = [
            'student_id' => $request->student_id,
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'is_admin' => $request->is_admin ?? $user->is_admin,
        ];

        if ($request->filled('first_name') || $request->filled('last_name')) {
            $data['name'] = ($request->first_name ?? '') . ' ' . ($request->last_name ?? '');
        }

        if ($request->filled('password')) {
            $data['password'] = $request->password; // 자동 hash됨
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true
        ]);
    }
}