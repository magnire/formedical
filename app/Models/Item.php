<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image_url',
        'merchant_id',
        'is_active',
    ];

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_item');
    }
}