<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Examination;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function doctor(Request $request)
    {
        $start = now('Asia/Jakarta')->startOfDay()->utc();
        $end = now('Asia/Jakarta')->endOfDay()->utc();
        $examinations = Examination::where('doctor_id', $request->user()->id)->whereBetween('created_at', [$start, $end]);
        $prescriptions = Prescription::where('doctor_id', $request->user()->id)->whereBetween('created_at', [$start, $end]);

        return response()->json([
            'success' => true,
            'data' => [
                'registered_patients' => Patient::count(),
                'examinations_today' => $examinations->count(),
                'prescriptions_today' => (clone $prescriptions)->count(),
                'sent_today' => (clone $prescriptions)->whereNotNull('tracking_code')->count(),
                'patients' => Patient::latest()->limit(3)->get(),
                'prescriptions' => Prescription::with(['examination.patient', 'items'])
                    ->where('doctor_id', $request->user()->id)->latest()->limit(3)->get(),
            ],
        ]);
    }
}
