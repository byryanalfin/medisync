<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use Illuminate\Http\Request;

class ExaminationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'sometimes|integer',
            'complaints' => 'required|string|max:10000',
            'history' => 'nullable|string|max:10000',
            'diagnosis' => 'required|string|max:255',
            'supporting_exams' => 'nullable|array|max:20',
            'supporting_exams.*' => 'string|max:255',
            'care_decision' => 'required|in:rawat_jalan,rawat_inap',
        ]);

        $validated['doctor_id'] = $request->user()->id;
        $examination = Examination::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pemeriksaan berhasil disimpan',
            'data' => $examination,
        ], 201);
    }

    public function byPatient($patientId)
    {
        $examinations = Examination::where('patient_id', $patientId)
            ->with(['doctor', 'prescription'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $examinations,
        ]);
    }

    public function show($id)
    {
        $examination = Examination::with(['patient', 'doctor', 'prescription.items'])->find($id);

        if (! $examination) {
            return response()->json([
                'success' => false,
                'message' => 'Pemeriksaan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $examination,
        ]);
    }
}
