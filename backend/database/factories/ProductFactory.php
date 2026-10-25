<?php

namespace Database\Factories;

use App\Enums\SizeLabel;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);

        return [
            'category_id'    => Category::factory(),                          // Builds a category if none is given
            'name'           => ucfirst($name),
            'slug'           => Str::slug($name) . '-' . Str::lower(Str::random(5)), // Unique slug
            'description'    => fake()->sentence(),
            'price'          => 10000,                                        // Naira
            'badge'          => null,
            'fabric'         => 'Nylon blend',
            'care'           => 'Machine wash cold',
            'features'       => ['Quick dry'],
            'sizes'          => ['S', 'M', 'L'],
            'size_label'     => SizeLabel::Size,
            'sold_out_sizes' => [],
            'colors'         => [
                ['name' => 'Black', 'hex' => '#111111'],
                ['name' => 'Navy',  'hex' => '#1f2a44'],
            ],
            'is_sold_out'    => false,
            'is_featured'    => false,
            'is_published'   => true,
            'version'        => 1,
        ];
    }

    // Product::factory()->soldOut()
    public function soldOut(): static
    {
        return $this->state(fn () => ['is_sold_out' => true]);
    }

    // Product::factory()->draft(): hidden from the shop
    public function draft(): static
    {
        return $this->state(fn () => ['is_published' => false]);
    }
}