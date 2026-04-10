<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReturnLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'finder_id',
        'owner_id',
        'returned_at',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }

    public function finder()
    {
        return $this->belongsTo(User::class, 'finder_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
