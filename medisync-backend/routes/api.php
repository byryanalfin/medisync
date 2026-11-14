<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DrugController;
use App\Http\Controllers\Api\ExaminationController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\PharmacyController;
use App\Http\Controllers\Api\PrescriptionController;
use Illuminate\Support\Facades\Route;

// Public: Login
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

// Public: tracking tanpa login
Route::get('/tracking/{code}', [PrescriptionController::class, 'track'])->middleware('throttle:60,1');

// Protected: Semua endpoint butuh token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/doctor/dashboard', [DashboardController::class, 'doctor'])->middleware('role:dokter');

    // Pasien - CRUD lengkap
    Route::get('/patients', [PatientController::class, 'index']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);

    // Pemeriksaan
    Route::get('/examinations/patient/{patientId}', [ExaminationController::class, 'byPatient']);
    Route::get('/examinations/{id}', [ExaminationController::class, 'show']);
    Route::post('/examinations', [ExaminationController::class, 'store'])->middleware('role:dokter');

    // Resep
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store'])->middleware('role:dokter');
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update'])->middleware('role:dokter');

    // Obat - untuk autocomplete di resep
    Route::get('/drugs', [DrugController::class, 'index']);
    Route::get('/drugs/categories', [DrugController::class, 'categories']);
    Route::post('/drugs', [DrugController::class, 'store'])->middleware('role:admin_apoteker');
    Route::put('/drugs/{drug}', [DrugController::class, 'update'])->middleware('role:admin_apoteker');

    Route::put('/prescriptions/{id}/bpjs', [PharmacyController::class, 'updateBpjs'])->middleware('role:admin_apoteker');

    // Apoteker
    Route::get('/pharmacy/queue', [PharmacyController::class, 'queue'])->middleware('role:admin_apoteker');
    Route::get('/prescriptions/{id}/detail', [PharmacyController::class, 'prescriptionDetail']);
    Route::put('/prescriptions/{id}/status', [PharmacyController::class, 'updateStatus'])->middleware('role:admin_apoteker');
});
