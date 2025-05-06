<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cart', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Links to users table
            $table->foreignId('item_id')->constrained()->onDelete('cascade'); // Links to items table
            $table->integer('quantity')->default(1); // Quantity of the item
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart');
    }
};