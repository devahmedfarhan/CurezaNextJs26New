<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BlogCategory;
use App\Models\BlogAuthor;
use App\Models\BlogTag;
use App\Models\BlogPost;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        // Create Categories
        $categories = [
            ['name' => 'Ayurveda', 'description' => 'Ancient wisdom for modern living.'],
            ['name' => 'Wellness', 'description' => 'Holistic health tips and guides.'],
            ['name' => 'Nutrition', 'description' => 'Healthy eating and diet plans.'],
            ['name' => 'Lifestyle', 'description' => 'Daily habits for a better life.'],
        ];

        foreach ($categories as $cat) {
            BlogCategory::firstOrCreate(
                ['slug' => Str::slug($cat['name'])],
                ['name' => $cat['name'], 'description' => $cat['description']]
            );
        }

        // Create Authors
        $authors = [
            ['name' => 'Dr. Anjali Sharma', 'bio' => 'Ayurvedic Practitioner with 15 years of experience.'],
            ['name' => 'Dr. Rajesh Kumar', 'bio' => 'Expert in herbal medicine and nutrition.'],
        ];

        foreach ($authors as $auth) {
            BlogAuthor::firstOrCreate(
                ['slug' => Str::slug($auth['name'])],
                ['name' => $auth['name'], 'bio' => $auth['bio']]
            );
        }

        // Create Tags
        $tags = ['Stress Relief', 'Immunity', 'Skin Care', 'Hair Care', 'Digestion', 'Yoga'];
        foreach ($tags as $tag) {
            BlogTag::firstOrCreate(
                ['slug' => Str::slug($tag)],
                ['name' => $tag]
            );
        }

        // Create Posts
        $category = BlogCategory::first();
        $author = BlogAuthor::first();
        $tagIds = BlogTag::pluck('id')->take(3);

        $posts = [
            [
                'title' => '5 Proven Health Benefits of Ashwagandha',
                'excerpt' => 'Discover how this ancient herb can reduce stress and improve your overall well-being.',
                'content' => '<p>Ashwagandha is one of the most important herbs in Ayurveda...</p><h3>1. Reduces Stress</h3><p>Ashwagandha is best known for...</p>',
                'featured_image' => 'https://images.unsplash.com/photo-1611079830811-865ec44627cd?q=80&w=1935&auto=format&fit=crop',
                'status' => 'published',
                'published_at' => now(),
                'is_featured' => true,
            ],
            [
                'title' => 'The Ultimate Guide to Ayurvedic Diet',
                'excerpt' => 'Learn how to eat according to your dosha for optimal health and digestion.',
                'content' => '<p>According to Ayurveda, diet is the foundation of health...</p>',
                'featured_image' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
                'status' => 'published',
                'published_at' => now()->subDays(2),
                'is_featured' => false,
            ],
            [
                'title' => 'Morning Rituals for Energy and Focus',
                'excerpt' => 'Start your day right with these simple Ayurvedic morning routines.',
                'content' => '<p>Dinacharya, or daily routine, is a key concept in Ayurveda...</p>',
                'featured_image' => 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'is_featured' => false,
            ],
        ];

        foreach ($posts as $postData) {
            $post = BlogPost::create(array_merge($postData, [
                'slug' => Str::slug($postData['title']),
                'category_id' => $category->id,
                'author_id' => $author->id,
                'views_count' => rand(100, 1000),
            ]));

            $post->tags()->sync($tagIds);
        }
    }
}
