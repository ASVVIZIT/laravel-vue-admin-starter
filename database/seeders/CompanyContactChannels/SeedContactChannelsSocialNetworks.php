<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;

class SeedContactChannelsSocialNetworks extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            // Пример данных для соцсетей
            $socialChannels = [
                [
                    'type' => 'social_network',
                    'title' => 'Facebook - ' . $company->name,
                    'url' => 'https://facebook.com/' . str_replace(' ', '', strtolower($company->name)),
                    'description' => 'Follow us on Facebook!',
                    'logo_url' => '/icons/facebook.svg', // Убедитесь, что иконка существует
                    'order_column' => 1,
                    'is_active' => true,
                ],
                [
                    'type' => 'social_network',
                    'title' => 'Instagram - ' . $company->name,
                    'url' => 'https://instagram.com/' . str_replace(' ', '', strtolower($company->name)),
                    'description' => 'Check out our Instagram feed!',
                    'logo_url' => '/icons/instagram.svg',
                    'order_column' => 2,
                    'is_active' => true,
                ],
                [
                    'type' => 'social_network',
                    'title' => 'LinkedIn - ' . $company->name,
                    'url' => 'https://linkedin.com/company/' . str_replace(' ', '-', strtolower($company->name)),
                    'description' => 'Connect with us on LinkedIn.',
                    'logo_url' => '/icons/linkedin.svg',
                    'order_column' => 3,
                    'is_active' => true,
                ],
            ];

            foreach ($socialChannels as $channelData) {
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
