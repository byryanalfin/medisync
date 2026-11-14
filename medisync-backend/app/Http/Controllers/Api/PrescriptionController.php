<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PrescriptionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'examination_id' => 'required|integer|exists:examinations,id',
            'doctor_id' => 'sometimes|integer',
            'status' => 'required|in:draft,on_hold,approved',
            'hold_reason' => 'required_if:status,on_hold|nullable|string|max:2000',
            'items' => 'required|array|min:1|max:50',
            'items.*.drug_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|string|max:100',
            'items.*.dosage' => 'required|string|max:255',
            'items.*.instructions' => 'required|string|max:1000',
            'items.*.notes' => 'nullable|string|max:2000',
        ]);

        $prescription = DB::transaction(function () use ($request, $validated) {
            $examination = Examination::lockForUpdate()->findOrFail($validated['examination_id']);
            abort_unless($examination->doctor_id === $request->user()->id, 403, 'Pemeriksaan ini milik dokter lain.');
            if ($examination->care_decision !== 'rawat_jalan') {
                throw ValidationException::withMessages(['examination_id' => 'Pemeriksaan rawat inap tidak dapat dibuatkan resep rawat jalan.']);
            }
            if (count($examination->supporting_exams ?? []) > 0 && $validated['status'] === 'approved') {
                throw ValidationException::withMessages(['status' => 'Simpan resep sebagai ditahan sampai hasil pemeriksaan penunjang dikonfirmasi.']);
            }
            if ($examination->prescription()->exists()) {
                throw ValidationException::withMessages(['examination_id' => 'Pemeriksaan ini sudah memiliki resep. Buka resep yang sudah tersimpan.']);
            }
            $prescription = Prescription::create([
                'examination_id' => $examination->id,
                'doctor_id' => $request->user()->id,
                'status' => $validated['status'],
                'hold_reason' => $validated['status'] === 'on_hold' ? $validated['hold_reason'] : null,
                'tracking_code' => $validated['status'] === 'approved' ? $this->trackingCode() : null,
            ]);
            $prescription->items()->createMany($validated['items']);
            $prescription->statusEvents()->create([
                'to_status' => $prescription->status,
                'changed_by' => $request->user()->id,
                'created_at' => now(),
            ]);

            return $prescription->load('items');
        });

        return response()->json([
            'success' => true,
            'message' => 'Resep berhasil disimpan',
            'data' => ['prescription' => $prescription, 'tracking_code' => $prescription->tracking_code],
        ], 201);
    }

    public function index(Request $request)
    {
        $prescriptions = Prescription::with(['doctor:id,name', 'examination.patient', 'items', 'bpjsVerifier', 'statusEvents.actor'])
            ->when($request->user()->role === 'dokter', fn ($query) => $query->where('doctor_id', $request->user()->id))
            ->latest()->get();

        return response()->json(['success' => true, 'data' => $prescriptions]);
    }

    public function show($id)
    {
        return response()->json([
            'success' => true,
            'data' => Prescription::with(['doctor:id,name', 'examination.patient', 'items', 'bpjsVerifier', 'statusEvents.actor'])->findOrFail($id),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,on_hold,approved',
            'hold_reason' => 'required_if:status,on_hold|nullable|string|max:2000',
        ]);
        $prescription = DB::transaction(function () use ($request, $id, $validated) {
            $prescription = Prescription::lockForUpdate()->findOrFail($id);
            abort_unless($prescription->doctor_id === $request->user()->id, 403, 'Resep ini milik dokter lain.');
            if (! in_array($prescription->status, ['draft', 'on_hold'], true)) {
                throw ValidationException::withMessages(['status' => 'Resep yang sudah disahkan tidak dapat diubah melalui pengesahan dokter.']);
            }
            $from = $prescription->status;
            $prescription->update([
                'status' => $validated['status'],
                'hold_reason' => $validated['status'] === 'on_hold' ? $validated['hold_reason'] : null,
                'tracking_code' => $validated['status'] === 'approved' ? ($prescription->tracking_code ?? $this->trackingCode()) : $prescription->tracking_code,
            ]);
            if ($from !== $prescription->status) {
                $prescription->statusEvents()->create(['from_status' => $from, 'to_status' => $prescription->status, 'changed_by' => $request->user()->id, 'created_at' => now()]);
            }

            return $prescription;
        });

        return response()->json(['success' => true, 'message' => 'Resep berhasil diperbarui', 'data' => $prescription]);
    }

    public function track($code)
    {
        $prescription = Prescription::with(['items', 'examination.patient', 'doctor', 'statusEvents'])
            ->where('tracking_code', strtoupper(trim($code)))->first();
        if (! $prescription) {
            return response()->json(['success' => false, 'message' => 'Kode tracking tidak ditemukan. Periksa kembali kode dari dokter.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tracking_code' => $prescription->tracking_code,
                'status' => $prescription->status,
                'patient_name' => $prescription->examination?->patient?->name,
                'doctor_name' => $prescription->doctor?->name,
                'created_at' => $prescription->created_at,
                'updated_at' => $prescription->updated_at,
                'items' => $prescription->items->map->only(['drug_name', 'quantity', 'dosage', 'instructions']),
                'status_events' => $prescription->statusEvents->map->only(['to_status', 'created_at']),
            ],
        ])->header('Cache-Control', 'no-store, private')->header('X-Robots-Tag', 'noindex, nofollow');
    }

    private function trackingCode(): string
    {
        do {
            $code = 'MS-'.strtoupper(Str::random(6));
        } while (Prescription::where('tracking_code', $code)->exists());

        return $code;
    }
}
