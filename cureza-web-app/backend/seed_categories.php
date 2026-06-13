<?php

/**
 * Comprehensive Category & Health Concern Seeder for Cureza
 * Seeds 50 Categories + 50 Health Concerns
 * Run: php seed_categories.php
 */

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Category;
use Illuminate\Support\Str;

echo "\n";
echo "╔══════════════════════════════════════════════════╗\n";
echo "║   🌿 CUREZA - Master Data Seeder                ║\n";
echo "║   50 Categories + 50 Health Concerns            ║\n";
echo "╚══════════════════════════════════════════════════╝\n\n";

// ═══════════════════════════════════════════════════════
// 50 PRODUCT CATEGORIES (type = 'category')
// ═══════════════════════════════════════════════════════

$categories = [
    // ── CBD & Cannabis Products ──
    ['name' => 'CBD Oils & Tinctures', 'description' => 'Premium CBD oils, tinctures, and sublingual drops for daily wellness and targeted relief.', 'icon' => '💧'],
    ['name' => 'THC Oils', 'description' => 'Medical-grade THC oil formulations for therapeutic use under prescription.', 'icon' => '🫒'],
    ['name' => 'Full Spectrum Extracts', 'description' => 'Whole-plant cannabis extracts with full cannabinoid and terpene profiles for the entourage effect.', 'icon' => '🌈'],
    ['name' => 'CBD Isolate Products', 'description' => 'Pure CBD isolate powders, crystals, and formulations — 99%+ purity, THC-free.', 'icon' => '💎'],
    ['name' => 'Cannabis Topicals', 'description' => 'CBD and THC infused creams, balms, and patches for localized pain and skin relief.', 'icon' => '🧴'],
    ['name' => 'Vapes & Inhalables', 'description' => 'Vape cartridges, pens, dry herb vaporizers, and inhalable wellness products.', 'icon' => '💨'],

    // ── Hemp Products ──
    ['name' => 'Hemp Seed Oil', 'description' => 'Cold-pressed hemp seed oil rich in Omega-3, Omega-6, and essential fatty acids.', 'icon' => '🌱'],
    ['name' => 'Hemp Seeds & Hearts', 'description' => 'Hulled hemp seeds and hearts — protein-rich superfoods for smoothies and salads.', 'icon' => '🫘'],
    ['name' => 'Hemp Protein Powder', 'description' => 'Plant-based hemp protein powders for muscle recovery and daily nutrition.', 'icon' => '💪'],
    ['name' => 'Hemp Flour & Fiber', 'description' => 'Gluten-free hemp flour and high-fiber supplements for baking and digestive health.', 'icon' => '🌾'],
    ['name' => 'Hemp Clothing & Textiles', 'description' => 'Sustainable hemp fabric clothing, accessories, and eco-friendly textile products.', 'icon' => '👕'],

    // ── Edibles & Consumables ──
    ['name' => 'Gummies & Edibles', 'description' => 'Tasty CBD and wellness gummies, chocolates, brownies, and edible supplements.', 'icon' => '🍬'],
    ['name' => 'Tea & Herbal Infusions', 'description' => 'Hemp tea, CBD chai, herbal infusions, and functional beverages for relaxation.', 'icon' => '🍵'],
    ['name' => 'Coffee & Energy Drinks', 'description' => 'CBD-infused coffee, matcha blends, and natural energy boosting beverages.', 'icon' => '☕'],
    ['name' => 'Honey & Spreads', 'description' => 'CBD-infused honey, nut butters, and superfood spreads for daily consumption.', 'icon' => '🍯'],
    ['name' => 'Snacks & Nutrition Bars', 'description' => 'Hemp protein bars, seed mix snacks, and healthy munchies for on-the-go nutrition.', 'icon' => '🍫'],

    // ── Supplements & Capsules ──
    ['name' => 'Capsules & Tablets', 'description' => 'Easy-to-swallow capsules and tablets for precise dosing and daily supplementation.', 'icon' => '💊'],
    ['name' => 'Softgels & Gel Caps', 'description' => 'Liquid-filled softgel capsules for faster absorption and better bioavailability.', 'icon' => '🔵'],
    ['name' => 'Powders & Sachets', 'description' => 'Mixable wellness powders, effervescent sachets, and soluble supplement blends.', 'icon' => '📦'],
    ['name' => 'Drops & Sprays', 'description' => 'Oral sprays, sublingual drops, and fast-acting liquid supplements.', 'icon' => '💦'],
    ['name' => 'Multivitamins & Minerals', 'description' => 'Comprehensive daily multivitamin and mineral supplement formulations.', 'icon' => '🧬'],

    // ── Ayurveda & Herbal ──
    ['name' => 'Ayurvedic Medicines', 'description' => 'Classical and proprietary Ayurvedic formulations — churnas, bhasmas, and rasayanas.', 'icon' => '🧘'],
    ['name' => 'Herbal Extracts & Tinctures', 'description' => 'Concentrated herbal extracts, mother tinctures, and plant-based remedies.', 'icon' => '🌿'],
    ['name' => 'Churnas & Powders', 'description' => 'Traditional Ayurvedic powder formulations — Triphala, Ashwagandha, Brahmi, and more.', 'icon' => '🫙'],
    ['name' => 'Kwath & Kadha', 'description' => 'Ayurvedic decoctions, kashayams, and herbal kadha for immunity and digestion.', 'icon' => '🫖'],
    ['name' => 'Ghee & Medicated Oils', 'description' => 'Herbal ghee preparations and medicated Ayurvedic oils for internal and external use.', 'icon' => '🥄'],

    // ── Skincare & Beauty ──
    ['name' => 'Face Care', 'description' => 'Face creams, serums, cleansers, toners, and masks infused with hemp and botanicals.', 'icon' => '✨'],
    ['name' => 'Body Lotions & Creams', 'description' => 'Moisturizing body lotions, creams, and butters for hydration and skin nourishment.', 'icon' => '🧴'],
    ['name' => 'Sunscreen & UV Protection', 'description' => 'Natural sunscreens, SPF lotions, and UV protection products with hemp extracts.', 'icon' => '☀️'],
    ['name' => 'Lip Care', 'description' => 'Hemp lip balms, lip oils, and medicated lip care products for chapped lips.', 'icon' => '👄'],
    ['name' => 'Anti-Aging & Wrinkle Care', 'description' => 'Premium anti-aging serums, retinol creams, and collagen-boosting formulations.', 'icon' => '🪞'],

    // ── Hair Care ──
    ['name' => 'Shampoos & Conditioners', 'description' => 'Hemp and herbal shampoos, conditioners, and cleansing hair care products.', 'icon' => '🧴'],
    ['name' => 'Hair Oils & Serums', 'description' => 'Nourishing hair oils, growth serums, and scalp treatment formulations.', 'icon' => '💇'],
    ['name' => 'Hair Masks & Treatments', 'description' => 'Deep conditioning hair masks, keratin treatments, and repair therapies.', 'icon' => '💆'],

    // ── Body & Bath ──
    ['name' => 'Bath Bombs & Soaks', 'description' => 'CBD bath bombs, Epsom salt soaks, and aromatherapy bath products for relaxation.', 'icon' => '🛁'],
    ['name' => 'Body Wash & Soaps', 'description' => 'Natural body wash, handmade soaps, and cleansing bars with hemp extracts.', 'icon' => '🧼'],
    ['name' => 'Massage Oils & Balms', 'description' => 'Therapeutic massage oils, pain-relief balms, and muscle relaxation blends.', 'icon' => '💆‍♂️'],
    ['name' => 'Oral Care', 'description' => 'Hemp toothpaste, mouthwash, oil pulling formulas, and dental health products.', 'icon' => '🦷'],

    // ── Topicals & Pain Relief ──
    ['name' => 'Pain Relief Roll-Ons', 'description' => 'Convenient roll-on applicators for targeted muscle and joint pain relief.', 'icon' => '🩹'],
    ['name' => 'Patches & Transdermals', 'description' => 'Slow-release transdermal patches for sustained pain relief and wellness delivery.', 'icon' => '🩹'],

    // ── Specialty & Niche ──
    ['name' => 'Pet Care & Wellness', 'description' => 'CBD and hemp products specially formulated for dogs, cats, horses, and other pets.', 'icon' => '🐾'],
    ['name' => 'Intimate Wellness', 'description' => 'Lubricants, massage oils, and intimate care products for personal wellness.', 'icon' => '❤️'],
    ['name' => 'Sports & Fitness', 'description' => 'Pre/post workout supplements, BCAA blends, and recovery aids for athletes.', 'icon' => '🏋️'],
    ['name' => 'Aromatherapy & Essential Oils', 'description' => 'Essential oil blends, diffuser oils, and aromatherapy kits for mood and relaxation.', 'icon' => '🕯️'],
    ['name' => 'Superfoods & Nutrition', 'description' => 'Nutrient-dense superfoods — spirulina, moringa, chia seeds, and superfood mixes.', 'icon' => '🥗'],
    ['name' => 'Probiotics & Gut Health', 'description' => 'Probiotic capsules, prebiotic fibers, and gut microbiome support supplements.', 'icon' => '🦠'],
    ['name' => 'Combo Packs & Kits', 'description' => 'Value bundles, starter kits, gift boxes, and curated wellness combos.', 'icon' => '🎁'],
    ['name' => 'Medical Devices & Accessories', 'description' => 'Vaporizers, dosing tools, droppers, and wellness tracking accessories.', 'icon' => '🔧'],

    // ── Preserve existing categories ──
    ['name' => 'Latest Launch', 'description' => 'Newly launched products and fresh arrivals on Cureza.', 'icon' => '🆕'],
    ['name' => 'Wellness', 'description' => 'General wellness and holistic health products for mind-body balance.', 'icon' => '🌸'],
    ['name' => 'Personal Care', 'description' => 'Personal hygiene, grooming, and daily care products.', 'icon' => '🪥'],
];

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  📂 SEEDING 50 PRODUCT CATEGORIES\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$catCreated = 0;
$catSkipped = 0;
foreach ($categories as $cat) {
    $slug = Str::slug($cat['name']);
    $existing = Category::where('slug', $slug)->first();
    if ($existing) {
        // Update description/icon if blank
        $updated = false;
        if (empty($existing->description) && !empty($cat['description'])) {
            $existing->description = $cat['description'];
            $updated = true;
        }
        if (empty($existing->icon) && !empty($cat['icon'])) {
            $existing->icon = $cat['icon'];
            $updated = true;
        }
        if ($updated) {
            $existing->save();
            echo "  🔄 Updated: {$cat['name']}\n";
        } else {
            echo "  ⏭️  Exists:  {$cat['name']}\n";
        }
        $catSkipped++;
    } else {
        Category::create([
            'name' => $cat['name'],
            'slug' => $slug,
            'type' => 'category',
            'description' => $cat['description'],
            'icon' => $cat['icon'] ?? null,
            'is_active' => true,
        ]);
        $catCreated++;
        echo "  ✅ Created: {$cat['name']}\n";
    }
}
echo "  📊 Categories: {$catCreated} created, {$catSkipped} already existed\n\n";

// ═══════════════════════════════════════════════════════
// 50 HEALTH CONCERNS (type = 'concern')
// ═══════════════════════════════════════════════════════

$concerns = [
    // ── Mental Health & Neurological ──
    ['name' => 'Anxiety & Stress', 'description' => 'Products for managing anxiety, panic disorders, GAD, social anxiety, and daily stress.', 'icon' => '😰'],
    ['name' => 'Depression & Mood Disorders', 'description' => 'Supplements and remedies for emotional balance, low mood, seasonal depression, and bipolar support.', 'icon' => '😔'],
    ['name' => 'Insomnia & Sleep Disorders', 'description' => 'Sleep aids, melatonin alternatives, calming formulas for insomnia, restless legs, and sleep apnea.', 'icon' => '😴'],
    ['name' => 'ADHD & Cognitive Focus', 'description' => 'Brain health supplements for ADHD, improved focus, concentration, and mental clarity.', 'icon' => '🧠'],
    ['name' => 'Migraines & Headaches', 'description' => 'Targeted relief for chronic migraines, tension headaches, cluster headaches, and sinus pressure.', 'icon' => '🤕'],
    ['name' => 'Epilepsy & Seizure Disorders', 'description' => 'Clinically researched CBD formulations for seizure management and neurological support.', 'icon' => '⚡'],
    ['name' => 'Alzheimer\'s & Memory Loss', 'description' => 'Brain health supplements for cognitive decline, dementia, memory support, and neuroprotection.', 'icon' => '🧓'],
    ['name' => 'Parkinson\'s & Tremors', 'description' => 'Supportive supplements for tremor management, dopamine support, and neurological function.', 'icon' => '🤲'],
    ['name' => 'Neuropathy & Nerve Pain', 'description' => 'Products for peripheral neuropathy, diabetic nerve damage, and nerve pain relief.', 'icon' => '⚡'],

    // ── Pain & Inflammation ──
    ['name' => 'Chronic Pain', 'description' => 'Products for persistent body pain, fibromyalgia, neuropathic pain, and pain management.', 'icon' => '🩹'],
    ['name' => 'Arthritis & Joint Pain', 'description' => 'Anti-inflammatory solutions for rheumatoid arthritis, osteoarthritis, joint stiffness, and mobility.', 'icon' => '🦴'],
    ['name' => 'Back Pain & Sciatica', 'description' => 'Topicals, oils, and supplements for lower back pain, sciatica, and spinal discomfort.', 'icon' => '🔙'],
    ['name' => 'Muscle Spasms & Cramps', 'description' => 'Fast-acting relief for muscle cramps, spasms, charley horses, and involuntary contractions.', 'icon' => '💪'],
    ['name' => 'Inflammation & Swelling', 'description' => 'Natural anti-inflammatory products for reducing swelling, edema, and tissue inflammation.', 'icon' => '🔥'],
    ['name' => 'Sports Injuries & Recovery', 'description' => 'Recovery products for sprains, strains, tendonitis, and post-workout soreness (DOMS).', 'icon' => '🏃'],
    ['name' => 'Post-Surgery Recovery', 'description' => 'Supplements and topicals for wound healing, pain management, and faster post-operative recovery.', 'icon' => '🏥'],

    // ── Digestive & Gut Health ──
    ['name' => 'Gut & Digestive Health', 'description' => 'Probiotics, digestive enzymes, and products for IBS, bloating, GERD, and gut wellness.', 'icon' => '🫃'],
    ['name' => 'Nausea & Appetite Loss', 'description' => 'Anti-nausea remedies and appetite stimulants for chemo patients, morning sickness, and more.', 'icon' => '🤢'],
    ['name' => 'Acidity & Bloating', 'description' => 'Antacid supplements, digestive aids, and remedies for acid reflux, heartburn, and bloating.', 'icon' => '🫧'],
    ['name' => 'Constipation & Bowel Health', 'description' => 'Fiber supplements, laxatives, and bowel regularity products for healthy digestion.', 'icon' => '🌿'],

    // ── Weight & Metabolism ──
    ['name' => 'Weight Management', 'description' => 'Metabolism boosters, appetite suppressants, fat burners, and healthy weight loss supplements.', 'icon' => '⚖️'],
    ['name' => 'Obesity & Metabolic Syndrome', 'description' => 'Comprehensive products for obesity management, metabolic reset, and visceral fat reduction.', 'icon' => '📉'],

    // ── Skin & Beauty Concerns ──
    ['name' => 'Acne & Pimples', 'description' => 'Treatments for acne, cystic pimples, blackheads, and blemish-prone skin.', 'icon' => '😤'],
    ['name' => 'Eczema & Psoriasis', 'description' => 'Soothing products for eczema, psoriasis, dermatitis, and chronic inflammatory skin conditions.', 'icon' => '🧑‍⚕️'],
    ['name' => 'Anti-Aging & Wrinkles', 'description' => 'Anti-aging serums, creams, and supplements for wrinkles, fine lines, and youthful skin.', 'icon' => '🪞'],
    ['name' => 'Hair Loss & Thinning', 'description' => 'Products for alopecia, hair fall, thinning, male pattern baldness, and follicle strengthening.', 'icon' => '💇‍♂️'],
    ['name' => 'Pigmentation & Dark Spots', 'description' => 'Skin brightening products for hyperpigmentation, melasma, dark spots, and uneven tone.', 'icon' => '🌟'],
    ['name' => 'Dry & Sensitive Skin', 'description' => 'Ultra-hydrating and hypoallergenic products for extremely dry, cracked, and sensitive skin.', 'icon' => '🧊'],

    // ── Immunity & General Health ──
    ['name' => 'Immunity & Vitality', 'description' => 'Immune-boosting supplements, Vitamin C, Zinc, and tonics for overall vitality and resistance.', 'icon' => '🛡️'],
    ['name' => 'Diabetes & Blood Sugar', 'description' => 'Supplements for blood sugar regulation, insulin sensitivity, and diabetic care support.', 'icon' => '🩸'],
    ['name' => 'Heart Health & Cholesterol', 'description' => 'Cardiovascular support for healthy heart function, cholesterol management, and blood pressure.', 'icon' => '❤️‍🩹'],
    ['name' => 'High Blood Pressure', 'description' => 'Natural supplements and formulations to help manage hypertension and blood pressure levels.', 'icon' => '📊'],
    ['name' => 'Respiratory & Asthma', 'description' => 'Products for lung health, asthma, COPD, breathing support, and respiratory wellness.', 'icon' => '🫁'],
    ['name' => 'Liver Health & Detox', 'description' => 'Liver detoxification, cleansing products, and hepatoprotective supplements.', 'icon' => '🫘'],
    ['name' => 'Kidney Health', 'description' => 'Supplements for kidney function, UTI prevention, and renal wellness support.', 'icon' => '🫛'],
    ['name' => 'Thyroid Health', 'description' => 'Supplements for hypothyroid, hyperthyroid, thyroid balance, and hormonal support.', 'icon' => '🦋'],
    ['name' => 'Anemia & Iron Deficiency', 'description' => 'Iron supplements, B12, folic acid, and blood-building formulations for anemia.', 'icon' => '🔴'],

    // ── Women\'s Health ──
    ['name' => 'Period Pain & PMS', 'description' => 'Relief from menstrual cramps, PMS symptoms, mood swings, and hormonal discomfort.', 'icon' => '🩷'],
    ['name' => 'PCOS & Hormonal Balance', 'description' => 'Supplements for PCOS management, hormonal regulation, and reproductive health.', 'icon' => '♀️'],
    ['name' => 'Menopause & Perimenopause', 'description' => 'Products to ease hot flashes, night sweats, mood swings, and menopausal symptoms.', 'icon' => '🌺'],
    ['name' => 'Pregnancy & Postnatal Care', 'description' => 'Safe supplements, prenatal vitamins, and wellness products for expecting and new mothers.', 'icon' => '🤰'],
    ['name' => 'Fertility & Reproductive Health', 'description' => 'Supplements to support fertility, ovulation, sperm health, and reproductive wellness.', 'icon' => '🌷'],

    // ── Men\'s Health ──
    ['name' => 'Sexual Health & Stamina', 'description' => 'Supplements for libido, erectile function, stamina, and overall sexual wellness.', 'icon' => '🔥'],
    ['name' => 'Prostate Health', 'description' => 'Supplements for prostate wellness, BPH management, and urinary tract health in men.', 'icon' => '♂️'],
    ['name' => 'Testosterone & Male Vitality', 'description' => 'Natural testosterone boosters, energy enhancers, and male vitality supplements.', 'icon' => '🦁'],

    // ── Addiction & Recovery ──
    ['name' => 'De-Addiction & Substance Recovery', 'description' => 'Support for tobacco, alcohol, opioid de-addiction, withdrawal management, and recovery.', 'icon' => '🚭'],

    // ── Children & Elderly ──
    ['name' => 'Children\'s Health', 'description' => 'Safe, age-appropriate supplements, syrups, and remedies for children\'s common health issues.', 'icon' => '👶'],
    ['name' => 'Bone Health & Osteoporosis', 'description' => 'Calcium, Vitamin D, and bone-strengthening supplements for elderly and osteoporosis.', 'icon' => '🦴'],
    ['name' => 'Eye Health & Vision', 'description' => 'Supplements for eye strain, dry eyes, macular degeneration, and vision support.', 'icon' => '👁️'],

    // ── Chronic & Autoimmune ──
    ['name' => 'Cancer Support & Palliative Care', 'description' => 'Supportive care products for managing chemo side effects, nausea, pain, and appetite loss.', 'icon' => '🎗️'],
    ['name' => 'Autoimmune Conditions', 'description' => 'Products for lupus, MS, Crohn\'s disease, celiac, and other autoimmune conditions.', 'icon' => '🧬'],
    ['name' => 'Chronic Fatigue & Low Energy', 'description' => 'Energy-boosting supplements for CFS, adrenal fatigue, burnout, and persistent tiredness.', 'icon' => '🔋'],
];

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "  🏥 SEEDING 50 HEALTH CONCERNS\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
$conCreated = 0;
$conSkipped = 0;
foreach ($concerns as $concern) {
    $slug = Str::slug($concern['name']);
    $existing = Category::where('slug', $slug)->first();
    if ($existing) {
        $updated = false;
        if (empty($existing->description) && !empty($concern['description'])) {
            $existing->description = $concern['description'];
            $updated = true;
        }
        if (empty($existing->icon) && !empty($concern['icon'])) {
            $existing->icon = $concern['icon'];
            $updated = true;
        }
        if ($updated) {
            $existing->save();
            echo "  🔄 Updated: {$concern['name']}\n";
        } else {
            echo "  ⏭️  Exists:  {$concern['name']}\n";
        }
        $conSkipped++;
    } else {
        Category::create([
            'name' => $concern['name'],
            'slug' => $slug,
            'type' => 'concern',
            'description' => $concern['description'],
            'icon' => $concern['icon'] ?? null,
            'is_active' => true,
        ]);
        $conCreated++;
        echo "  ✅ Created: {$concern['name']}\n";
    }
}
echo "  📊 Concerns: {$conCreated} created, {$conSkipped} already existed\n\n";

// ═══════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════
$totalCategories = Category::where('type', 'category')->count();
$totalConcerns = Category::where('type', 'concern')->count();

echo "╔══════════════════════════════════════════════════╗\n";
echo "║  📊 FINAL DATABASE SUMMARY                      ║\n";
echo "╠══════════════════════════════════════════════════╣\n";
echo "║  New categories created:  " . str_pad($catCreated, 4) .                "                ║\n";
echo "║  New concerns created:    " . str_pad($conCreated, 4) .                "                ║\n";
echo "║  ─────────────────────────────────────────────── ║\n";
echo "║  Total categories in DB:  " . str_pad($totalCategories, 4) .           "                ║\n";
echo "║  Total concerns in DB:    " . str_pad($totalConcerns, 4) .             "                ║\n";
echo "║  Grand total:             " . str_pad($totalCategories + $totalConcerns, 4) . "                ║\n";
echo "╠══════════════════════════════════════════════════╣\n";
echo "║  ✅ ALL DONE! Master data seeded successfully.  ║\n";
echo "╚══════════════════════════════════════════════════╝\n\n";
