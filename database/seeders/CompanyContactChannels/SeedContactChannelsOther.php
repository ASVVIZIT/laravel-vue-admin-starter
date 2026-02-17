<?php

namespace Database\Seeders\CompanyContactChannels;

use Illuminate\Database\Seeder;
use App\Models\Company\Company;

class SeedContactChannelsOther extends Seeder
{
    public function run(): void
    {
        $companies = Company::all();

        foreach ($companies as $company) {
            // Пример данных для email, телефона, сайта
            $otherChannels = [
                [
                    'type' => 'email',
                    'title' => 'Contact Email - ' . $company->name,
                    'identifier' => 'contact@' . str_replace([' ', '&', '.'], ['', 'and', ''], strtolower($company->name)) . '.com',
                    'description' => 'Send us an email.',
                    'order_column' => 7,
                    'is_active' => true,
                ],
                [
                    'type' => 'phone_number',
                    'title' => 'Main Phone - ' . $company->name,
                    'identifier' => '+' . preg_replace('/[^0-9]/', '', fake()->e164PhoneNumber()),
                    'description' => 'Call our main office.',
                    'order_column' => 8,
                    'is_active' => true,
                ],
                [
                    'type' => 'website',
                    'title' => 'Official Website - ' . $company->name,
                    'url' => 'https://' . str_replace([' ', '&', '.'], ['', 'and', ''], strtolower($company->name)) . '.com',
                    'description' => 'Visit our official website.',
                    'order_column' => 0, // Пример низкого приоритета (в начало списка)
                    'is_active' => true,
                ],
            ];

            foreach ($otherChannels as $channelData) {
                $company->contactChannels()->create($channelData);
            }
        }
    }
}
