<?php

namespace App\Models\Landing;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;

class LandingPage extends Model
{
    use HasFactory, SoftDeletes;

    // ===== ТИПЫ ЛЕНДИНГОВ =====
    public const TYPE_CUSTOM = 'custom';
    public const TYPE_PERSONAL_BRAND = 'personal_brand';
    public const TYPE_SHOP = 'shop';
    public const TYPE_PORTFOLIO = 'portfolio';

    public const TYPES = [
        self::TYPE_CUSTOM,
        self::TYPE_PERSONAL_BRAND,
        self::TYPE_SHOP,
        self::TYPE_PORTFOLIO,
    ];

    protected $table = 'landing_pages';

    protected $fillable = [
        'slug',
        'title',
        'type',
        'description',
        'settings',
        'blocks',
        'is_active',
        'is_published',
        'published_at',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'settings' => 'array',
        'blocks' => 'array',
        'is_active' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    protected $appends = ['public_url', 'blocks_count'];

    // ========================================================================
    // BOOT
    // ========================================================================
    protected static function boot()
    {
        parent::boot();

        static::saved(function ($page) {
            Cache::forget('landing_page_' . $page->slug);
            Cache::forget('landing_pages_list');
        });

        static::deleted(function ($page) {
            Cache::forget('landing_page_' . $page->slug);
        });
    }

    // ========================================================================
    // СВЯЗИ
    // ========================================================================
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // ========================================================================
    // SCOPES
    // ========================================================================
    public function scopePublished($query)
    {
        return $query->where('is_published', true)
            ->where('is_active', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeBySlug($query, string $slug)
    {
        return $query->where('slug', $slug);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('created_at', 'desc');
    }

    // ========================================================================
    // ACCESSORS
    // ========================================================================
    public function getPublicUrlAttribute(): string
    {
        return url('/' . $this->slug);
    }

    public function getBlocksCountAttribute(): int
    {
        return is_array($this->blocks) ? count($this->blocks) : 0;
    }

    // ========================================================================
    // МЕТОДЫ ПУБЛИКАЦИИ
    // ========================================================================
    public function publish(): self
    {
        $this->update([
            'is_published' => true,
            'published_at' => $this->published_at ?? now(),
        ]);
        return $this;
    }

    public function unpublish(): self
    {
        $this->update(['is_published' => false]);
        return $this;
    }

    public function togglePublish(): self
    {
        return $this->is_published ? $this->unpublish() : $this->publish();
    }

    // ========================================================================
    // РАБОТА С БЛОКАМИ
    // ========================================================================
    public function getSortedBlocks(): array
    {
        $blocks = $this->blocks ?? [];
        usort($blocks, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));
        return array_values($blocks);
    }

    public function getEnabledBlocks(): array
    {
        return array_values(array_filter(
            $this->getSortedBlocks(),
            fn($block) => $block['enabled'] ?? true
        ));
    }

    public function addBlock(array $block): self
    {
        $blocks = $this->blocks ?? [];
        $block['id'] = $block['id'] ?? $block['type'] . '-' . uniqid();
        $block['order'] = $block['order'] ?? (count($blocks) + 1);
        $block['enabled'] = $block['enabled'] ?? true;
        $blocks[] = $block;
        $this->update(['blocks' => $blocks]);
        return $this;
    }

    public function removeBlock(string $blockId): self
    {
        $blocks = array_values(array_filter(
            $this->blocks ?? [],
            fn($block) => ($block['id'] ?? '') !== $blockId
        ));
        $this->update(['blocks' => $blocks]);
        return $this;
    }

    public function updateBlock(string $blockId, array $newSettings): self
    {
        $blocks = array_map(function ($block) use ($blockId, $newSettings) {
            if (($block['id'] ?? '') === $blockId) {
                return array_merge($block, $newSettings);
            }
            return $block;
        }, $this->blocks ?? []);

        $this->update(['blocks' => $blocks]);
        return $this;
    }

    public function reorderBlocks(array $orderedIds): self
    {
        $blocks = $this->blocks ?? [];
        $orderMap = array_flip($orderedIds);

        $blocks = array_map(function ($block) use ($orderMap) {
            $id = $block['id'] ?? '';
            if (isset($orderMap[$id])) {
                $block['order'] = $orderMap[$id] + 1;
            }
            return $block;
        }, $blocks);

        usort($blocks, fn($a, $b) => ($a['order'] ?? 0) <=> ($b['order'] ?? 0));
        $this->update(['blocks' => array_values($blocks)]);
        return $this;
    }

    // ========================================================================
    // ПУБЛИЧНЫЕ ДАННЫЕ
    // ========================================================================
    public function getPublicData(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'type' => $this->type,
            'description' => $this->description,
            'is_published' => $this->is_published,
            'settings' => $this->settings,
            'blocks' => $this->getEnabledBlocks(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }

    public function getAdminData(): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'type' => $this->type,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->toIso8601String(),
            'sort_order' => $this->sort_order,
            'settings' => $this->settings,
            'blocks' => $this->getSortedBlocks(),
            'blocks_count' => $this->blocks_count,
            'public_url' => $this->public_url,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
