<?php

namespace Database\Seeders;

use App\Models\Patient;
use Illuminate\Database\Seeder;

class PatientSeeder extends Seeder
{
    public function run(): void
    {
        Patient::create([
            'rm_number' => 'RM-2024-01892',
            'name' => 'Siti Budiarti',
            'birth_date' => '1991-05-15',
            'gender' => 'Perempuan',
            'allergies' => 'Amoxicillin',
        ]);

        Patient::create([
            'rm_number' => 'RM-2023-01451',
            'name' => 'Ahmad Rizki',
            'birth_date' => '1997-08-22',
            'gender' => 'Laki-laki',
            'allergies' => null,
        ]);

        Patient::create([
            'rm_number' => 'RM-2023-02114',
            'name' => 'Budi Santoso',
            'birth_date' => '1979-03-10',
            'gender' => 'Laki-laki',
            'allergies' => 'Penicillin',
        ]);

        Patient::create([
            'rm_number' => 'RM-2022-00981',
            'name' => 'Lina Novitasari',
            'birth_date' => '1994-11-28',
            'gender' => 'Perempuan',
            'allergies' => null,
        ]);

        Patient::create([
            'rm_number' => 'RM-2024-00215',
            'name' => 'Dedi Kurniawan',
            'birth_date' => '1986-07-05',
            'gender' => 'Laki-laki',
            'allergies' => 'Sulfa',
        ]);
    }
}
