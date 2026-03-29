<?php

namespace Database\Seeders\CompanyContactChannels;

use App\Models\Company\Company;
use App\Models\Company\CompanyContactChannel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

/**
 * ============================================================================
 * FAST COMPANY CONTACT CHANNEL SEEDER — БЫСТРЫЙ СИДИНГ КАНАЛОВ (BATCH INSERT)
 * ============================================================================
 * 📁 Путь: database/seeders/CompanyContactChannels/FastCompanyContactChannelSeeder.php
 * ✅ Используется: Быстрый запуск для больших объёмов данных
 * ✅ Безопасно менять — влияет только на скорость сидинга
 * ============================================================================
 */
class FastCompanyContactChannelSeeder extends Seeder
{
    /**
     * Настройки по умолчанию
     */
    protected const CHANNELS_PER_COMPANY = 7;
    protected const BATCH_SIZE = 1000;
    protected const COMPANY_CHUNK_SIZE = 100;
    protected const PROGRESS_INTERVAL = 5000;

    /**
     * Доступные типы каналов
     */
    protected const CHANNEL_TYPES = [
        'social_network',
        'messenger',
        'messenger_group',
        'gis_map',
        'yandex_map',
        'email',
        'phone_number',
        'website',
    ];

    /**
     * Запустить сидер.
     */
    public function run(): void
    {
        $totalCompanies = Company::count();

        if ($totalCompanies === 0) {
            $this->command->error("❌ No companies found! Run CompanySeeder first.");
            return;
        }

        $totalChannels = $totalCompanies * self::CHANNELS_PER_COMPANY;

        $this->command->info("🚀 Starting FAST channel seeding (batch insert)...");
        $this->command->info("📊 Companies: {$totalCompanies}");
        $this->command->info("📊 Channels per company: " . self::CHANNELS_PER_COMPANY);
        $this->command->info("📊 Total channels: {$totalChannels}");
        $this->command->info("📊 Batch size: " . self::BATCH_SIZE);
        $this->command->newLine();

        $created = 0;
        $batches = 0;
        $insertData = [];

        Company::chunk(self::COMPANY_CHUNK_SIZE, function ($companies) use (
            &$created,
            &$insertData,
            &$batches,
            $totalChannels
        ) {
            foreach ($companies as $company) {
                for ($i = 0; $i < self::CHANNELS_PER_COMPANY; $i++) {
                    $insertData[] = $this->generateChannelData($company->id);
                    $created++;

                    if (count($insertData) >= self::BATCH_SIZE) {
                        $this->insertBatch($insertData, $batches, $totalChannels);
                        $insertData = [];
                    }
                }
            }
        });

        // ✅ ВСТАВЛЯЕМ ОСТАТКИ
        if (!empty($insertData)) {
            $this->insertBatch($insertData, $batches, $totalChannels);
        }

        $this->command->newLine();
        $this->command->info("✅ FAST channel seeding completed!");
        $this->command->info("📊 Total batches: {$batches}");
        $this->command->info("📊 Total channels: " . CompanyContactChannel::count());
    }

    /**
     * Сгенерировать данные канала для batch insert.
     */
    protected function generateChannelData(int $companyId): array
    {
        $type = Arr::random(self::CHANNEL_TYPES);
        $now = now();

        return [
            'company_id' => $companyId,
            'type' => $type,
            'title' => ucfirst($type) . ' Channel',
            'description' => fake()->optional(0.7)->sentence(10),
            'logo_url' => fake()->optional(0.5)->imageUrl(64, 64, 'business'),
            'url' => fake()->optional(0.6)->url(),
            'identifier' => fake()->optional(0.5)->userName(),
            'metadata' => json_encode(['platform' => $type]),
            'order_column' => 0,
            'is_active' => fake()->boolean(90),
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    /**
     * Вставить батч каналов.
     */
    protected function insertBatch(array $data, int &$batches, int $totalChannels): void
    {
        CompanyContactChannel::insert($data);
        $batches++;

        $created = $batches * count($data);
        $percentage = round(($created / $totalChannels) * 100, 2);
        $this->command->info("   ✓ Batch {$batches}: {$created}/{$totalChannels} channels ({$percentage}%)");
    }
}
