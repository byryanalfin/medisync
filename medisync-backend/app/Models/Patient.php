<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        'rm_number',
        'name',
        'birth_date',
        'gender',
        'allergies',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    // Relasi: Patient punya banyak Examination
    public function examinations()
    {
        return $this->hasMany(Examination::class);
    }
}
