<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,  // categories first, because products need their ids
            ProductSeeder::class,
        ]);
    }
}
