<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\ColumnTemplate as ColumnTemplate;

class Template extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function columns()
    {
        return $this->hasMany(ColumnTemplate::class);
    }

    public function rows()
    {
        return $this->hasMany(TableRow::class);
    }
}
