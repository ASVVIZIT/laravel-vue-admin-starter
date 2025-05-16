<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Acl;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;

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
    }
}
