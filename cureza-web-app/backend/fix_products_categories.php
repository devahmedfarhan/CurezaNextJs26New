<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Product;
use App\Models\Category;

$mappings = [
    'PLACIDIOL - PURE CBD DROP' => [
        'category' => 'cbd-oils-tinctures',
        'concern' => 'anxiety-stress',
        'rx' => false,
    ],
    'Quick Pain Relief Kit' => [
        'category' => 'combo-packs-kits',
        'concern' => 'chronic-pain',
        'rx' => false,
    ],
    'Anxiety( Relaxation Relief Kit)' => [
        'category' => 'combo-packs-kits',
        'concern' => 'anxiety-stress',
        'rx' => false,
    ],
    'Uplift & Unwind Kit - For Deep Relaxation & Happiness' => [
        'category' => 'combo-packs-kits',
        'concern' => 'depression-mood-disorders',
        'rx' => false,
    ],
    'De-Addiction Bundle' => [
        'category' => 'combo-packs-kits',
        'concern' => 'de-addiction-detox',
        'rx' => false,
    ],
    'Calm Drops - Morning Bliss' => [
        'category' => 'cbd-oils-tinctures',
        'concern' => 'anxiety-stress',
        'rx' => false,
    ],
    'Uplift Plus Drops Extract with Terpenes' => [
        'category' => 'cbd-oils-tinctures',
        'concern' => 'depression-mood-disorders',
        'rx' => false,
    ],
    'Full Spectrum Capsules (Pain Aid) - Painkiller, Insomnia Relief, Anti-Inflammatory' => [
        'category' => 'capsules-tablets',
        'concern' => 'chronic-pain',
        'rx' => true,
    ],
    'Hemp Seed Oil Softgels - 500mg (Omega 3, 6 & 9 + Amino Acids)' => [
        'category' => 'capsules-tablets',
        'concern' => 'general-wellness',
        'rx' => false,
    ],
    'Vijaya Ambrosia – THC-Dominant Full Spectrum Drops (1:4 CBD:THC)' => [
        'category' => 'thc-oils',
        'concern' => 'insomnia-sleep-disorders',
        'rx' => true,
    ],
    'Uplift Drops – Mood Lifters THC-Dominant Oil for Depression, Chronic Pain and Insomnia' => [
        'category' => 'thc-oils',
        'concern' => 'depression-mood-disorders',
        'rx' => true,
    ],
    'CI’s Full Spectrum Tincture/Elevate' => [
        'category' => 'thc-oils',
        'concern' => 'depression-mood-disorders',
        'rx' => true,
    ],
    'Vijaya Amrit - Neuro & Immuno Protective' => [
        'category' => 'thc-oils',
        'concern' => 'immunity-vitality',
        'rx' => true,
    ],
    'Cannaronil RSO (No MCT oil) THC dominant or Balanced Golden Ratio' => [
        'category' => 'thc-oils',
        'concern' => 'cancer-support-palliative-care',
        'rx' => true,
    ],
    'Brain Easer: Sleep' => [
        'category' => 'cbd-oils-tinctures',
        'concern' => 'insomnia-sleep-disorders',
        'rx' => false,
    ],
    'Trailokya Vijaya Vati Advanced (Ayurvedic Classic Blend) 500mg' => [
        'category' => 'classical-ayurvedic-medicines',
        'concern' => 'chronic-pain',
        'rx' => true,
    ],
    'Liposomal Berberine 98% HCl+' => [
        'category' => 'supplements-vitamins',
        'concern' => 'diabetes-blood-sugar',
        'rx' => false,
    ],
    'Uplift Gummies (Full spectrum + Terpenes - 500mg with 315mg active cannabinoids )' => [
        'category' => 'gummies-edibles',
        'concern' => 'anxiety-stress',
        'rx' => false,
    ],
    'Cannazo Pain Relief Combo' => [
        'category' => 'combo-packs-kits',
        'concern' => 'arthritis-joint-pain',
        'rx' => false,
    ],
    'Japanese AstaReal Astaxanthin 7mg with DHA & L-Glutathione' => [
        'category' => 'supplements-vitamins',
        'concern' => 'anti-aging-wrinkles',
        'rx' => false,
    ],
    'Muscle Aid: Relieves Cramps, Stiffness & Sprains' => [
        'category' => 'topicals-roll-ons',
        'concern' => 'back-pain-muscle-spasms',
        'rx' => false,
    ],
    'Tranquil Duo – Calm Mind, Restful Sleep' => [
        'category' => 'combo-packs-kits',
        'concern' => 'insomnia-sleep-disorders',
        'rx' => false,
    ],
    'Revive - Pain Relief - Roll On' => [
        'category' => 'topicals-roll-ons',
        'concern' => 'back-pain-muscle-spasms',
        'rx' => false,
    ],
    'Pet Oil' => [
        'category' => 'pet-care',
        'concern' => 'general-wellness',
        'rx' => false,
    ],
    'Roll on Relief Combo' => [
        'category' => 'combo-packs-kits',
        'concern' => 'back-pain-muscle-spasms',
        'rx' => false,
    ],
    'Happy Euphoria Kit - For Deep Relaxation & Mood Upliftment' => [
        'category' => 'combo-packs-kits',
        'concern' => 'depression-mood-disorders',
        'rx' => false,
    ],
    'Migraine Aid - Roll-on' => [
        'category' => 'topicals-roll-ons',
        'concern' => 'migraines-headaches',
        'rx' => false,
    ],
    'Cancer ( Empower Care Kit)' => [
        'category' => 'combo-packs-kits',
        'concern' => 'cancer-support-palliative-care',
        'rx' => false,
    ],
    'ASD/ ADHD (Neurosupport Kit)' => [
        'category' => 'combo-packs-kits',
        'concern' => 'adhd-cognitive-focus',
        'rx' => false,
    ],
    'Blood Sugar / Cholesterol / Gut And Weight Management (Fit Control Kit )' => [
        'category' => 'combo-packs-kits',
        'concern' => 'weight-management',
        'rx' => false,
    ],
    'Arthritis (Pain Away Relief Kit)' => [
        'category' => 'combo-packs-kits',
        'concern' => 'arthritis-joint-pain',
        'rx' => false,
    ],
    'Forest Natural Honey - Cannazo India' => [
        'category' => 'organic-groceries-pantry',
        'concern' => 'general-wellness',
        'rx' => false,
    ],
    'CANNARONIL NANO   - PURE CBD PASTE (THC - FREE) - WATER SOLUBLE / NEBULIZATION SOL.' => [
        'category' => 'cbd-oils-tinctures',
        'concern' => 'general-wellness',
        'rx' => false,
    ],
    'Daily Skin Repair Cream' => [
        'category' => 'skincare',
        'concern' => 'acne-skin-conditions',
        'rx' => false,
    ],
    'Insomnia  ( Sleep Ease Kit)' => [
        'category' => 'combo-packs-kits',
        'concern' => 'insomnia-sleep-disorders',
        'rx' => false,
    ],
];

echo "Updating product categories, concerns and Rx status...\n";

foreach ($mappings as $title => $data) {
    $product = Product::where('title', $title)->first();
    if (!$product) {
        // Try loose matching
        $product = Product::where('title', 'like', '%' . explode(' - ', $title)[0] . '%')->first();
    }

    if ($product) {
        $category = Category::where('slug', $data['category'])->first();
        $concern = Category::where('slug', $data['concern'])->first();

        if ($category) {
            $product->category_id = $category->id;
        } else {
            echo "Category slug not found: {$data['category']}\n";
        }

        if ($concern) {
            $product->concern_id = $concern->id;
        } else {
            // some products might not have a concern
            $product->concern_id = null;
        }

        $product->is_prescription_required = $data['rx'];
        $product->save();

        echo "Updated: '{$product->title}' -> Cat: " . ($category ? $category->name : 'none') . ", Concern: " . ($concern ? $concern->name : 'none') . ", Rx: " . ($data['rx'] ? 'yes' : 'no') . "\n";
    } else {
        echo "Product not found: '{$title}'\n";
    }
}

echo "Done!\n";
