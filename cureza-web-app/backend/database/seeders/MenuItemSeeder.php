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

        // 2. Shop By Categories (Mega Menu)
        MenuItem::create([
            'title' => 'Shop By Categories',
            'url' => '/shop',
            'order' => 2,
            'is_active' => true,
        ]);

        // 3. Shop By Brand (Mega Menu)
        MenuItem::create([
            'title' => 'Shop By Brand',
            'url' => '/brands',
            'order' => 3,
            'is_active' => true,
        ]);

        // 4. Shop By Concern (Mega Menu)
        MenuItem::create([
            'title' => 'Shop By Concern',
            'url' => '/concerns',
            'order' => 4,
            'is_active' => true,
        ]);

        // 5. About Us (Dropdown)
        $aboutUs = MenuItem::create([
            'title' => 'About Us',
            'url' => '/about',
            'order' => 5,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'Our Story',
            'url' => '/about',
            'parent_id' => $aboutUs->id,
            'order' => 1,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'Careers',
            'url' => '/careers',
            'parent_id' => $aboutUs->id,
            'order' => 2,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'Press & Media',
            'url' => '/press',
            'parent_id' => $aboutUs->id,
            'order' => 3,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'Community Hub',
            'url' => '/community',
            'parent_id' => $aboutUs->id,
            'order' => 4,
            'is_active' => true,
        ]);

        // 6. Knowledge Hub (Dropdown)
        $knowledgeHub = MenuItem::create([
            'title' => 'Knowledge Hub',
            'url' => '/blog',
            'order' => 6,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'Wellness Library',
            'url' => '/blog',
            'parent_id' => $knowledgeHub->id,
            'order' => 1,
            'is_active' => true,
        ]);

        MenuItem::create([
            'title' => 'FAQs',
            'url' => '/faq',
            'parent_id' => $knowledgeHub->id,
            'order' => 2,
            'is_active' => true,
        ]);

        // 7. Offers
        MenuItem::create([
            'title' => 'Offers',
            'url' => '/offers',
            'order' => 7,
            'is_active' => true,
        ]);

        // Write static JSON file
        MenuItem::writeStaticJson();
    }
}
