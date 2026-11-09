<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\ExaminationController;
use App\Http\Controllers\Api\DrugController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\PharmacyController;
use Illuminate\Support\Facades\Route;

// Public: Login
Route::post('/login', [AuthController::class, 'login']);

// Public: tracking tanpa login
Route::get('/tracking/{code}', [PrescriptionController::class, 'track']);

// Protected: Semua endpoint butuh token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Pasien - CRUD lengkap
    Route::get('/patients', [PatientController::class, 'index']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    Route::delete('/patients/{id}', [PatientController::class, 'destroy']);

    // Pemeriksaan
    Route::get('/examinations/patient/{patientId}', [ExaminationController::class, 'byPatient']);
    Route::get('/examinations/{id}', [ExaminationController::class, 'show']);
    Route::post('/examinations', [ExaminationController::class, 'store']);

    // Resep
    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::get('/prescriptions/{id}', [PrescriptionController::class, 'show']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::put('/prescriptions/{id}', [PrescriptionController::class, 'update']);

    // Obat - untuk autocomplete di resep
    Route::get('/drugs', [DrugController::class, 'index']);
    Route::get('/drugs/categories', [DrugController::class, 'categories']);

    // Apoteker
    Route::get('/pharmacy/queue', [PharmacyController::class, 'queue']);
    Route::get('/prescriptions/{id}/detail', [PharmacyController::class, 'prescriptionDetail']);
    Route::put('/prescriptions/{id}/status', [PharmacyController::class, 'updateStatus']);
});
