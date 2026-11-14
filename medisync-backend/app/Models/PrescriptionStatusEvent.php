<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PrescriptionStatusEvent extends Model
{
    public $timestamps = false;

    protected $fillable = ['from_status', 'to_status', 'changed_by', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'changed_by')->select(['id', 'name']);
    }
}
