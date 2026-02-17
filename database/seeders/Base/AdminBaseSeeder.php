<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Database\Seeders\SocialMediaLinks\SocialMediaLinksSeeder;
use Database\Seeders\CompanyContactChannels\CompanyContactChannelsSeeder;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);

        // Вызов старого сидера (если вы хотите, чтобы старые данные тоже загружались)
        $this->call(SocialMediaLinksSeeder::class);

        // Вызов нового сидера для CompanyContactChannels
        $this->call(CompanyContactChannelsSeeder::class);
    }
}
