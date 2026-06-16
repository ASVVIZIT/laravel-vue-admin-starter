<?php

namespace Database\Seeders\Landing;

use App\Models\Landing\LandingPage;
use App\Models\Landing\SiteSetting;
use Illuminate\Database\Seeder;

class LandingPageSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🎨 Запуск сидера лендингов...');

        // Очищаем старые данные
        LandingPage::truncate();

        // 1. ЛИЧНЫЙ БРЕНД
        $personalBrand = LandingPage::create([
            'slug' => 'personal-brand',
            'title' => 'Личный бренд — Иван Петров',
            'type' => LandingPage::TYPE_PERSONAL_BRAND,
            'description' => 'Персональный сайт-визитка веб-разработчика',
            'is_active' => true,
            'is_published' => true,
            'published_at' => now(),
            'sort_order' => 1,
            'settings' => [
                'theme' => [
                    'primaryColor' => '#667eea',
                    'secondaryColor' => '#764ba2',
                    'accentColor' => '#f093fb',
                    'backgroundColor' => '#1a1a2e',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Иван Петров — Личный бренд',
                    'metaDescription' => 'Персональный сайт',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => '2026-11-25T23:59:59',
                    'title' => 'До запуска осталось',
                    'subtitle' => 'Скоро открытие',
                ],
            ],
            'blocks' => [
                [
                    'id' => 'hero-pb-1',
                    'type' => 'hero',
                    'enabled' => true,
                    'order' => 1,
                    'settings' => [
                        'logoIcon' => '👤',
                        'logoText' => 'ИВАН ПЕТРОВ',
                        'title' => 'Привет! Я Иван Петров',
                        'subtitle' => 'Веб-разработчик и дизайнер',
                        'stageBadge' => 'Открыт для предложений',
                        'stageBadgeEnabled' => true,
                        'textAlign' => 'center',
                    ],
                ],
                [
                    'id' => 'countdown-pb-1',
                    'type' => 'countdown',
                    'enabled' => true,
                    'order' => 2,
                    'settings' => [
                        'targetDate' => '2026-11-25T23:59:59',
                        'title' => 'До запуска осталось',
                        'subtitle' => 'Скоро открытие нового проекта',
                        'showProgressBar' => true,
                    ],
                ],
                [
                    'id' => 'features-pb-1',
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
                                'done' => ['Landing pages', 'Интернет-магазины', 'Корпоративные сайты'],
                                'todo' => ['Веб-приложения', 'CRM системы'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Laravel · Vue.js · Tailwind',
                            ],
                            [
                                'icon' => '🎨',
                                'title' => 'Дизайн',
                                'status' => 'stable',
                                'description' => 'UI/UX дизайн',
                                'done' => ['Прототипы', 'Макеты', 'Адаптив'],
                                'todo' => ['3D дизайн', 'Анимации'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Figma · Adobe XD',
                            ],
                            [
                                'icon' => '📱',
                                'title' => 'Консультации',
                                'status' => 'beta',
                                'description' => 'Технические консультации',
                                'done' => ['Аудит кода', 'Архитектура'],
                                'todo' => ['Менторство', 'Курсы'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Zoom · Google Meet',
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-pb-1',
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'text' => '© 2026 Иван Петров',
                        'copyright' => 'Все права защищены',
                        'showSocialLinks' => true,
                        'socialLinks' => [
                            ['icon' => '📧', 'url' => 'mailto:ivan@example.com'],
                            ['icon' => '💬', 'url' => 'https://t.me/ivanpetrov'],
                            ['icon' => '💼', 'url' => 'https://linkedin.com/in/ivanpetrov'],
                        ],
                    ],
                ],
            ],
        ]);

        // 2. МАГАЗИН
        $shop = LandingPage::create([
            'slug' => 'shop-landing',
            'title' => 'Магазин электроники — TechStore',
            'type' => LandingPage::TYPE_SHOP,
            'description' => 'Интернет-магазин электроники и гаджетов',
            'is_active' => true,
            'is_published' => true,
            'published_at' => now(),
            'sort_order' => 2,
            'settings' => [
                'theme' => [
                    'primaryColor' => '#11998e',
                    'secondaryColor' => '#38ef7d',
                    'accentColor' => '#f093fb',
                    'backgroundColor' => '#0f2027',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'TechStore — Магазин электроники',
                    'metaDescription' => 'Лучшие цены на электронику',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => '2026-12-01T00:00:00',
                    'title' => 'Открытие магазина',
                    'subtitle' => 'Скидки до 50% на первый заказ',
                ],
            ],
            'blocks' => [
                [
                    'id' => 'hero-shop-1',
                    'type' => 'hero',
                    'enabled' => true,
                    'order' => 1,
                    'settings' => [
                        'logoIcon' => '🛒',
                        'logoText' => 'TECHSTORE',
                        'title' => 'Современная электроника',
                        'subtitle' => 'Лучшие цены и быстрая доставка',
                        'stageBadge' => 'Открытие 1 декабря',
                        'stageBadgeEnabled' => true,
                        'textAlign' => 'center',
                    ],
                ],
                [
                    'id' => 'countdown-shop-1',
                    'type' => 'countdown',
                    'enabled' => true,
                    'order' => 2,
                    'settings' => [
                        'targetDate' => '2026-12-01T00:00:00',
                        'title' => 'До открытия осталось',
                        'subtitle' => 'Подпишитесь на новости и получите скидку 10%',
                        'showProgressBar' => true,
                    ],
                ],
                [
                    'id' => 'techstack-shop-1',
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
                                    ['name' => 'Xiaomi', 'version' => '14 Ultra', 'icon' => '🔶', 'note' => 'Топ за свои'],
                                ],
                            ],
                            [
                                'title' => 'Ноутбуки',
                                'icon' => '💻',
                                'color' => '#38ef7d',
                                'items' => [
                                    ['name' => 'MacBook', 'version' => 'Pro/Air', 'icon' => '🍎', 'note' => 'Apple'],
                                    ['name' => 'ASUS', 'version' => 'ROG/ZenBook', 'icon' => '🎮', 'note' => 'Игровые'],
                                    ['name' => 'Lenovo', 'version' => 'ThinkPad', 'icon' => '💼', 'note' => 'Бизнес'],
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-shop-1',
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'text' => '© 2026 TechStore. Все права защищены',
                        'copyright' => 'Доставка по всей России',
                        'showSocialLinks' => true,
                        'socialLinks' => [
                            ['icon' => '📞', 'url' => 'tel:+78001234567'],
                            ['icon' => '📧', 'url' => 'mailto:info@techstore.ru'],
                            ['icon' => '💬', 'url' => 'https://t.me/techstore'],
                        ],
                    ],
                ],
            ],
        ]);

        // 3. ПОРТФОЛИО
        $portfolio = LandingPage::create([
            'slug' => 'portfolio-landing',
            'title' => 'Портфолио — Анна Смирнова',
            'type' => LandingPage::TYPE_PORTFOLIO,
            'description' => 'Портфолио веб-дизайнера и разработчика',
            'is_active' => true,
            'is_published' => true,
            'published_at' => now(),
            'sort_order' => 3,
            'settings' => [
                'theme' => [
                    'primaryColor' => '#4facfe',
                    'secondaryColor' => '#00f2fe',
                    'accentColor' => '#43e97b',
                    'backgroundColor' => '#0f0c29',
                    'textColor' => '#ffffff',
                    'fontFamily' => 'Inter, sans-serif',
                ],
                'seo' => [
                    'metaTitle' => 'Анна Смирнова — Портфолио',
                    'metaDescription' => 'Веб-дизайнер и разработчик',
                    'robots' => 'index',
                ],
                'countdown' => [
                    'targetDate' => '2026-11-25T23:59:59',
                    'title' => 'Портфолио',
                    'subtitle' => 'Мои работы и проекты',
                ],
            ],
            'blocks' => [
                [
                    'id' => 'hero-port-1',
                    'type' => 'hero',
                    'enabled' => true,
                    'order' => 1,
                    'settings' => [
                        'logoIcon' => '🎨',
                        'logoText' => 'АННА СМИРНОВА',
                        'title' => 'Веб-дизайнер & Разработчик',
                        'subtitle' => 'Создаю красивые и функциональные сайты',
                        'stageBadge' => 'Открыта для проектов',
                        'stageBadgeEnabled' => true,
                        'textAlign' => 'center',
                    ],
                ],
                [
                    'id' => 'progress-port-1',
                    'type' => 'progress',
                    'enabled' => true,
                    'order' => 2,
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
                    'id' => 'techstack-port-1',
                    'type' => 'techstack',
                    'enabled' => true,
                    'order' => 3,
                    'settings' => [
                        'title' => 'Навыки и технологии',
                        'showCount' => true,
                        'categories' => [
                            [
                                'title' => 'Design',
                                'icon' => '🎨',
                                'color' => '#4facfe',
                                'items' => [
                                    ['name' => 'Figma', 'version' => 'Expert', 'icon' => '📐', 'note' => 'UI/UX'],
                                    ['name' => 'Adobe XD', 'version' => 'Advanced', 'icon' => '🎭', 'note' => 'Прототипы'],
                                    ['name' => 'Photoshop', 'version' => 'Advanced', 'icon' => '🖼️', 'note' => 'Графика'],
                                ],
                            ],
                            [
                                'title' => 'Development',
                                'icon' => '💻',
                                'color' => '#43e97b',
                                'items' => [
                                    ['name' => 'HTML/CSS', 'version' => 'Expert', 'icon' => '🌐', 'note' => 'Верстка'],
                                    ['name' => 'JavaScript', 'version' => 'Advanced', 'icon' => '⚡', 'note' => 'ES6+'],
                                    ['name' => 'Vue.js', 'version' => 'Intermediate', 'icon' => '💚', 'note' => 'Frontend'],
                                ],
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'features-port-1',
                    'type' => 'features',
                    'enabled' => true,
                    'order' => 4,
                    'settings' => [
                        'title' => 'Избранные проекты',
                        'columns' => 2,
                        'items' => [
                            [
                                'icon' => '🛍️',
                                'title' => 'Интернет-магазин',
                                'status' => 'stable',
                                'description' => 'E-commerce платформа',
                                'done' => ['Каталог', 'Корзина', 'Оплата'],
                                'todo' => ['Отзывы', 'Рейтинги'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Laravel · Vue.js · MySQL',
                            ],
                            [
                                'icon' => '📊',
                                'title' => 'CRM система',
                                'status' => 'stable',
                                'description' => 'Управление клиентами',
                                'done' => ['CRM', 'Отчеты', 'API'],
                                'todo' => ['Мобильное приложение'],
                                'bugs' => [],
                                'untested' => [],
                                'stack' => 'Laravel · React · PostgreSQL',
                            ],
                        ],
                    ],
                ],
                [
                    'id' => 'footer-port-1',
                    'type' => 'footer',
                    'enabled' => true,
                    'order' => 5,
                    'settings' => [
                        'text' => '© 2026 Анна Смирнова',
                        'copyright' => 'Свяжитесь со мной для сотрудничества',
                        'showSocialLinks' => true,
                        'socialLinks' => [
                            ['icon' => '📧', 'url' => 'mailto:anna@example.com'],
                            ['icon' => '💬', 'url' => 'https://t.me/annasmirnova'],
                            ['icon' => '📸', 'url' => 'https://instagram.com/annasmirnova'],
                        ],
                    ],
                ],
            ],
        ]);

        // 4. Настройка режима сайта
        SiteSetting::updateOrCreate(
            ['key' => 'public_mode'],
            [
                'value' => [
                    'mode' => 'maintenance',
                    'active_landing_id' => $personalBrand->id,
                    'maintenance' => [
                        'enabled' => true,
                        'title' => 'Сайт в разработке',
                        'message' => 'Мы готовим что-то невероятное',
                        'target_date' => '2026-11-25T23:59:59',
                        'show_countdown' => true,
                    ],
                    'landing' => [
                        'enabled' => false,
                        'page_id' => null,
                        'url_path' => '/',
                    ],
                    'production' => [
                        'enabled' => false,
                        'features' => [],
                    ],
                ],
                'description' => 'Режим работы публичной части',
                'group' => 'public',
            ]
        );

        $this->command->info('✅ Создано лендингов: 3');
        $this->command->info('   📄 personal-brand — ' . $personalBrand->title);
        $this->command->info('   🛒 shop-landing — ' . $shop->title);
        $this->command->info('   🎨 portfolio-landing — ' . $portfolio->title);
        $this->command->info('✅ Настроен режим сайта: maintenance');
    }
}
