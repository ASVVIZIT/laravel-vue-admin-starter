<?php
// app/Models/Template.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function columns(): HasMany
    {
        return $this->hasMany(ColumnTemplate::class)
            ->orderBy('order');
    }

    public function rows(): HasMany
    {
        return $this->hasMany(TableRow::class);
    }
}
