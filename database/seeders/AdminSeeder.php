<?php

namespace Database\Seeders;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'role' => 'admin',
            'first_name' => 'System',
            'last_name' => 'Admin',
            'password' => Hash::make('root'),
            'email' => 'magnirecrownvil@gmail.com',
        ]);
    }
}
