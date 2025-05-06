<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $table = 'cart'; // Table name

    protected $fillable = [
        'user_id',
        'item_id',
        'quantity',
    ];

    // Relationship with the User model
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relationship with the Item model
    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
