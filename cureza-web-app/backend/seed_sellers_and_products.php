<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Brand;
use App\Models\SellerProfile;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

try {
    DB::beginTransaction();

    echo "Fetching categories and concerns...\n";
    $categories = Category::where('type', 'category')->get();
    $concerns = Category::where('type', 'concern')->get();

    if ($categories->isEmpty()) {
        throw new \Exception("No categories found in the database. Please run migrations/seeders first.");
    }

    $sellerNames = [
        "Aura Wellness"
    ];

    $productTemplates = [
        "CBD Oil" => [
            ["title" => "Broad Spectrum Hemp CBD Oil 1000mg", "short" => "Premium organic hemp-derived CBD oil for daily relaxation and stress relief.", "category" => "CBD Oil"],
            ["title" => "Lavender Infused CBD Sleep Drops 500mg", "short" => "Calming Lavender blended with pure CBD to help you ease into a deep, restful sleep.", "category" => "CBD Oil"],
            ["title" => "Raw Natural Gold CBD Extract", "short" => "Unfiltered raw gold CBD extract, high in natural cannabinoids and terpenes.", "category" => "CBD Oil"],
            ["title" => "Peppermint CBD Wellness Drops 1500mg", "short" => "Refreshing peppermint flavored high-potency CBD oil for full body wellness.", "category" => "CBD Oil"],
            ["title" => "Full Spectrum Joint Support CBD Oil", "short" => "Enriched with turmeric and black pepper for active joint comfort and flexibility.", "category" => "CBD Oil"]
        ],
        "Gummies" => [
            ["title" => "Relaxing Ashwagandha CBD Gummies", "short" => "Delicious mixed berry gummies infused with organic Ashwagandha and pure CBD.", "category" => "Gummies"],
            ["title" => "CBD Nighttime Melatonin Gummies", "short" => "Sour apple flavored gummies with CBD and Melatonin for healthy sleep cycles.", "category" => "Gummies"],
            ["title" => "Turmeric & Ginger Immunity Gummies", "short" => "Chewy citrus gummies packed with active curcumin and ginger extracts for gut and immunity.", "category" => "Gummies"],
            ["title" => "Apple Cider Vinegar Digestive Gummies", "short" => "Pomegranate flavored ACV gummies with mother for effortless metabolic support.", "category" => "Gummies"],
            ["title" => "Daily Multi-Vitamin Elderberry Gummies", "short" => "All-in-one nutritional support gummies infused with pure Elderberry extract.", "category" => "Gummies"]
        ],
        "Ayurveda" => [
            ["title" => "Premium Himalayan Shilajit Resin 20g", "short" => "Pure gold-grade Himalayan Shilajit resin, rich in fulvic acid and trace minerals.", "category" => "Ayurveda"],
            ["title" => "Organic Chyawanprash Immunity Booster", "short" => "Ancient herbal recipe cooked with fresh amla and 40+ potent Ayurvedic herbs.", "category" => "Ayurveda"],
            ["title" => "Triphala Digestive Care Capsules", "short" => "Standardized extracts of Amla, Haritaki, and Bibhitaki for gentle colon cleanse.", "category" => "Ayurveda"],
            ["title" => "KSM-66 Ashwagandha Strength Capsules", "short" => "High-concentration full-spectrum Ashwagandha root extract for stress and stamina.", "category" => "Ayurveda"],
            ["title" => "Pure Brahmi & Shankhpushpi Brain Tonic", "short" => "Natural cognitive booster capsules for enhanced focus, memory, and mental clarity.", "category" => "Ayurveda"]
        ],
        "Supplements" => [
            ["title" => "Plant-Based Vegan Vitamin B12 Tablets", "short" => "High absorption Methylcobalamin B12 for energy production and nervous system health.", "category" => "Supplements"],
            ["title" => "Calcium & Vitamin D3 Bone Strength Complex", "short" => "Synergistic calcium citrate and bio-active D3 for optimal bone density and muscle function.", "category" => "Supplements"],
            ["title" => "Triple Strength Omega-3 Fish Oil 1200mg", "short" => "Molecularly distilled, mercury-free fish oil rich in EPA and DHA for heart and brain.", "category" => "Supplements"],
            ["title" => "Organic Spirulina & Chlorella Superfood Tablets", "short" => "Nutrient-dense green superfood tablets for natural detoxification and daily vitality.", "category" => "Supplements"],
            ["title" => "Daily Multi-Vitamin & Minerals for Men & Women", "short" => "Comprehensive blend of 23 essential vitamins and minerals with added green tea extract.", "category" => "Supplements"]
        ],
        "Skin Care" => [
            ["title" => "Kumkumadi Ayurvedic Night Face Serum", "short" => "Traditional formulation of saffron and precious herbs for glowing, youthful skin.", "category" => "Skin Care"],
            ["title" => "Neem & Tea Tree Acne Purifying Face Gel", "short" => "Cooling, non-greasy gel designed to treat active acne and prevent future breakouts.", "category" => "Skin Care"],
            ["title" => "Sandalwood & Saffron Soothing Face Pack", "short" => "Clarifying clay mask enriched with pure sandalwood paste to brighten dull skin.", "category" => "Skin Care"],
            ["title" => "Vitamin C & Hyaluronic Acid Brightening Cream", "short" => "Deeply hydrating day cream that targets dark spots, hyperpigmentation, and uneven tone.", "category" => "Skin Care"],
            ["title" => "Hydrating Aloe Vera & Cucumber Face Mist", "short" => "Instant refreshing mist that calms irritated skin and maintains natural pH balance.", "category" => "Skin Care"]
        ]
    ];

    echo "Starting Seeding of 10 Sellers...\n";

    for ($i = 0; $i < 10; $i++) {
        $brandName = $sellerNames[$i];
        $slugName = Str::slug($brandName);
        $email = strtolower(str_replace(' ', '', $brandName)) . "@cureza-seller.com";
        $phone = "98765432" . str_pad($i, 2, "0", STR_PAD_LEFT);

        echo "\n----------------------------------------\n";
        echo "Creating Seller {$i}: {$brandName} ({$email})\n";

        // 1. Create Seller User
        $user = User::create([
            'name' => $brandName . " Merchant",
            'email' => $email,
            'phone' => $phone,
            'password' => Hash::make('password123'),
            'role' => 'vendor',
            'is_verified' => true,
        ]);

        // 2. Create Brand
        $brandSlug = $slugName;
        if (Brand::where('slug', $brandSlug)->exists()) {
            $brandSlug .= '-' . Str::random(4);
        }

        $brand = Brand::create([
            'name' => $brandName,
            'slug' => $brandSlug,
            'user_id' => $user->id,
            'description' => "Welcome to {$brandName}. We specialize in bringing you the highest quality organic, Ayurvedic, and premium wellness products directly from nature's lap.",
            'short_description' => "Premium certified organic health and beauty brand.",
            'is_active' => true
        ]);

        // 3. Create Seller Profile
        $sellerProfile = SellerProfile::create([
            'user_id' => $user->id,
            'contact_person' => $brandName . " Manager",
            'registering_as' => 'Brand',
            'pan_number' => 'ABCDE' . str_pad($i, 4, "0", STR_PAD_LEFT) . 'F',
            'gst_number' => str_pad($i, 2, "0", STR_PAD_LEFT) . 'ABCDE' . str_pad($i, 4, "0", STR_PAD_LEFT) . 'F' . '1Z5',
            'has_website' => true,
            'address_line_1' => "Suite " . ($i + 1) * 10 . ", Wellness Park",
            'city' => "Bangalore",
            'state' => "Karnataka",
            'country' => "India",
            'pin_code' => "5600" . str_pad($i, 2, "0", STR_PAD_LEFT),
            'status' => 'approved',
            'is_verified' => true
        ]);

        // Link brand_id to user table if column exists
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'brand_id')) {
            $user->brand_id = $brand->id;
            $user->save();
        }

        // 4. Create products for this seller (between 5 and 15 products randomly distributed)
        $numProducts = rand(6, 12);
        echo "Seeding {$numProducts} products for {$brandName}...\n";

        // Shuffle templates to add variety
        $templateKeys = array_keys($productTemplates);

        for ($p = 0; $p < $numProducts; $p++) {
            // Pick a random template category
            $tempCat = $templateKeys[array_rand($templateKeys)];
            // Pick a random template product from that category
            $templates = $productTemplates[$tempCat];
            $tpl = $templates[array_rand($templates)];

            // Find matching category from DB based on template category name
            $dbCat = $categories->first(function ($c) use ($tpl) {
                return strtolower($c->name) === strtolower($tpl['category']);
            });

            if (!$dbCat) {
                // Fallback to random category if exact match not found
                $dbCat = $categories->random();
            }

            // Concern ID: randomly pick a concern or set null
            $dbConcern = (rand(0, 4) > 1 && $concerns->isNotEmpty()) ? $concerns->random() : null;

            $title = $tpl['title'] . " - " . Str::random(3); // make unique
            $price = rand(399, 1999);
            $originalPrice = $price + rand(100, 500);

            // Generate detailed paragraphs for long_description
            $longDesc = "<h2>About the Product</h2><p>" . $tpl['short'] . " Handcrafted with the utmost care, our formula combines traditional secrets with modern science to deliver outstanding performance and purity. Each batch undergoes rigorous third-party laboratory testing to ensure zero contamination and full standard compliance.</p>" .
                        "<h2>Why Choose Our Brand?</h2><p>At <strong>" . $brandName . "</strong>, we believe in transparent sourcing and premium quality. Our ingredients are sustainably harvested in partnership with local farms, supporting fair trade and bio-diversity. We stand behind our quality with a 100% satisfaction guarantee.</p>" .
                        "<h2>Key Benefits</h2><ul><li>Promotes overall physical strength, vitality, and cellular energy production.</li><li>Fortified with bio-enhancers that maximize nutrients absorption in the body.</li><li>Sustainably sourced, 100% vegan, and certified gluten-free.</li><li>Free from synthetic binders, preservatives, artificial colors, or heavy metals.</li></ul>";

            // Generate highlights
            $highlights = [
                "100% Certified Organic & Non-GMO",
                "Third-Party Lab Tested for Purity & Potency",
                "Sustainably Sourced Ingredients",
                "Cruelty-Free & Vegan Friendly Formula",
                "No Artificial Binders, Fillers, or Preservatives"
            ];

            // Generate specifications
            $specifications = [
                ["key" => "Brand", "value" => $brandName],
                ["key" => "Form", "value" => ($tempCat === "CBD Oil" || $tempCat === "Skin Care") ? "Liquid/Serum" : (($tempCat === "Gummies") ? "Gummy" : "Capsule/Tablet")],
                ["key" => "Pack Size", "value" => ($tempCat === "CBD Oil") ? "30 ml" : (($tempCat === "Skin Care") ? "50 ml" : "60 Units")],
                ["key" => "Usage", "value" => "Adults Only (18+)"],
                ["key" => "Country of Origin", "value" => "India"],
                ["key" => "Standard Dosage", "value" => ($tempCat === "Skin Care") ? "Apply 2-3 drops daily" : "1-2 Units daily with warm water"],
                ["key" => "Shelf Life", "value" => "24 Months from Manufacture Date"]
            ];

            // Generate FAQs
            $faqs = [
                [
                    "question" => "How should I store this product?",
                    "answer" => "Store in a cool, dry place away from direct sunlight. Do not freeze or expose to extreme heat. Ensure the cap is tightly closed after each use."
                ],
                [
                    "question" => "Is this safe to take with other dietary supplements?",
                    "answer" => "Yes, this product is formulated with 100% natural organic ingredients and generally has no interactions. However, we always recommend consulting your healthcare provider if you have existing health conditions."
                ],
                [
                    "question" => "How long does it take to see noticeable results?",
                    "answer" => "While many users experience benefits within 7-14 days of consistent daily use, natural herbs and supplements work cumulatively. For best results, use daily for at least 60-90 days."
                ]
            ];

            // Generate additional tabs info (rich HTML sections)
            $additionalInfo = [
                "tabs" => [
                    [
                        "title" => "How To Use",
                        "content" => "<p>For maximum efficacy, follow these recommended guidelines:</p><ul><li><strong>Dosage:</strong> Take " . (($tempCat === "Skin Care") ? "2-3 drops and massage gently onto clean face" : "1 capsule twice daily after meals") . ".</li><li><strong>Timing:</strong> Best taken in the morning and evening.</li><li><strong>Consistency:</strong> Use regularly for a minimum of 4-6 weeks to allow full biological integration.</li></ul>"
                    ],
                    [
                        "title" => "Ingredients Breakdown",
                        "content" => "<p>Every serving of this premium blend is packed with therapeutic-grade components:</p><ul><li><strong>Active Herbal Extracts:</strong> Sourced from pristine ecological zones, standardized to contain high active compounds.</li><li><strong>Natural Carriers & Emulsifiers:</strong> Organic MCT oil or cold-pressed seed oils to enhance bioavailability.</li><li><strong>Zero Synthetics:</strong> Formulated without artificial sweeteners, MSG, magnesium stearate, or silicon dioxide.</li></ul>"
                    ],
                    [
                        "title" => "Safety & Warnings",
                        "content" => "<p>Your health and safety are our top priorities. Please read carefully before use:</p><ul><li>Keep out of reach of children and pets.</li><li>Do not exceed the recommended daily dose.</li><li>If you are pregnant, nursing, taking blood thinners, or awaiting surgery, consult a doctor before use.</li><li>Discontinue immediately if any allergic reaction occurs.</li></ul>"
                    ]
                ]
            ];

            // Generate unique SKU
            $sku = strtoupper(substr(str_replace(' ', '', $brandName), 0, 3)) . "-" . strtoupper(substr($tempCat, 0, 3)) . "-" . rand(1000, 9999);

            // Create product in database
            $product = Product::create([
                'title' => $title,
                'sku' => $sku,
                'brand_id' => $brand->id,
                'category_id' => $dbCat->id,
                'concern_id' => $dbConcern ? $dbConcern->id : null,
                'seller_id' => $user->id,
                'price' => $price,
                'original_price' => $originalPrice,
                'stock' => rand(50, 300),
                'stock_status' => 'in_stock',
                'short_description' => $tpl['short'],
                'long_description' => $longDesc,
                'highlights' => $highlights,
                'specifications' => $specifications,
                'return_policy' => "7 Days Return Policy. Return unopened products for a full refund.",
                'warranty_info' => "100% Satisfaction Guarantee. We stand behind our quality.",
                'additional_info' => $additionalInfo,
                'tags' => [$tempCat, "Organic", "Wellness", "Natural", "Herbals"],
                'faqs' => $faqs,
                'status' => 'published', // Published directly
                'is_prescription_required' => false
            ]);

            // Sync tags in database tags table as well
            $tagIds = [];
            foreach ($product->tags as $tagName) {
                $tag = \App\Models\Tag::firstOrCreate(
                    ['slug' => Str::slug($tagName)],
                    ['name' => $tagName]
                );
                $tagIds[] = $tag->id;
            }
            $product->tags()->sync($tagIds);

            echo " - Product Seeded: {$title} (SKU: {$sku}, Cat: {$dbCat->name})\n";
        }
    }

    DB::commit();
    echo "\n=== SEEDING COMPLETED SUCCESSFULLY ===\n";
    echo "10 New Sellers and their Brands and Profiles have been successfully created!\n";
    echo "All products have been added with premium rich text and custom tabs.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "\nERROR OCCURRED: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . " on line " . $e->getLine() . "\n";
    echo "Seeding rolled back.\n";
}
