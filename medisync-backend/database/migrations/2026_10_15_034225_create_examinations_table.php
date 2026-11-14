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
        Schema::create('examinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->cascadeOnDelete();
            $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
            $table->text('complaints'); // Keluhan utama
            $table->text('history')->nullable(); // Riwayat penyakit
            $table->string('diagnosis')->nullable();
            $table->json('supporting_exams')->nullable(); // Untuk MED-3 (Lab, Rontgen, dll)
            $table->enum('care_decision', ['rawat_jalan', 'rawat_inap']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('examinations');
    }
};
