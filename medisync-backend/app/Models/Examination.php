<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examination extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'complaints',
        'history',
        'diagnosis',
        'supporting_exams',
        'care_decision',
    ];

    protected $casts = [
        'supporting_exams' => 'array',
    ];

    // Relasi: Examination milik satu Patient
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    // Relasi: Examination milik satu Doctor (User)
    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    // Relasi: Examination punya satu Prescription
    public function prescription()
    {
        return $this->hasOne(Prescription::class);
    }
}
