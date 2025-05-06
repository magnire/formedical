<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'role' => 'admin',
            'first_name' => 'Test Admin',
            'last_name' => 'Test Admin',
            'password' => 'root',
            'email' => 'test@example.com',
        ]);

        $categories = [
            // Berdasarkan Fungsi
            ['name' => 'Berdasarkan Fungsi', 'type' => null, 'parent_id' => null],
            ['name' => 'Alat Diagnostik', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Terapi', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Rehabilitasi', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Perlindungan dan Pencegahan', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Monitorisasi', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Bantu Hidup Sehari-hari', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Perawatan Rumah', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Operasi dan Pembedahan', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],
            ['name' => 'Alat Penunjang Kehidupan', 'type' => 'Berdasarkan Fungsi', 'parent_id' => 1],

            // Berdasarkan Sifat Pemakaian
            ['name' => 'Berdasarkan Sifat Pemakaian', 'type' => null, 'parent_id' => null],
            ['name' => 'Peralatan Habis Pakai', 'type' => 'Berdasarkan Sifat Pemakaian', 'parent_id' => 11],
            ['name' => 'Peralatan Tidak Habis Pakai', 'type' => 'Berdasarkan Sifat Pemakaian', 'parent_id' => 11],

            // Berdasarkan Kegunaan
            ['name' => 'Berdasarkan Kegunaan', 'type' => null, 'parent_id' => null],
            ['name' => 'Peralatan THT', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Gigi', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Bedah', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Laboratorium', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Radiologi', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Farmasi', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],
            ['name' => 'Peralatan Gizi', 'type' => 'Berdasarkan Kegunaan', 'parent_id' => 13],

            // Berdasarkan Umur Perawatan
            ['name' => 'Berdasarkan Umur Perawatan', 'type' => null, 'parent_id' => null],
            ['name' => 'Tidak Memerlukan Perawatan', 'type' => 'Berdasarkan Umur Perawatan', 'parent_id' => 21],
            ['name' => 'Memerlukan Perawatan Rutin', 'type' => 'Berdasarkan Umur Perawatan', 'parent_id' => 21],
            ['name' => 'Memerlukan Perawatan Khusus', 'type' => 'Berdasarkan Umur Perawatan', 'parent_id' => 21],

            // Berdasarkan Bentuk
            ['name' => 'Berdasarkan Bentuk', 'type' => null, 'parent_id' => null],
            ['name' => 'Alat Kecil dan Umum', 'type' => 'Berdasarkan Bentuk', 'parent_id' => 25],
            ['name' => 'Alat Spesifik', 'type' => 'Berdasarkan Bentuk', 'parent_id' => 25],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
