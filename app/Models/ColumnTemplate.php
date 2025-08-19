<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ColumnTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'type',
        'label',
        'order',
        'data_type',
        'unit',
        'options',
        'date_format',
        'boolean_settings',
        'reference'
    ];

    protected $casts = [
        'options' => 'array',
        'boolean_settings' => 'array',
        'reference' => 'array'
    ];

    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}
