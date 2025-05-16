<?php

namespace Database\Seeders;

use App\Faker;
use App\Models\Acl;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

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

        $mailStat = config('content.mail_stat');
        $mailStatPass = config('content.$mailStatPass');

        foreach ($userList as $fullName) {
            // Удаляем точки и разбиваем на части
            $parts = explode(' ', str_replace('.', '', $fullName));

            // Обрабатываем части имени (кроме последней)
            $processed = array_map(
                fn($p) => substr($p, 0, max(0, strlen($p) - 2)),
                array_slice($parts, 0, -1)
            );

            // Формируем имя и обрезаем до 14 символов
            $name = substr(
                implode('.', [...$processed, end($parts)]),
                0,
                10
            );

            $user = User::create([
                'name' => $fullName,
                'email' => strtolower($name) . $mailStat,
                'password' => Hash::make($mailStatPass),
            ]);
            $roleName = Faker::randomInArray([
                Acl::ROLE_MANAGER,
                Acl::ROLE_EDITOR,
                Acl::ROLE_USER,
                Acl::ROLE_VISITOR,
            ]);
            $user->syncRoles(Role::findByName($roleName));
        }

    }
}
