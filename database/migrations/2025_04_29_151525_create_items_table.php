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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('stock')->default(0);
            $table->string('image_url')->nullable();
            $table->foreignId('merchant_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->nullable(); // Classification type
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade'); // For hierarchy
            $table->timestamps();
        });

        Schema::create('category_item', function (Blueprint $table) {
            $table->foreignId('item_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->primary(['item_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_item');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('items');
    }
};
