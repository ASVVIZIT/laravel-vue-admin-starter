<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use Database\Seeders\SocialMediaLinks\SocialMediaLinksSeeder;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);
        $this->call(SocialMediaLinksSeeder::class);
    }
}
