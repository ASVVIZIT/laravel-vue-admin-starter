<?php

namespace Database\Seeders\Base;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminBaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesAndPermissionsSeeder::class);
        $this->call(UsersSeeder::class);
        $this->call(UsersTableSeeder::class);
    }
}
