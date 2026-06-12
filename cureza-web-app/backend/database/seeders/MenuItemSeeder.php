<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MenuItem;
use App\Models\Category;

class MenuItemSeeder extends Seeder
{
    public function run()
    {
        // Clear existing items
        MenuItem::truncate();

        // 1. Shop All
        MenuItem::create([
            'title' => 'Shop All',
            'url' => '/shop',
            'order' => 1,
            'is_active' => true,
        ]);

        // 2. New Launches
        MenuItem::create([
            'title' => 'New Launches',
            'url' => '/new-launches',
            'order' => 2,
            'is_active' => true,
        ]);

        // 3. Bestsellers
        MenuItem::create([
            'title' => 'Bestsellers',
            'url' => '/bestsellers',
            'order' => 3,
            'is_active' => true,
        ]);

        // 4. Categories (Dynamic)
        $categories = Category::where('type', 'category')->limit(3)->get();
        foreach ($categories as $index => $category) {
            MenuItem::create([
                'title' => $category->name,
                'url' => "/category/{$category->slug}",
                'order' => 4 + $index,
                'is_active' => true,
            ]);
        }

        // 5. Concerns (Dynamic)
        $concerns = Category::where('type', 'concern')->limit(2)->get();
        foreach ($concerns as $index => $concern) {
            MenuItem::create([
                'title' => $concern->name,
                'url' => "/concern/{$concern->slug}",
                'order' => 7 + $index,
                'is_active' => true,
            ]);
        }

        // 6. Blog
        MenuItem::create([
            'title' => 'Blog',
            'url' => '/blog',
            'order' => 10,
            'is_active' => true,
        ]);

        // 7. Offers
        MenuItem::create([
            'title' => 'Offers',
            'url' => '/offers',
            'order' => 11,
            'is_active' => true,
        ]);
    }
}
