<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PrescriptionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'prescription_id',
        'drug_name',
        'quantity',
        'dosage',
        'instructions',
        'notes',
    ];

    // Relasi: PrescriptionItem milik satu Prescription
    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }
}
