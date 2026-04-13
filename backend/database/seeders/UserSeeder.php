<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'student_id' => 'A00000000',
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@bcit.ca',
            'password' => 'password',
            'is_admin' => true,
        ]);

        User::create([
            'name' => 'Student A',
            'student_id' => 'A11111111',
            'first_name' => 'Student',
            'last_name' => 'A',
            'email' => 'a@bcit.ca',
            'password' => 'password',
            'is_admin' => false,
        ]);

        User::create([
            'name' => 'Student B',
            'student_id' => 'A22222222',
            'first_name' => 'Student',
            'last_name' => 'B',
            'email' => 'b@bcit.ca',
            'password' => 'password',
            'is_admin' => false,
        ]);
    }
}