<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'examination_id',
        'doctor_id',
        'status',
        'hold_reason',
        'tracking_code',
        'bpjs_card_checked',
        'bpjs_identity_checked',
        'bpjs_documents_checked',
        'bpjs_notes',
        'bpjs_checked_by',
        'bpjs_checked_at',
        'bpjs_verified_at',
    ];

    protected function casts(): array
    {
        return [
            'bpjs_card_checked' => 'boolean',
            'bpjs_identity_checked' => 'boolean',
            'bpjs_documents_checked' => 'boolean',
            'bpjs_checked_at' => 'datetime',
            'bpjs_verified_at' => 'datetime',
        ];
    }

    public function bpjsVerifier()
    {
        return $this->belongsTo(User::class, 'bpjs_checked_by')->select(['id', 'name']);
    }

    public function statusEvents()
    {
        return $this->hasMany(PrescriptionStatusEvent::class)->orderBy('id');
    }

    // Relasi: Prescription milik satu Examination
    public function examination()
    {
        return $this->belongsTo(Examination::class);
    }

    // Relasi: Prescription milik satu Doctor (User)
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Relasi: Prescription punya banyak PrescriptionItem
    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}
