<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Item;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        Item::create([
            'name' => 'Black Wallet',
            'description' => 'Lost near library',
            'category' => 'wallet',
            'color' => 'black',
            'brand' => 'Gucci',
            'location' => 'Library',
            'finder_id' => 2,
            'owner_id' => null,
            'status' => 'active',
        ]);

        Item::create([
            'name' => 'iPhone 13',
            'description' => 'Found in cafeteria',
            'category' => 'phone',
            'color' => 'white',
            'brand' => 'Apple',
            'location' => 'Cafeteria',
            'finder_id' => 3,
            'owner_id' => null,
            'status' => 'active',
        ]);
    }
}