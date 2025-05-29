<?php

namespace Database\Seeders;

use App\Models\Acl;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\ElectricalProtection\BrandsSeeder;
use Database\Seeders\ElectricalProtection\DeviceTypeSeeder;
use Database\Seeders\ElectricalProtection\MeasurementUnitSeeder;
use Database\Seeders\ElectricalProtection\Schneider\BrandSchneiderSeeder;

use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\CableAccessoriesSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\IdentificationSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\MechanicalAccessoriesSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\SpecialAccessoriesSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\SpecialSeriesSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\TwidoAccessorySeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\VigiDifferentialSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\Accessories\VigiNG125Seeder;

use Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers\IC60HSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers\IC60LSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers\IC60NSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\MainCircuitBreakers\C60HDCSeeder;

use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125\NG125NSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125\NG125HSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125\NG125LSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\NG125\NG125LMASeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\C120Seeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\IndustrialSeries\STISBISeed;

use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\IDPNSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\IDSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\IK60NSeeder;
use Database\Seeders\ElectricalProtection\Schneider\Acti9\SpecialSeries\ReflexIC60\ReflexIC60Seeder;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {

        $mailStat = config('content.mail_stat');
        $mailStatPass = config('content.mailStatPass');

        $user = User::query()->firstOrCreate([
            'name' => config('content.admin_name'),
        ], [
            'email' => config('content.admin_email'),
            'password' => Hash::make(config('content.admin_password')),
            'status' => true,
            'sex' => 0,
            'birthday' => '2006-01-02 15:04:05',
            'description' => 'Talk is cheap. Show me the code',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now()
        ]);

        $role = Role::findByName(Acl::ROLE_SUPER_ADMIN);
        $user->syncRoles($role);

        $admin = User::create([
            'name' => 'Admin2',
            'email' => 'admin2' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);
        $admin2 = User::create([
            'name' => 'Admin3',
            'email' => 'admin3' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);
        $manager = User::create([
            'name' => 'Manager',
            'email' => 'manager' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);
        $editor = User::create([
            'name' => 'Editor',
            'email' => 'editor' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);
        $user = User::create([
            'name' => 'User',
            'email' => 'user' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);
        $visitor = User::create([
            'name' => 'Visitor',
            'email' => 'visitor' . $mailStat,
            'password' => Hash::make($mailStatPass),
        ]);

        $adminRole = Role::findByName(\App\Models\Acl::ROLE_ADMIN);
        $managerRole = Role::findByName(\App\Models\Acl::ROLE_MANAGER);
        $editorRole = Role::findByName(\App\Models\Acl::ROLE_EDITOR);
        $userRole = Role::findByName(\App\Models\Acl::ROLE_USER);
        $visitorRole = Role::findByName(\App\Models\Acl::ROLE_VISITOR);
        $admin->syncRoles($adminRole);
        $admin2->syncRoles($adminRole);
        $manager->syncRoles($managerRole);
        $editor->syncRoles($editorRole);
        $user->syncRoles($userRole);
        $visitor->syncRoles($visitorRole);

        $this->call(UsersTableSeeder::class);

        $this->call(TemplateSeeder::class);

        // Бренды и типы устройств
        $this->call([
            MeasurementUnitSeeder::class,
            BrandsSeeder::class,
            BrandSchneiderSeeder::class,
            DeviceTypeSeeder::class,
        ]);

        // Аксессуары (Создаются в начале)
        $this->call([
            CableAccessoriesSeeder::class,
            IdentificationSeeder::class,
            MechanicalAccessoriesSeeder::class,
            SpecialAccessoriesSeeder::class,
            SpecialSeriesSeeder::class,
            TwidoAccessorySeeder::class,
            VigiDifferentialSeeder::class,
            VigiNG125Seeder::class,
        ]);

        // Основные автоматы
        $this->call([
            IC60NSeeder::class,
            IC60HSeeder::class,
            IC60LSeeder::class,
            C60HDCSeeder::class,
        ]);

        // Промышленные серии
        $this->call([
            NG125NSeeder::class,
            NG125HSeeder::class,
            NG125LSeeder::class,
            NG125LMASeeder::class,
            C120Seeder::class,
            STISBISeed::class,
        ]);

        // SpecialSeries серии
        $this->call([
            IDPNSeeder::class,
            IDSeeder::class,
            IK60NSeeder::class,
            ReflexIC60Seeder::class,
        ]);
    }
}
