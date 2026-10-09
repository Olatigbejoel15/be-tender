<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Women',       'slug' => 'women',       'description' => 'Leggings, bras and shorts built to move.'],
            ['name' => 'Men',         'slug' => 'men',         'description' => 'Tees, shorts and joggers for every session.'],
            ['name' => 'Accessories', 'slug' => 'accessories', 'description' => 'Bags, bottles and gear to complete the kit.'],
        ];

        foreach ($categories as $c) {
            Category::updateOrCreate(['slug' => $c['slug']], $c); // find by slug, else create (safe to re-run)
        }
    }
}
