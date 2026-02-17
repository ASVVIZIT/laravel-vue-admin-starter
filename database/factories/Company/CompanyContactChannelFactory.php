<?php

namespace Database\Factories\Company;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel; // Используем обновлённый путь

class CompanyContactChannelFactory extends Factory
{
    protected $model = CompanyContactChannel::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['social_network', 'messenger', 'messenger_group', 'gis_map', 'yandex_map', 'email', 'phone_number', 'website']);

        $titleSuffixes = [
            'social_network' => 'Social',
            'messenger' => 'Chat',
            'messenger_group' => 'Group',
            'gis_map' => 'Map',
            'yandex_map' => 'Yandex Map',
            'email' => 'Email',
            'phone_number' => 'Phone',
            'website' => 'Website',
        ];

        $title = $this->faker->company() . ' ' . ($titleSuffixes[$type] ?? 'Contact');

        $baseData = [
            'type' => $type,
            'title' => $title,
            'description' => $this->faker->optional()->sentence(),
            'logo_url' => $this->faker->optional()->imageUrl(64, 64, 'business'), // Просто пример
            'order_column' => $this->faker->numberBetween(0, 100),
            'is_active' => $this->faker->boolean(90), // 90% активных
        ];

        switch ($type) {
            case 'social_network':
            case 'messenger': // Для простоты messenger и messenger_group могут использовать URL
            case 'messenger_group':
            case 'website':
                $baseData['url'] = $this->faker->url();
                break;
            case 'email':
                $baseData['identifier'] = $this->faker->safeEmail();
                break;
            case 'phone_number':
                $baseData['identifier'] = $this->faker->phoneNumber();
                break;
            case 'gis_map':
            case 'yandex_map':
                // Для карт можно сгенерировать координаты или embed код
                $baseData['metadata'] = [
                    'coordinates' => [
                        'lat' => $this->faker->latitude(),
                        'lng' => $this->faker->longitude(),
                    ],
                    'embed_code' => '<iframe src="https://example-map.com/embed?lat=' . $baseData['metadata']['coordinates']['lat'] . '&lng=' . $baseData['metadata']['coordinates']['lng'] . '" width="600" height="400" frameborder="0"></iframe>',
                    'provider' => $type === 'gis_map' ? '2gis' : 'yandex',
                ];
                break;
            default:
                // Для типов, не требующих url или identifier, можно оставить пустыми или добавить специфичные метаданные
                break;
        }

        // Привязываем к случайной компании (предполагается, что компании уже существуют)
        $baseData['company_id'] = Company::inRandomOrder()->first()?->id ?? 1; // Если нет компаний, привязываем к id=1

        return $baseData;
    }
}
