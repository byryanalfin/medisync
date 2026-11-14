<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Dokter
        User::create([
            'name' => 'dr. Andi Saputra',
            'email' => 'andi.saputra@medika.com',
            'nip' => 'D001',
            'role' => 'dokter',
            'password' => Hash::make('password123'),
        ]);

        // Admin Apoteker
        User::create([
            'name' => 'Nur Aisyah, S.Farm',
            'email' => 'nur.aisyah@medika.com',
            'nip' => 'A001',
            'role' => 'admin_apoteker',
            'password' => Hash::make('password123'),
        ]);
    }
}
