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
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->enum('role', ['user', 'merchant', 'admin'])->default('user')->nullable();
                $table->string('first_name');
                $table->string('last_name')->nullable();

                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                
                $table->string('password');

                $table->date('date_of_birth')->nullable();
                $table->enum('gender', ['male', 'female'])->nullable();

                $table->text('address')->nullable();
                $table->text('property')->nullable();

                $table->foreignId('country_id')->nullable();
                $table->foreignId('state_id')->nullable();
                $table->foreignId('city_id')->nullable();

                $table->foreign('country_id')
                    ->references('id')
                    ->on('countries')
                    ->nullOnDelete();
                
                
                $table->foreign('state_id')
                    ->references('id')
                    ->on('states')
                    ->nullOnDelete();

                $table->foreign('city_id')
                    ->references('id')
                    ->on('cities')
                    ->nullOnDelete();

                $table->string('zip_postal_code')->nullable();
                $table->string('phone')->nullable();

                $table->string('active_mode')->nullable()->after('role');

                $table->rememberToken();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Drop dependent tables in correct order
        if (Schema::hasTable('order_items')) {
            Schema::dropIfExists('order_items');
        }
        if (Schema::hasTable('orders')) {
            Schema::dropIfExists('orders');
        }
        if (Schema::hasTable('cart')) {
            Schema::dropIfExists('cart');
        }
        if (Schema::hasTable('category_item')) {
            Schema::dropIfExists('category_item');
        }
        if (Schema::hasTable('merchant_applications')) {
            Schema::dropIfExists('merchant_applications');
        }
        if (Schema::hasTable('items')) {
            Schema::dropIfExists('items');
        }
        if (Schema::hasTable('categories')) {
            Schema::dropIfExists('categories');
        }
    
        // Finally drop user-related tables
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    
        Schema::enableForeignKeyConstraints();
    }
};
