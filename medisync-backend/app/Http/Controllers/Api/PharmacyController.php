<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    // MED-9: Dashboard Antrean Resep Masuk Real-Time
    public function queue()
    {
        $prescriptions = Prescription::with(['examination.patient', 'doctor'])
            ->where('status', 'approved')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $prescriptions->map(function ($p) {
                return [
                    'id' => $p->id,
                    'tracking_code' => $p->tracking_code,
                    'patient_name' => $p->examination?->patient?->name ?? 'Unknown',
                    'rm_number' => $p->examination?->patient?->rm_number ?? '-',
                    'doctor_name' => $p->doctor?->name ?? 'Unknown',
                    'status' => $p->status,
                    'created_at' => $p->created_at->diffForHumans(),
                    'items_count' => $p->items->count(),
                ];
            }),
        ]);
    }

    // MED-10: Telaah Klinis Rincian Resep Elektronik
    public function prescriptionDetail($id)
    {
        $prescription = Prescription::with([
            'items',
            'examination.patient',
            'examination.doctor',
            'doctor'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $prescription,
        ]);
    }

    // MED-11: Pembaruan Status Penyiapan Obat Bertahap
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:preparing,ready,picked_up',
        ]);

        $prescription = Prescription::findOrFail($id);
        $prescription->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui menjadi ' . $request->status,
            'data' => $prescription,
        ]);
    }
}
