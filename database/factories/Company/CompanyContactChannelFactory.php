<?php

namespace Database\Factories\Company;

use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company\CompanyContactChannel>
 */
class CompanyContactChannelFactory extends Factory
{
    protected $model = CompanyContactChannel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = [
            'social_network',
            'messenger',
            'messenger_group',
            'gis_map',
            'yandex_map',
            'email',
            'phone_number',
            'website',
        ];

        $type = $this->faker->randomElement($types);
        $company = Company::factory();

        $baseData = [
            'company_id' => $company,
            'type' => $type,
            'title' => $this->generateTitle($type),
            'description' => $this->faker->optional(0.7)->sentence(10),
            'logo_url' => $this->faker->optional(0.5)->imageUrl(64, 64, 'business'),
            'order_column' => 0,
            'is_active' => $this->faker->boolean(90),
        ];

        return array_merge($baseData, $this->getTypeSpecificData($type));
    }

    /**
     * Generate title based on type.
     */
    private function generateTitle(string $type): string
    {
        $titles = [
            'social_network' => "Social Network Channel",
            'messenger' => "Messenger Channel",
            'messenger_group' => "Messenger Group",
            'gis_map' => "2GIS Map",
            'yandex_map' => "Yandex Map",
            'email' => "Email Channel",
            'phone_number' => "Phone Channel",
            'website' => "Website",
        ];

        return $titles[$type] ?? "Channel";
    }

    /**
     * Get type-specific data.
     */
    private function getTypeSpecificData(string $type): array
    {
        return match($type) {
            'social_network' => [
                'url' => $this->faker->url(),
                'identifier' => $this->faker->userName(),
                'metadata' => [
                    'followers' => $this->faker->numberBetween(100, 50000),
                    'platform' => $this->faker->randomElement(['vk', 'facebook', 'instagram', 'twitter']),
                ],
            ],
            'messenger' => [
                'url' => 'https://wa.me/' . $this->faker->phoneNumber(),
                'identifier' => $this->faker->phoneNumber(),
                'metadata' => [
                    'is_business' => $this->faker->boolean(70),
                    'platform' => 'whatsapp',
                ],
            ],
            'messenger_group' => [
                'url' => 'https://t.me/' . $this->faker->userName() . '_group',
                'metadata' => [
                    'member_count' => $this->faker->numberBetween(50, 5000),
                    'is_public' => $this->faker->boolean(80),
                    'platform' => 'telegram',
                ],
            ],
            'gis_map' => [
                'metadata' => [
                    'provider' => '2gis',
                    'coordinates' => [
                        'lat' => $this->faker->latitude(55, 56),
                        'lng' => $this->faker->longitude(37, 38),
                    ],
                    'embed_code' => '<iframe src="https://map.2gis.com/embed" width="600" height="400"></iframe>',
                ],
            ],
            'yandex_map' => [
                'metadata' => [
                    'provider' => 'yandex',
                    'coordinates' => [
                        'lat' => $this->faker->latitude(55, 56),
                        'lng' => $this->faker->longitude(37, 38),
                    ],
                    'embed_code' => '<iframe src="https://yandex.ru/map-widget" width="600" height="400"></iframe>',
                ],
            ],
            'email' => [
                'identifier' => $this->faker->safeEmail(),
                'metadata' => ['is_primary' => $this->faker->boolean(50)],
            ],
            'phone_number' => [
                'identifier' => $this->faker->phoneNumber(),
                'metadata' => [
                    'is_primary' => $this->faker->boolean(50),
                    'is_whatsapp' => $this->faker->boolean(60),
                ],
            ],
            'website' => [
                'url' => $this->faker->url(),
                'metadata' => ['is_primary' => $this->faker->boolean(50)],
            ],
            default => [],
        };
    }

    /**
     * Indicate that the channel is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the channel is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the channel is a social network.
     */
    public function socialNetwork(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'social_network',
        ]);
    }

    /**
     * Indicate that the channel is a messenger.
     */
    public function messenger(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'messenger',
        ]);
    }

    /**
     * Indicate that the channel is a GIS map.
     */
    public function gisMap(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'gis_map',
        ]);
    }

    /**
     * Indicate that the channel is a Yandex map.
     */
    public function yandexMap(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'yandex_map',
        ]);
    }
}
