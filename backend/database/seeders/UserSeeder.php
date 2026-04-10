<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'student_id' => 'A00000000',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@test.com',
            'password' => 'password',
            'is_admin' => true,
        ]);

        User::create([
            'name' => 'John Doe',
            'student_id' => 'A11111111',
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@test.com',
            'password' => 'password',
            'is_admin' => false,
        ]);

        User::create([
            'name' => 'Jane Smith',
            'student_id' => 'A22222222',
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane@test.com',
            'password' => 'password',
            'is_admin' => false,
        ]);
    }
}