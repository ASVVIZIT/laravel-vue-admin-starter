<?php

namespace Database\Seeders\Company;

use App\Models\Company\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Количество компаний для создания
     */
    protected const COUNT = 1000;
    protected const PROGRESS_INTERVAL = 50;

    /**
     * Запустить сидер.
     */
    public function run(): void
    {
        $this->command->info("🏢 Starting company seeding...");
        $this->command->info("📊 Creating " . self::COUNT . " companies...");
        $this->command->newLine();

        Company::factory()
            ->count(self::COUNT)
            ->create()
            ->each(function ($company, $index) {
                if (($index + 1) % self::PROGRESS_INTERVAL === 0) {
                    $percentage = round((($index + 1) / self::COUNT) * 100, 2);
                    $this->command->info(
                        "   ✓ Created " . ($index + 1) . "/" . self::COUNT . " companies ({$percentage}%)"
                    );
                }
            });

        $this->command->newLine();
        $this->command->info("✅ Company seeding completed!");
        $this->command->info("📊 Total companies: " . Company::count());
    }
}
