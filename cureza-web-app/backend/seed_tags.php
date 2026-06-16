<?php

/**
 * Comprehensive Product Tags Seeder for Cureza
 * Seeds a wide range of premium tags for medical, wellness, herbal, and CBD products.
 * Run: php seed_tags.php
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tag;
use Illuminate\Support\Str;

echo "\n";
echo "╔══════════════════════════════════════════════════╗\n";
echo "║   🌿 CUREZA - Product Tags Seeder                ║\n";
echo "║   Comprehensive Health, CBD & Wellness Tags      ║\n";
echo "╚══════════════════════════════════════════════════╝\n\n";

$tags = [
    // ── CBD & Cannabis Specific ──
    ['name' => 'Full Spectrum', 'description' => 'Contains all cannabinoids, terpenes, and flavonoids naturally found in hemp.'],
    ['name' => 'Broad Spectrum', 'description' => 'Contains multiple cannabinoids and terpenes but is completely THC-free.'],
    ['name' => 'CBD Isolate', 'description' => 'Pure CBD powder form, containing 99%+ pure cannabidiol and zero other compounds.'],
    ['name' => 'THC-Free', 'description' => 'Products containing absolutely no Tetrahydrocannabinol (THC).'],
    ['name' => 'Organic Hemp', 'description' => 'Made from 100% organically grown hemp plants without pesticides.'],
    ['name' => 'Non-Psychoactive', 'description' => 'Will not produce a high or any mind-altering effects.'],
    ['name' => 'Terpene Rich', 'description' => 'Infused or naturally containing high concentrations of therapeutic terpenes.'],
    ['name' => 'Lab Tested', 'description' => 'Third-party laboratory tested for purity, potency, and safety verification.'],

    // ── Wellness & Dietary ──
    ['name' => 'Immunity Booster', 'description' => 'Formulations designed to strengthen the immune system and defense mechanisms.'],
    ['name' => 'Antioxidant Rich', 'description' => 'Protects body cells from free radical damage and oxidative stress.'],
    ['name' => 'Energy & Vitality', 'description' => 'Provides natural energy, fights fatigue, and increases physical stamina.'],
    ['name' => 'Stress Relief', 'description' => 'Helps calm the nervous system, reduce cortisol, and manage daily anxiety.'],
    ['name' => 'Sleep Aid', 'description' => 'Promotes restful sleep, regulates sleep cycles, and helps fight insomnia.'],
    ['name' => 'Mental Focus', 'description' => 'Enhances cognitive performance, memory retention, concentration, and clarity.'],
    ['name' => 'Muscle Recovery', 'description' => 'Reduces muscle soreness, supports tissue repair, and aids post-workout recovery.'],
    ['name' => 'Joint Support', 'description' => 'Improves joint lubrication, reduces stiffness, and supports overall mobility.'],
    ['name' => 'Digestion Support', 'description' => 'Enhances gut microbiome health, relieves bloating, and aids nutrient absorption.'],
    ['name' => 'Weight Control', 'description' => 'Supports healthy weight management, metabolism, and appetite suppression.'],
    ['name' => 'Detox & Cleanse', 'description' => 'Aids in flushing out toxins and supporting liver/kidney detoxification.'],

    // ── Dietary Preferences ──
    ['name' => 'Vegan', 'description' => '100% plant-based product containing no animal-derived ingredients or byproducts.'],
    ['name' => 'Gluten-Free', 'description' => 'Safe for individuals with celiac disease or gluten sensitivities.'],
    ['name' => 'Non-GMO', 'description' => 'Free from genetically modified organisms.'],
    ['name' => 'Keto Friendly', 'description' => 'Low carb and high healthy fats, suitable for ketogenic diet lifestyles.'],
    ['name' => 'Sugar-Free', 'description' => 'Contains no added sugar or artificial sweeteners.'],
    ['name' => 'Cruelty-Free', 'description' => 'Product was developed and manufactured without any animal testing.'],
    ['name' => '100% Organic', 'description' => 'Made strictly from certified organic ingredients.'],

    // ── Ayurveda & Herbs ──
    ['name' => 'Ayurvedic', 'description' => 'Formulated according to ancient Indian Ayurvedic medicine principles.'],
    ['name' => 'Herbal', 'description' => 'Contains raw herbs, plant extracts, or botanical formulations.'],
    ['name' => 'Ashwagandha', 'description' => 'Contains premium Withania somnifera (Ashwagandha) adaptogen root extract.'],
    ['name' => 'Turmeric & Curcumin', 'description' => 'Infused with high-potency turmeric extract for natural anti-inflammatory benefits.'],
    ['name' => 'Triphala', 'description' => 'Traditional three-fruit Ayurvedic formula for colon cleanse and digestion.'],
    ['name' => 'Tulsi', 'description' => 'Formulated with Holy Basil (Tulsi) for respiratory and stress support.'],
    ['name' => 'Giloy', 'description' => 'Contains Tinospora cordifolia (Giloy) for immunity and fever defense.'],

    // ── Skin & Hair ──
    ['name' => 'Anti-Aging', 'description' => 'Reduces the appearance of fine lines, wrinkles, and signs of premature aging.'],
    ['name' => 'Glow & Radiance', 'description' => 'Brightens skin tone, reduces pigmentation, and brings a healthy skin glow.'],
    ['name' => 'Deep Hydration', 'description' => 'Provides intensive moisture to dry, flaky, or dehydrated skin/hair.'],
    ['name' => 'Acne Control', 'description' => 'Targets acne-causing bacteria, reduces excess sebum, and clears skin blemishes.'],
    ['name' => 'Hair Growth', 'description' => 'Stimulates hair follicles, strengthens roots, and prevents hair fall.'],
    ['name' => 'Anti-Dandruff', 'description' => 'Clears scalp flakiness, irritation, and controls yeast/dandruff growth.'],

    // ── General / Retail ──
    ['name' => 'Bestseller', 'description' => 'Highly popular, top-selling customer favorite product.'],
    ['name' => 'New Arrival', 'description' => 'Newly added formulation or product to the Cureza catalog.'],
    ['name' => 'Premium Quality', 'description' => 'Highest grade ingredients and exceptional manufacturing standards.'],
    ['name' => 'Doctor Recommended', 'description' => 'Endorsed or formulated by healthcare professionals.'],
    ['name' => 'Clinically Proven', 'description' => 'Ingredients backed by peer-reviewed clinical research and studies.'],
    ['name' => 'Made in India', 'description' => 'Proudly manufactured and packaged in India.'],
];

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  🏷️  SEEDING PRODUCT TAGS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

$created = 0;
$skipped = 0;

foreach ($tags as $tagData) {
    $slug = Str::slug($tagData['name']);
    $existing = Tag::where('slug', $slug)->first();

    if ($existing) {
        $updated = false;
        if (empty($existing->description) && !empty($tagData['description'])) {
            $existing->description = $tagData['description'];
            $existing->save();
            $updated = true;
        }
        if ($updated) {
            echo "  🔄 Updated: {$tagData['name']}\n";
        } else {
            echo "  ⏭️  Exists:  {$tagData['name']}\n";
        }
        $skipped++;
    } else {
        Tag::create([
            'name' => $tagData['name'],
            'slug' => $slug,
            'description' => $tagData['description'],
        ]);
        echo "  ✅ Created: {$tagData['name']}\n";
        $created++;
    }
}

$totalTags = Tag::count();

echo "\n";
echo "╔══════════════════════════════════════════════════╗\n";
echo "║  📊 TAGS SEEDING SUMMARY                         ║\n";
echo "╠══════════════════════════════════════════════════╣\n";
echo "║  New tags created:      " . str_pad($created, 4) .                "                     ║\n";
echo "║  Tags skipped (exists): " . str_pad($skipped, 4) .                "                     ║\n";
echo "║  ─────────────────────────────────────────────── ║\n";
echo "║  Total tags in DB:      " . str_pad($totalTags, 4) .              "                     ║\n";
echo "╠══════════════════════════════════════════════════╣\n";
echo "║  ✅ ALL DONE! Tags seeded successfully.          ║\n";
echo "╚══════════════════════════════════════════════════╝\n\n";
