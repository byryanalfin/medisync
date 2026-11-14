<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::withCount('examinations')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }

    public function show($id)
    {
        $patient = Patient::with(['examinations.prescription.items', 'examinations.doctor:id,name'])->find($id);

        if (! $patient) {
            return response()->json([
                'success' => false,
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $patient,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rm_number' => 'required|unique:patients,rm_number',
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date|before_or_equal:today',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'allergies' => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil ditambahkan',
            'data' => $patient,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $patient = Patient::find($id);

        if (! $patient) {
            return response()->json([
                'success' => false,
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        $validated = $request->validate([
            'rm_number' => 'required|unique:patients,rm_number,'.$id,
            'name' => 'required|string|max:255',
            'birth_date' => 'required|date|before_or_equal:today',
            'gender' => 'required|in:Laki-laki,Perempuan',
            'allergies' => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil diupdate',
            'data' => $patient,
        ]);
    }

    public function destroy($id)
    {
        $patient = Patient::find($id);

        if (! $patient) {
            return response()->json([
                'success' => false,
                'message' => 'Pasien tidak ditemukan',
            ], 404);
        }

        if ($patient->examinations()->exists()) {
            return response()->json(['success' => false, 'message' => 'Pasien tidak dapat dihapus karena memiliki riwayat pemeriksaan atau resep.'], 409);
        }

        try {
            $patient->delete();
        } catch (QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pasien tidak dapat dihapus karena memiliki riwayat pemeriksaan atau resep.',
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pasien berhasil dihapus',
        ]);
    }
}
