<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'total',
        'shipping_first_name',
        'shipping_last_name', 
        'shipping_address',
        'shipping_property',
        'shipping_country_id',
        'shipping_state_id',
        'shipping_city_id',
        'shipping_zip_postal_code',
        'shipping_phone',
        'shipping_email',
        'payment_method',
        'paypal_email',
        'stripe_payment_intent_id',
        'stripe_payment_status',
        'status',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
    
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}