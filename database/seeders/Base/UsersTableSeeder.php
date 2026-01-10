<?php

namespace Database\Seeders\Base;

use App\Faker;
use App\Models\Acl;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use function config;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Словарь для определения пола по имени
        $genderMap = [
            'Adriana' => 1, // Женский
            'Albert' => 0,  // Мужской
            'Anna' => 1,    // Женский
            'Blaise' => 0,  // Мужской
            'Caroline' => 1, // Женский
            'Cecilia' => 1, // Женский
            'Chien-Shiung' => 0, // Мужской
            'Dorothy' => 1, // Женский
            'Edmond' => 0,  // Мужской
            'Edwin' => 0,   // Мужской
            'Elizabeth' => 1, // Женский
            'Enrico' => 0,  // Мужской
            'Erwin' => 0,   // Мужской
            'Flossie' => 1, // Женский
            'Frieda' => 1,  // Женский
            'Geraldine' => 1, // Женский
            'Gertrude' => 1, // Женский
            'Ingrid' => 1,  // Женский
            'Jacqueline' => 1, // Женский
            'Jane' => 1,    // Женский
            'Jocelyn' => 1, // Женский
            'Johannes' => 0, // Мужской
            'Lene' => 1,    // Женский
            'Lise' => 1,    // Женский
            'Lord' => 0,    // Мужской
            'Maria' => 1,   // Женский
            'Marie' => 1,   // Женский
            'Max' => 0,     // Мужской
            'Melissa' => 1, // Женский
            'Michael' => 0, // Мужской
            'Mildred' => 1, // Женский
            'Nicolaus' => 0, // Мужской
            'Niels' => 0,   // Мужской
            'Patricia' => 1, // Женский
            'Patty' => 1,   // Женский
            'Polly' => 1,   // Женский
            'Richard' => 0, // Мужской
            'Rita' => 1,    // Женский
            'Rosalind' => 1, // Женский
            'Ruzena' => 1,  // Женский
            'Sarah' => 1,   // Женский
            'Shannon' => 1, // Женский
            'Shirley' => 1, // Женский
            'Sir' => 0,     // Мужской
            'Stephen' => 0, // Мужской
            'Werner' => 0,  // Мужской
            'Wilhelm' => 0, // Мужской
            'Wolfgang' => 0, // Мужской
        ];

        $mailStat = config('content.mail_stat');
        $mailStatPass = config('content.mail_stat_pass');

        $userList = [
            "Adriana C. Ocampo Uria",
            "Albert Einstein",
            "Anna K. Behrensmeyer",
            "Blaise Pascal",
            "Caroline Herschel",
            "Cecilia Payne-Gaposchkin",
            "Chien-Shiung Wu",
            "Dorothy Hodgkin",
            "Edmond Halley",
            "Edwin Powell Hubble",
            "Elizabeth Blackburn",
            "Enrico Fermi",
            "Erwin Schroedinger",
            "Flossie Wong-Staal",
            "Frieda Robscheit-Robbins",
            "Geraldine Seydoux",
            "Gertrude B. Elion",
            "Ingrid Daubechies",
            "Jacqueline K. Barton",
            "Jane Goodall",
            "Jocelyn Bell Burnell",
            "Johannes Kepler",
            "Lene Vestergaard Hau",
            "Lise Meitner",
            "Lord Kelvin",
            "Maria Mitchell",
            "Marie Curie",
            "Max Born",
            "Max Planck",
            "Melissa Franklin",
            "Michael Faraday",
            "Mildred S. Dresselhaus",
            "Nicolaus Copernicus",
            "Niels Bohr",
            "Patricia S. Goldman-Rakic",
            "Patty Jo Watson",
            "Polly Matzinger",
            "Richard Phillips Feynman",
            "Rita Levi-Montalcini",
            "Rosalind Franklin",
            "Ruzena Bajcsy",
            "Sarah Boysen",
            "Shannon W. Lucid",
            "Shirley Ann Jackson",
            "Sir Ernest Rutherford",
            "Sir Isaac Newton",
            "Stephen Hawking",
            "Werner Karl Heisenberg",
            "Wilhelm Conrad Roentgen",
            "Wolfgang Ernst Pauli",
        ];

        foreach ($userList as $fullName) {
            // Удаляем точки и разбиваем на части
            $parts = explode(' ', str_replace('.', '', $fullName));

            // Извлекаем имя (первое слово)
            $firstName = strtolower($parts[0]);

            // Определяем пол
            $sex = $genderMap[$firstName] ?? ($firstName[strlen($firstName) - 1] === 'a' ? 1 : 0);

            // Обрабатываем части имени (кроме последней)
            $processed = array_map(
                fn($p) => substr($p, 0, max(0, strlen($p) - 2)),
                array_slice($parts, 0, -1)
            );

            // Формируем email
            $name = substr(
                implode('.', [...$processed, end($parts)]),
                0,
                10
            );

            $user = User::create([
                'name' => $fullName,
                'email' => strtolower($name) . $mailStat,
                'password' => Hash::make($mailStatPass),
                'sex' => $sex,
            ]);
            $roleName = Faker::randomInArray([
                Acl::ROLE_MANAGER,
                Acl::ROLE_EDITOR,
                Acl::ROLE_USER,
                Acl::ROLE_VISITOR,
            ]);
            $role = Role::findByName($roleName);
            if ($role) {
                $user->syncRoles([$role]);
            }
        }

    }
}
