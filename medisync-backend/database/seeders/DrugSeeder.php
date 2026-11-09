<?php

namespace Database\Seeders;

use App\Models\Drug;
use Illuminate\Database\Seeder;

class DrugSeeder extends Seeder
{
    public function run(): void
    {
        $drugs = [
            // Analgesik & Antipiretik
            ['name' => 'Paracetamol 500 mg', 'generic_name' => 'Paracetamol', 'category' => 'Analgesik', 'unit' => 'tablet', 'stock' => 1000, 'default_quantity' => '10 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Jika demam atau nyeri'],
            ['name' => 'Paracetamol 650 mg', 'generic_name' => 'Paracetamol', 'category' => 'Analgesik', 'unit' => 'tablet', 'stock' => 500, 'default_quantity' => '10 tablet', 'default_dosage' => '650 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Jika demam atau nyeri berat'],
            ['name' => 'Ibuprofen 400 mg', 'generic_name' => 'Ibuprofen', 'category' => 'Analgesik', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '10 tablet', 'default_dosage' => '400 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Untuk nyeri dan peradangan'],
            ['name' => 'Asam Mefenamat 500 mg', 'generic_name' => 'Asam Mefenamat', 'category' => 'Analgesik', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '9 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Untuk nyeri haid/sakit gigi'],
            ['name' => 'Kalium Diklofenak 50 mg', 'generic_name' => 'Diklofenak', 'category' => 'Analgesik', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '10 tablet', 'default_dosage' => '50 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Untuk nyeri dan peradangan'],

            // Antibiotik
            ['name' => 'Amoxicillin 500 mg', 'generic_name' => 'Amoxicillin', 'category' => 'Antibiotik', 'unit' => 'kapsul', 'stock' => 400, 'default_quantity' => '15 kapsul', 'default_dosage' => '500 mg', 'default_instructions' => '3 × 1 (habiskan)', 'default_notes' => 'HABISKAN! Jangan dihentikan sebelum habis'],
            ['name' => 'Amoxicillin Sirup 125 mg/5ml', 'generic_name' => 'Amoxicillin', 'category' => 'Antibiotik', 'unit' => 'botol', 'stock' => 50, 'default_quantity' => '1 botol', 'default_dosage' => '125 mg/5ml', 'default_instructions' => '3 × 1 sendok teh (habiskan)', 'default_notes' => 'Untuk anak-anak. HABISKAN!'],
            ['name' => 'Ciprofloxacin 500 mg', 'generic_name' => 'Ciprofloxacin', 'category' => 'Antibiotik', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '10 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'HABISKAN! Minum banyak air putih'],
            ['name' => 'Azithromycin 500 mg', 'generic_name' => 'Azithromycin', 'category' => 'Antibiotik', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '3 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '1 × 1 (3 hari)', 'default_notes' => 'HABISKAN! Diminum 1 jam sebelum makan'],
            ['name' => 'Cefixime 100 mg', 'generic_name' => 'Cefixime', 'category' => 'Antibiotik', 'unit' => 'kapsul', 'stock' => 80, 'default_quantity' => '10 kapsul', 'default_dosage' => '100 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'HABISKAN!'],

            // Antihistamin
            ['name' => 'Cetirizine 10 mg', 'generic_name' => 'Cetirizine', 'category' => 'Antihistamin', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '5 tablet', 'default_dosage' => '10 mg', 'default_instructions' => '1 × 1 malam hari', 'default_notes' => 'Dapat menyebabkan kantuk'],
            ['name' => 'Loratadine 10 mg', 'generic_name' => 'Loratadine', 'category' => 'Antihistamin', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '5 tablet', 'default_dosage' => '10 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Tidak menyebabkan kantuk'],
            ['name' => 'Chlorpheniramine 4 mg', 'generic_name' => 'CTM', 'category' => 'Antihistamin', 'unit' => 'tablet', 'stock' => 400, 'default_quantity' => '10 tablet', 'default_dosage' => '4 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Menyebabkan kantuk, hindari mengemudi'],
            ['name' => 'Diphenhydramine 25 mg', 'generic_name' => 'Diphenhydramine', 'category' => 'Antihistamin', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '10 tablet', 'default_dosage' => '25 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Menyebabkan kantuk berat'],

            // Antasida & Gastrointestinal
            ['name' => 'Omeprazole 20 mg', 'generic_name' => 'Omeprazole', 'category' => 'Antasida', 'unit' => 'kapsul', 'stock' => 300, 'default_quantity' => '14 kapsul', 'default_dosage' => '20 mg', 'default_instructions' => '1 × 1 sebelum makan pagi', 'default_notes' => 'Diminum 30 menit sebelum makan'],
            ['name' => 'Lansoprazole 30 mg', 'generic_name' => 'Lansoprazole', 'category' => 'Antasida', 'unit' => 'kapsul', 'stock' => 200, 'default_quantity' => '14 kapsul', 'default_dosage' => '30 mg', 'default_instructions' => '1 × 1 sebelum makan pagi', 'default_notes' => 'Diminum 30 menit sebelum makan'],
            ['name' => 'Ranitidine 150 mg', 'generic_name' => 'Ranitidine', 'category' => 'Antasida', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '10 tablet', 'default_dosage' => '150 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Sebelum makan'],
            ['name' => 'Antasida Doen Tablet', 'generic_name' => 'Antasida', 'category' => 'Antasida', 'unit' => 'tablet', 'stock' => 500, 'default_quantity' => '15 tablet', 'default_dosage' => '1 tablet', 'default_instructions' => '3 × 1 dikunyah', 'default_notes' => 'Dikunyah sebelum ditelan'],
            ['name' => 'Domperidone 10 mg', 'generic_name' => 'Domperidone', 'category' => 'Antiemetik', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '9 tablet', 'default_dosage' => '10 mg', 'default_instructions' => '3 × 1 sebelum makan', 'default_notes' => 'Untuk mual dan muntah'],
            ['name' => 'Ondansetron 4 mg', 'generic_name' => 'Ondansetron', 'category' => 'Antiemetik', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '6 tablet', 'default_dosage' => '4 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Untuk mual muntah berat'],

            // Antidiabetes
            ['name' => 'Metformin 500 mg', 'generic_name' => 'Metformin', 'category' => 'Antidiabetes', 'unit' => 'tablet', 'stock' => 400, 'default_quantity' => '30 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Obat rutin diabetes'],
            ['name' => 'Metformin 850 mg', 'generic_name' => 'Metformin', 'category' => 'Antidiabetes', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '30 tablet', 'default_dosage' => '850 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Obat rutin diabetes'],
            ['name' => 'Glibenclamide 5 mg', 'generic_name' => 'Glibenclamide', 'category' => 'Antidiabetes', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '30 tablet', 'default_dosage' => '5 mg', 'default_instructions' => '1 × 1 sebelum makan pagi', 'default_notes' => 'Obat rutin diabetes. Waspada hipoglikemia'],
            ['name' => 'Glimepiride 2 mg', 'generic_name' => 'Glimepiride', 'category' => 'Antidiabetes', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '30 tablet', 'default_dosage' => '2 mg', 'default_instructions' => '1 × 1 sebelum makan pagi', 'default_notes' => 'Obat rutin diabetes'],

            // Antihipertensi
            ['name' => 'Amlodipine 5 mg', 'generic_name' => 'Amlodipine', 'category' => 'Antihipertensi', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '30 tablet', 'default_dosage' => '5 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Obat rutin hipertensi'],
            ['name' => 'Amlodipine 10 mg', 'generic_name' => 'Amlodipine', 'category' => 'Antihipertensi', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '30 tablet', 'default_dosage' => '10 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Obat rutin hipertensi'],
            ['name' => 'Captopril 25 mg', 'generic_name' => 'Captopril', 'category' => 'Antihipertensi', 'unit' => 'tablet', 'stock' => 400, 'default_quantity' => '30 tablet', 'default_dosage' => '25 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Obat rutin hipertensi. Diminum 1 jam sebelum makan'],
            ['name' => 'Candesartan 8 mg', 'generic_name' => 'Candesartan', 'category' => 'Antihipertensi', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '30 tablet', 'default_dosage' => '8 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Obat rutin hipertensi'],
            ['name' => 'Valsartan 80 mg', 'generic_name' => 'Valsartan', 'category' => 'Antihipertensi', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '30 tablet', 'default_dosage' => '80 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Obat rutin hipertensi'],

            // Kortikosteroid
            ['name' => 'Dexamethasone 0.5 mg', 'generic_name' => 'Dexamethasone', 'category' => 'Kortikosteroid', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '6 tablet', 'default_dosage' => '0.5 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Hanya sesuai resep dokter. Jangan dihentikan mendadak'],
            ['name' => 'Methylprednisolone 4 mg', 'generic_name' => 'Methylprednisolone', 'category' => 'Kortikosteroid', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '6 tablet', 'default_dosage' => '4 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Hanya sesuai resep dokter'],
            ['name' => 'Methylprednisolone 16 mg', 'generic_name' => 'Methylprednisolone', 'category' => 'Kortikosteroid', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '6 tablet', 'default_dosage' => '16 mg', 'default_instructions' => '1 × 1 pagi sesudah makan', 'default_notes' => 'Hanya sesuai resep dokter'],

            // Antitusif & Ekspektoran
            ['name' => 'Dextromethorphan 15 mg', 'generic_name' => 'Dextromethorphan', 'category' => 'Antitusif', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '10 tablet', 'default_dosage' => '15 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Untuk batuk kering'],
            ['name' => 'Guaifenesin 100 mg', 'generic_name' => 'Guaifenesin', 'category' => 'Ekspektoran', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '10 tablet', 'default_dosage' => '100 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Untuk batuk berdahak. Minum banyak air'],
            ['name' => 'Ambroxol 30 mg', 'generic_name' => 'Ambroxol', 'category' => 'Ekspektoran', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '10 tablet', 'default_dosage' => '30 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Untuk batuk berdahak'],
            ['name' => 'Bromhexine 8 mg', 'generic_name' => 'Bromhexine', 'category' => 'Ekspektoran', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '10 tablet', 'default_dosage' => '8 mg', 'default_instructions' => '3 × 1 sesudah makan', 'default_notes' => 'Untuk batuk berdahak'],

            // Vitamin & Suplemen
            ['name' => 'Vitamin C 500 mg', 'generic_name' => 'Asam Askorbat', 'category' => 'Vitamin', 'unit' => 'tablet', 'stock' => 500, 'default_quantity' => '10 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk daya tahan tubuh'],
            ['name' => 'Vitamin B Complex', 'generic_name' => 'Vitamin B', 'category' => 'Vitamin', 'unit' => 'tablet', 'stock' => 400, 'default_quantity' => '10 tablet', 'default_dosage' => '1 tablet', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk kesehatan saraf'],
            ['name' => 'Neurobion', 'generic_name' => 'Vitamin B1, B6, B12', 'category' => 'Vitamin', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '10 tablet', 'default_dosage' => '1 tablet', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk kesehatan saraf'],
            ['name' => 'Calcium D3', 'generic_name' => 'Kalsium', 'category' => 'Suplemen', 'unit' => 'tablet', 'stock' => 250, 'default_quantity' => '10 tablet', 'default_dosage' => '1 tablet', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk kesehatan tulang'],
            ['name' => 'Zinc 20 mg', 'generic_name' => 'Zinc', 'category' => 'Suplemen', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '10 tablet', 'default_dosage' => '20 mg', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk daya tahan tubuh'],

            // Antijamur
            ['name' => 'Fluconazole 150 mg', 'generic_name' => 'Fluconazole', 'category' => 'Antijamur', 'unit' => 'kapsul', 'stock' => 100, 'default_quantity' => '1 kapsul', 'default_dosage' => '150 mg', 'default_instructions' => '1 × 1 (dosis tunggal)', 'default_notes' => 'Untuk infeksi jamur'],
            ['name' => 'Ketoconazole 200 mg', 'generic_name' => 'Ketoconazole', 'category' => 'Antijamur', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '10 tablet', 'default_dosage' => '200 mg', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Untuk infeksi jamur'],
            ['name' => 'Clotrimazole Cream', 'generic_name' => 'Clotrimazole', 'category' => 'Antijamur', 'unit' => 'tube', 'stock' => 50, 'default_quantity' => '1 tube', 'default_dosage' => 'Oles tipis', 'default_instructions' => '2 × 1 oles', 'default_notes' => 'Untuk infeksi jamur kulit'],

            // Antiviral
            ['name' => 'Acyclovir 200 mg', 'generic_name' => 'Acyclovir', 'category' => 'Antiviral', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '15 tablet', 'default_dosage' => '200 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Untuk infeksi herpes'],
            ['name' => 'Acyclovir 800 mg', 'generic_name' => 'Acyclovir', 'category' => 'Antiviral', 'unit' => 'tablet', 'stock' => 80, 'default_quantity' => '15 tablet', 'default_dosage' => '800 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Untuk infeksi herpes/zoster'],
            ['name' => 'Oseltamivir 75 mg', 'generic_name' => 'Oseltamivir', 'category' => 'Antiviral', 'unit' => 'kapsul', 'stock' => 50, 'default_quantity' => '10 kapsul', 'default_dosage' => '75 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Untuk influenza. Mulai dalam 48 jam pertama'],

            // Antikoagulan & Antiplatelet
            ['name' => 'Warfarin 5 mg', 'generic_name' => 'Warfarin', 'category' => 'Antikoagulan', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '30 tablet', 'default_dosage' => '5 mg', 'default_instructions' => '1 × 1 malam hari', 'default_notes' => 'Obat rutin. Perlu monitoring INR'],
            ['name' => 'Aspirin 80 mg', 'generic_name' => 'Aspirin', 'category' => 'Antiplatelet', 'unit' => 'tablet', 'stock' => 400, 'default_quantity' => '30 tablet', 'default_dosage' => '80 mg', 'default_instructions' => '1 × 1 sesudah makan', 'default_notes' => 'Obat rutin jantung. Diminum sesudah makan'],
            ['name' => 'Clopidogrel 75 mg', 'generic_name' => 'Clopidogrel', 'category' => 'Antiplatelet', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '30 tablet', 'default_dosage' => '75 mg', 'default_instructions' => '1 × 1', 'default_notes' => 'Obat rutin jantung'],

            // Antidepresan & Ansiolitik
            ['name' => 'Amitriptyline 25 mg', 'generic_name' => 'Amitriptyline', 'category' => 'Antidepresan', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '10 tablet', 'default_dosage' => '25 mg', 'default_instructions' => '1 × 1 malam hari', 'default_notes' => 'Menyebabkan kantuk. Hanya sesuai resep'],
            ['name' => 'Fluoxetine 20 mg', 'generic_name' => 'Fluoxetine', 'category' => 'Antidepresan', 'unit' => 'kapsul', 'stock' => 80, 'default_quantity' => '30 kapsul', 'default_dosage' => '20 mg', 'default_instructions' => '1 × 1 pagi hari', 'default_notes' => 'Hanya sesuai resep dokter'],
            ['name' => 'Diazepam 2 mg', 'generic_name' => 'Diazepam', 'category' => 'Ansiolitik', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '10 tablet', 'default_dosage' => '2 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Menyebabkan kantuk. Hanya sesuai resep'],
            ['name' => 'Alprazolam 0.5 mg', 'generic_name' => 'Alprazolam', 'category' => 'Ansiolitik', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '10 tablet', 'default_dosage' => '0.5 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Menyebabkan kantuk. Hanya sesuai resep'],

            // Antikonvulsan
            ['name' => 'Phenobarbital 30 mg', 'generic_name' => 'Phenobarbital', 'category' => 'Antikonvulsan', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '30 tablet', 'default_dosage' => '30 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Obat rutin epilepsi. Jangan dihentikan mendadak'],
            ['name' => 'Phenytoin 100 mg', 'generic_name' => 'Phenytoin', 'category' => 'Antikonvulsan', 'unit' => 'kapsul', 'stock' => 150, 'default_quantity' => '30 kapsul', 'default_dosage' => '100 mg', 'default_instructions' => '2 × 1', 'default_notes' => 'Obat rutin epilepsi'],
            ['name' => 'Carbamazepine 200 mg', 'generic_name' => 'Carbamazepine', 'category' => 'Antikonvulsan', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '30 tablet', 'default_dosage' => '200 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Obat rutin epilepsi/neuralgia'],

            // Antimalaria
            ['name' => 'Chloroquine 250 mg', 'generic_name' => 'Chloroquine', 'category' => 'Antimalaria', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '8 tablet', 'default_dosage' => '250 mg', 'default_instructions' => 'Sesuai protokol malaria', 'default_notes' => 'Untuk malaria'],
            ['name' => 'Artemether-Lumefantrine', 'generic_name' => 'AL', 'category' => 'Antimalaria', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '6 tablet', 'default_dosage' => 'Sesuai berat badan', 'default_instructions' => '2 × 1 selama 3 hari', 'default_notes' => 'Untuk malaria falciparum'],

            // Antituberkulosis
            ['name' => 'Rifampicin 450 mg', 'generic_name' => 'Rifampicin', 'category' => 'Antituberkulosis', 'unit' => 'kapsul', 'stock' => 100, 'default_quantity' => '30 kapsul', 'default_dosage' => '450 mg', 'default_instructions' => '1 × 1 pagi (perut kosong)', 'default_notes' => 'OAT. Urine akan berwarna merah/orange'],
            ['name' => 'Isoniazid 300 mg', 'generic_name' => 'Isoniazid', 'category' => 'Antituberkulosis', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '30 tablet', 'default_dosage' => '300 mg', 'default_instructions' => '1 × 1 pagi', 'default_notes' => 'OAT. Jangan diminum dengan antasida'],
            ['name' => 'Pyrazinamide 500 mg', 'generic_name' => 'Pyrazinamide', 'category' => 'Antituberkulosis', 'unit' => 'tablet', 'stock' => 120, 'default_quantity' => '30 tablet', 'default_dosage' => '500 mg', 'default_instructions' => '1 × 1 pagi', 'default_notes' => 'OAT'],
            ['name' => 'Ethambutol 400 mg', 'generic_name' => 'Ethambutol', 'category' => 'Antituberkulosis', 'unit' => 'tablet', 'stock' => 100, 'default_quantity' => '30 tablet', 'default_dosage' => '400 mg', 'default_instructions' => '1 × 1 pagi', 'default_notes' => 'OAT. Waspada gangguan penglihatan'],

            // Bronkodilator & Diuretik
            ['name' => 'Salbutamol 2 mg', 'generic_name' => 'Salbutamol', 'category' => 'Bronkodilator', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '10 tablet', 'default_dosage' => '2 mg', 'default_instructions' => '3 × 1', 'default_notes' => 'Untuk sesak napas/asma'],
            ['name' => 'Salbutamol Inhaler', 'generic_name' => 'Salbutamol', 'category' => 'Bronkodilator', 'unit' => 'inhaler', 'stock' => 50, 'default_quantity' => '1 inhaler', 'default_dosage' => '2 semprot', 'default_instructions' => '3 × 2 semprot', 'default_notes' => 'Untuk sesak napas/asma akut'],
            ['name' => 'Theophylline 200 mg', 'generic_name' => 'Theophylline', 'category' => 'Bronkodilator', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '10 tablet', 'default_dosage' => '200 mg', 'default_instructions' => '2 × 1 sesudah makan', 'default_notes' => 'Untuk asma/PPOK'],
            ['name' => 'Furosemide 40 mg', 'generic_name' => 'Furosemide', 'category' => 'Diuretik', 'unit' => 'tablet', 'stock' => 200, 'default_quantity' => '10 tablet', 'default_dosage' => '40 mg', 'default_instructions' => '1 × 1 pagi', 'default_notes' => 'Untuk edema/hipertensi. Diminum pagi hari'],
            ['name' => 'Spironolactone 25 mg', 'generic_name' => 'Spironolactone', 'category' => 'Diuretik', 'unit' => 'tablet', 'stock' => 150, 'default_quantity' => '30 tablet', 'default_dosage' => '25 mg', 'default_instructions' => '1 × 1 pagi', 'default_notes' => 'Diuretik hemat kalium'],

            // Laksatif & Antidiare
            ['name' => 'Bisacodyl 5 mg', 'generic_name' => 'Bisacodyl', 'category' => 'Laksatif', 'unit' => 'tablet', 'stock' => 300, 'default_quantity' => '10 tablet', 'default_dosage' => '5 mg', 'default_instructions' => '1 × 1 malam sebelum tidur', 'default_notes' => 'Untuk konstipasi. Jangan dikunyah'],
            ['name' => 'Loperamide 2 mg', 'generic_name' => 'Loperamide', 'category' => 'Antidiare', 'unit' => 'kapsul', 'stock' => 200, 'default_quantity' => '6 kapsul', 'default_dosage' => '2 mg', 'default_instructions' => '2 mg setelah BAB cair, maks 8 mg/hari', 'default_notes' => 'Untuk diare. Minum banyak cairan'],
            ['name' => 'Oralit', 'generic_name' => 'Oral Rehydration Salt', 'category' => 'Antidiare', 'unit' => 'sachet', 'stock' => 500, 'default_quantity' => '5 sachet', 'default_dosage' => '1 sachet', 'default_instructions' => 'Larutkan 1 sachet dalam 200ml air, minum sesering mungkin', 'default_notes' => 'Untuk mencegah dehidrasi akibat diare'],
        ];

        foreach ($drugs as $drug) {
            Drug::create($drug);
        }
    }
}
