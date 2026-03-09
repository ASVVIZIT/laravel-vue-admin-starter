<?php // resources/app/Models/Company/CompanyContactChannel.php

namespace App\Models\Company;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// Используем обновлённый путь к Company
use App\Models\Company\Company;

class CompanyContactChannel extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id', 'type', 'title', 'description', 'logo_url',
        'url', 'identifier', 'metadata', 'order_column', 'is_active'
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
    ];

    public function company()
    {
        // Указываем полный путь к модели Company
        return $this->belongsTo(Company::class, 'company_id');
    }

    // Вспомогательные методы для удобства работы с metadata
    public function getSpecificData(string $key, $default = null)
    {
        $metadata = $this->metadata ?? [];
        return $metadata[$key] ?? $default;
    }

    public function setSpecificData(string $key, $value): self
    {
        $metadata = $this->metadata ?? [];
        $metadata[$key] = $value;
        $this->metadata = $metadata;
        return $this;
    }
}
