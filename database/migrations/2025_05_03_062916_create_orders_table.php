<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('total', 10, 2);
            // Shipping information
            $table->string('shipping_first_name');
            $table->string('shipping_last_name');
            $table->string('shipping_address');
            $table->string('shipping_property')->nullable();
            $table->foreignId('shipping_country_id')->constrained('countries');
            $table->foreignId('shipping_state_id')->constrained('states');
            $table->foreignId('shipping_city_id')->constrained('cities');
            $table->string('shipping_zip_postal_code');
            $table->string('shipping_phone');
            $table->string('shipping_email');
            // Payment information
            $table->enum('payment_method', ['paypal', 'card', 'cash']);
            $table->string('paypal_email')->nullable();
            $table->string('stripe_payment_intent_id')->nullable();
            $table->string('stripe_payment_status')->nullable();
            $table->enum('status', ['pending', 'processing', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('order_items');
    }
};
