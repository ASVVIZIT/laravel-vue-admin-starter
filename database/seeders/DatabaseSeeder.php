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

use App\Models\Template; // Добавьте эту строку
use App\Models\ColumnTemplate; // И эту
use App\Models\TableRow; // И эту


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



        $template = Template::create(['name' => 'Product Catalog']);

        $columns = [
            ['type' => 'text', 'label' => 'Product Name', 'order' => 1],
            ['type' => 'select', 'label' => 'Category', 'options' => [
                    'Electronics',
                    'Clothing',
                    'еще что то 1',
                    'еще что то 2'
                ],
                'order' => 2
            ],
            ['type' => 'select', 'label' => 'Назначение', 'options' => [
                'Назначение 1',
                'Назначение 2',
                'Назначение 3',
                'Назначение 4',
                'Назначение 5'
            ],
                'order' => 23
            ],
            ['type' => 'number', 'label' => 'Price', 'order' => 4]
        ];

        foreach ($columns as $col) {
            $template->columns()->create($col);
        }

        $parentRow = TableRow::create([
            'template_id' => $template->id,
            'data' => [
                'Product Name' => 'Main Product',
                'Category' => 'Electronics',
                'Назначение' => 'Назначение 1',
                'Price' => 110
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product',
                'Category' => 'Components',
                'Назначение' => 'Назначение 5',
                'Price' => 550
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product 2',
                'Category' => 'Components',
                'Назначение' => 'Назначение 3',
                'Price' => 110
            ]
        ]);
        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow->id,
            'data' => [
                'Product Name' => 'Sub Product 3',
                'Category' => 'Components',
                'Назначение' => 'Назначение 4',
                'Price' => 150
            ]
        ]);


        $parentRow2 = TableRow::create([
            'template_id' => $template->id,
            'data' => [
                'Product Name' => 'Main Product 2',
                'Category' => 'еще что то 1',
                'Назначение' => 'Назначение 2',
                'Price' => 110
            ]
        ]);

        TableRow::create([
            'template_id' => $template->id,
            'parent_id' => $parentRow2->id,
            'data' => [
                'Product Name' => 'Sub Product 2',
                'Category' => 'Components',
                'Назначение' => 'Назначение 4',
                'Price' => 550
            ]
        ]);

        $this->call(CatalogSeeder::class);

    }
}
