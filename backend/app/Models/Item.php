<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'color',
        'brand',
        'location',
        'finder_id',
        'owner_id',
        'status',
        'found_at',
    ];

    public function finder()
    {
        return $this->belongsTo(User::class, 'finder_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
