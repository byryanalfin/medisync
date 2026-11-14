<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PharmacyController extends Controller
{
    public function queue()
    {
        $prescriptions = Prescription::with(['examination.patient', 'doctor', 'items'])
            ->whereIn('status', ['approved', 'accepted', 'preparing', 'ready'])
            ->oldest()->get();

        return response()->json([
            'success' => true,
            'data' => $prescriptions->map(fn ($p) => [
                'id' => $p->id,
                'tracking_code' => $p->tracking_code,
                'patient_name' => $p->examination?->patient?->name,
                'rm_number' => $p->examination?->patient?->rm_number,
                'doctor_name' => $p->doctor?->name,
                'status' => $p->status,
                'created_at' => $p->created_at->toISOString(),
                'items_count' => $p->items->count(),
            ]),
        ]);
    }

    public function prescriptionDetail($id)
    {
        return response()->json([
            'success' => true,
            'data' => Prescription::with(['items', 'examination.patient', 'doctor', 'bpjsVerifier', 'statusEvents.actor'])->findOrFail($id),
        ]);
    }

    public function updateBpjs(Request $request, $id)
    {
        $validated = $request->validate([
            'bpjs_card_checked' => 'required|boolean',
            'bpjs_identity_checked' => 'required|boolean',
            'bpjs_documents_checked' => 'required|boolean',
            'bpjs_notes' => 'nullable|string|max:2000',
        ]);

        $prescription = DB::transaction(function () use ($request, $id, $validated) {
            $prescription = Prescription::lockForUpdate()->findOrFail($id);
            $complete = $validated['bpjs_card_checked'] && $validated['bpjs_identity_checked'] && $validated['bpjs_documents_checked'];
            $prescription->update(array_merge($validated, [
                'bpjs_checked_by' => $request->user()->id,
                'bpjs_checked_at' => now(),
                'bpjs_verified_at' => $complete ? ($prescription->bpjs_verified_at ?? now()) : null,
            ]));

            return $prescription->load('bpjsVerifier');
        });

        return response()->json(['success' => true, 'message' => 'Verifikasi BPJS berhasil disimpan.', 'data' => $prescription]);
    }

    public function updateStatus(Request $request, $id)
    {
        $validated = $request->validate(['status' => 'required|in:accepted,preparing,ready,picked_up']);
        $prescription = DB::transaction(function () use ($request, $id, $validated) {
            $prescription = Prescription::lockForUpdate()->findOrFail($id);
            $from = $prescription->status;
            $next = ['approved' => 'accepted', 'accepted' => 'preparing', 'preparing' => 'ready', 'ready' => 'picked_up'];
            if ($from === $validated['status']) {
                return $prescription->load('statusEvents.actor');
            }
            if (($next[$from] ?? null) !== $validated['status']) {
                throw ValidationException::withMessages(['status' => 'Status harus diperbarui berurutan. Muat ulang data resep sebelum melanjutkan.']);
            }
            $prescription->update(['status' => $validated['status']]);
            $prescription->statusEvents()->create([
                'from_status' => $from,
                'to_status' => $validated['status'],
                'changed_by' => $request->user()->id,
                'created_at' => now(),
            ]);

            return $prescription->load('statusEvents.actor');
        });

        return response()->json(['success' => true, 'message' => 'Status pelayanan berhasil diperbarui.', 'data' => $prescription]);
    }
}
