<?php

namespace Database\Factories\Landing;

use App\Models\Landing\LandingPage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class LandingPageFactory extends Factory
{
    protected $model = LandingPage::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(LandingPage::TYPES);

        return [
            'slug' => $this->faker->unique()->slug(3),
            'title' => $this->faker->sentence(3),
            'type' => $type,
            'description' => $this->faker->paragraph(),
            'settings' => $this->getDefaultSettings($type),
            'blocks' => $this->getDefaultBlocks($type),
            'is_active' => true,
            'is_published' => $this->faker->boolean(70),
            'published_at' => $this->faker->boolean(70) ? now() : null,
            'sort_order' => $this->faker->numberBetween(1, 100),
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }

    // ===== СОСТОЯНИЯ =====

    public function personalBrand(): static
    {
        return $this->state(fn() => [
            'type' => LandingPage::TYPE_PERSONAL_BRAND,
            'title' => 'Личный бренд — ' . $this->faker->name(),
            'slug' => 'personal-' . $this->faker->unique()->slug(2),
        ]);
    }

    public function shop(): static
    {
        return $this->state(fn() => [
            'type' => LandingPage::TYPE_SHOP,
            'title' => 'Магазин — ' . $this->faker->company(),
            'slug' => 'shop-' . $this->faker->unique()->slug(2),
        ]);
    }

    public function portfolio(): static
    {
        return $this->state(fn() => [
            'type' => LandingPage::TYPE_PORTFOLIO,
            'title' => 'Портфолио — ' . $this->faker->jobTitle(),
            'slug' => 'portfolio-' . $this->faker->unique()->slug(2),
        ]);
    }

    public function custom(): static
    {
        return $this->state(fn() => [
            'type' => LandingPage::TYPE_CUSTOM,
            'title' => 'Кастомный лендинг — ' . $this->faker->catchPhrase(),
        ]);
    }

    public function published(): static
    {
        return $this->state(fn() => [
            'is_published' => true,
            'published_at' => now(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn() => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }

    public function active(): static
    {
        return $this->state(fn() => ['is_active' => true]);
    }

    public function inactive(): static
    {
        return $this->state(fn() => ['is_active' => false]);
    }

    // ===== ВНУТРЕННИЕ МЕТОДЫ =====

    private function getDefaultSettings(string $type): array
    {
        return match($type) {
            LandingPage::TYPE_PERSONAL_BRAND => [
                'theme' => [
                    'primaryColor' => '#667eea',
                    'secondaryColor' => '#764ba2',
                    'accentColor' => '#f093fb',
                    'backgroundColor' => '#1a1a2e',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Личный бренд',
                    'metaDescription' => 'Персональный сайт-визитка',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => now()->addMonths(3)->toIso8601String(),
                    'title' => 'До запуска осталось',
                ],
            ],
            LandingPage::TYPE_SHOP => [
                'theme' => [
                    'primaryColor' => '#11998e',
                    'secondaryColor' => '#38ef7d',
                    'accentColor' => '#f093fb',
                    'backgroundColor' => '#0f2027',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Интернет-магазин',
                    'metaDescription' => 'Лучшие цены и быстрая доставка',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => now()->addMonths(2)->toIso8601String(),
                    'title' => 'Открытие магазина',
                    'subtitle' => 'Скидки до 50%',
                ],
            ],
            LandingPage::TYPE_PORTFOLIO => [
                'theme' => [
                    'primaryColor' => '#4facfe',
                    'secondaryColor' => '#00f2fe',
                    'accentColor' => '#43e97b',
                    'backgroundColor' => '#0f0c29',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Портфолио',
                    'metaDescription' => 'Мои работы и проекты',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => now()->addMonths(4)->toIso8601String(),
                    'title' => 'Портфолио',
                ],
            ],
            default => [
                'theme' => [
                    'primaryColor' => '#ff6b35',
                    'secondaryColor' => '#f7931e',
                    'accentColor' => '#ff4757',
                    'backgroundColor' => '#0a0e27',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Landing Page',
                    'metaDescription' => '',
                    'robots' => 'noindex',
                ],
            ],
        };
    }

    private function getDefaultBlocks(string $type): array
    {
        $base = [
            [
                'id' => 'hero-' . uniqid(),
                'type' => 'hero',
                'enabled' => true,
                'order' => 1,
                'settings' => [
                    'logoIcon' => '🔥',
                    'logoText' => 'FENIX',
                    'title' => $this->faker->sentence(3),
                    'subtitle' => $this->faker->sentence(6),
                    'stageBadge' => 'Стадия 1 из 3',
                    'stageBadgeEnabled' => true,
                    'textAlign' => 'center',
                ],
            ],
            [
                'id' => 'countdown-' . uniqid(),
                'type' => 'countdown',
                'enabled' => true,
                'order' => 2,
                'settings' => [
                    'targetDate' => now()->addDays(rand(30, 365))->toIso8601String(),
                    'title' => 'До запуска осталось',
                    'subtitle' => $this->faker->sentence(4),
                    'showProgressBar' => true,
                ],
            ],
        ];

        $typeBlocks = match($type) {
            LandingPage::TYPE_PERSONAL_BRAND => [
                [
                    'id' => 'features-' . uniqid(),
                    'type' => 'features',
                    'enabled' => true,
                    'order' => 3,
                    'settings' => [
                        'title' => 'Мои услуги',
                        'columns' => 3,
                        'items' => [
                            [
                                'icon' => '💻',
                                'title' => 'Веб-разработка',
                                'status' => 'stable',
                                'description' => 'Создание сайтов под ключ',
                                'done' => ['Landing pages', 'Интернет-магазины'],
                                'todo' => ['Веб-приложения'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Laravel · Vue.js · Tailwind',
                            ],
                            [
                                'icon' => '🎨',
                                'title' => 'Дизайн',
                                'status' => 'stable',
                                'description' => 'UI/UX дизайн',
                                'done' => ['Прототипы', 'Макеты'],
                                'todo' => ['3D дизайн'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Figma · Adobe XD',
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-' . uniqid(),
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'text' => '© ' . date('Y') . ' Личный бренд',
                        'copyright' => 'Все права защищены',
                        'showSocialLinks' => true,
                        'socialLinks' => [
                            ['icon' => '📧', 'url' => 'mailto:hello@example.com'],
                            ['icon' => '💬', 'url' => 'https://t.me/username'],
                        ],
                    ],
                ],
            ],
            LandingPage::TYPE_SHOP => [
                [
                    'id' => 'techstack-' . uniqid(),
                    'type' => 'techstack',
                    'enabled' => true,
                    'order' => 3,
                    'settings' => [
                        'title' => 'Категории товаров',
                        'showCount' => true,
                        'categories' => [
                            [
                                'title' => 'Смартфоны',
                                'icon' => '📱',
                                'color' => '#11998e',
                                'items' => [
                                    ['name' => 'Apple iPhone', 'version' => '15 Pro', 'icon' => '🍎', 'note' => 'Флагманы'],
                                    ['name' => 'Samsung', 'version' => 'Galaxy S24', 'icon' => '🌌', 'note' => 'Android'],
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-' . uniqid(),
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'text' => '© ' . date('Y') . ' Shop',
                        'copyright' => 'Доставка по всей России',
                        'showSocialLinks' => true,
                        'socialLinks' => [
                            ['icon' => '📞', 'url' => 'tel:+78001234567'],
                        ],
                    ],
                ],
            ],
            LandingPage::TYPE_PORTFOLIO => [
                [
                    'id' => 'progress-' . uniqid(),
                    'type' => 'progress',
                    'enabled' => true,
                    'order' => 3,
                    'settings' => [
                        'title' => 'Мой опыт',
                        'showPercentage' => true,
                        'stages' => [
                            ['name' => '5+ лет опыта', 'active' => false, 'completed' => true],
                            ['name' => '50+ проектов', 'active' => false, 'completed' => true],
                            ['name' => '30+ клиентов', 'active' => true, 'completed' => false],
                        ],
                    ],
                ],
                [
                    'id' => 'techstack-' . uniqid(),
                    'type' => 'techstack',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'title' => 'Навыки',
                        'showCount' => true,
                        'categories' => [
                            [
                                'title' => 'Design',
                                'icon' => '🎨',
                                'color' => '#4facfe',
                                'items' => [
                                    ['name' => 'Figma', 'version' => 'Expert', 'icon' => '📐', 'note' => 'UI/UX'],
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-' . uniqid(),
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 5,
                    'settings' => [
                        'text' => '© ' . date('Y') . ' Portfolio',
                        'copyright' => 'Свяжитесь со мной',
                        'showSocialLinks' => true,
                        'socialLinks' => [],
                    ],
                ],
            ],
            default => [
                [
                    'id' => 'progress-' . uniqid(),
                    'type' => 'progress',
                    'enabled' => true,
                    'order' => 3,
                    'settings' => [
                        'title' => 'Прогресс разработки',
                        'showPercentage' => true,
                        'stages' => [
                            ['name' => 'Архитектура', 'active' => true, 'completed' => false],
                            ['name' => 'Функционал', 'active' => false, 'completed' => false],
                            ['name' => 'Релиз', 'active' => false, 'completed' => false],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-' . uniqid(),
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'text' => 'Разработано с ❤️',
                        'copyright' => '© ' . date('Y') . ' FenixPortal',
                        'showSocialLinks' => false,
                        'socialLinks' => [],
                    ],
                ],
            ],
        };

        return array_merge($base, $typeBlocks);
    }
}
