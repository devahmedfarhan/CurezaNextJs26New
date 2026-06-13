<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoryConcernSeeder extends Seeder
{
    /**
     * Seed all product categories and health concerns.
     */
    public function run(): void
    {
        $this->command->info('🌿 Seeding Product Categories...');
        $this->seedCategories();

        $this->command->info('🏥 Seeding Health Concerns...');
        $this->seedConcerns();

        $this->command->info('✅ All categories and concerns seeded successfully!');
    }

    private function seedCategories(): void
    {
        $categories = [
            // ── Core Product Types ──
            [
                'name' => 'CBD Oils & Tinctures',
                'description' => 'Premium CBD oils, tinctures, and sublingual drops for daily wellness and targeted relief.',
                'icon' => '💧',
            ],
            [
                'name' => 'THC Oils',
                'description' => 'Medical-grade THC oil formulations for therapeutic use under prescription.',
                'icon' => '🫒',
            ],
            [
                'name' => 'Hemp Seed Oil',
                'description' => 'Cold-pressed hemp seed oil rich in Omega-3, Omega-6, and essential fatty acids.',
                'icon' => '🌱',
            ],
            [
                'name' => 'Gummies & Edibles',
                'description' => 'Tasty CBD and wellness gummies, chocolates, and edible supplements.',
                'icon' => '🍬',
            ],
            [
                'name' => 'Capsules & Tablets',
                'description' => 'Easy-to-swallow capsules and tablets for precise dosing and daily supplementation.',
                'icon' => '💊',
            ],
            [
                'name' => 'Topicals & Roll-Ons',
                'description' => 'Pain-relief balms, creams, roll-ons, and transdermal patches for targeted application.',
                'icon' => '🧴',
            ],
            [
                'name' => 'Vapes & Inhalables',
                'description' => 'Vape cartridges, pens, and inhalable wellness products for fast-acting relief.',
                'icon' => '💨',
            ],

            // ── Wellness & Lifestyle ──
            [
                'name' => 'Superfoods',
                'description' => 'Nutrient-dense superfoods including hemp hearts, protein powders, and seed mixes.',
                'icon' => '🥗',
            ],
            [
                'name' => 'Herbal & Ayurveda',
                'description' => 'Traditional Ayurvedic formulations and herbal remedies rooted in ancient wisdom.',
                'icon' => '🌿',
            ],
            [
                'name' => 'Supplements & Vitamins',
                'description' => 'Dietary supplements, multivitamins, and nutraceuticals for optimal health.',
                'icon' => '💪',
            ],
            [
                'name' => 'Tea & Beverages',
                'description' => 'Hemp tea, herbal infusions, and functional beverages for relaxation and wellness.',
                'icon' => '🍵',
            ],

            // ── Personal Care ──
            [
                'name' => 'Skincare',
                'description' => 'Face creams, serums, masks, and moisturizers infused with hemp and natural extracts.',
                'icon' => '✨',
            ],
            [
                'name' => 'Haircare',
                'description' => 'Shampoos, conditioners, hair oils, and treatments for healthy hair and scalp.',
                'icon' => '💇',
            ],
            [
                'name' => 'Body Care & Bath',
                'description' => 'Bath bombs, body lotions, scrubs, and soaps for a luxurious self-care routine.',
                'icon' => '🛁',
            ],
            [
                'name' => 'Oral Care',
                'description' => 'Hemp-infused toothpaste, mouthwash, and oral health products.',
                'icon' => '🦷',
            ],

            // ── Specialty ──
            [
                'name' => 'Pet Care',
                'description' => 'CBD and hemp products specially formulated for pets — dogs, cats, and horses.',
                'icon' => '🐾',
            ],
            [
                'name' => 'Intimate Wellness',
                'description' => 'Lubricants, massage oils, and intimate care products for personal wellness.',
                'icon' => '❤️',
            ],
            [
                'name' => 'Sports & Fitness',
                'description' => 'Pre/post workout supplements, protein blends, and recovery aids for active lifestyles.',
                'icon' => '🏋️',
            ],
            [
                'name' => 'Aromatherapy & Essential Oils',
                'description' => 'Essential oil blends, diffuser oils, and aromatherapy kits for mood and relaxation.',
                'icon' => '🕯️',
            ],
            [
                'name' => 'Combo Packs & Kits',
                'description' => 'Value bundles, starter kits, and curated wellness combos for comprehensive care.',
                'icon' => '📦',
            ],

            // ── Keep existing categories that may already have products linked ──
            [
                'name' => 'Latest Launch',
                'description' => 'Newly launched products and fresh arrivals on Cureza.',
                'icon' => '🆕',
            ],
            [
                'name' => 'Ayurveda',
                'description' => 'Traditional Ayurvedic medicines and formulations.',
                'icon' => '🧘',
            ],
            [
                'name' => 'Wellness',
                'description' => 'General wellness and holistic health products.',
                'icon' => '🌸',
            ],
            [
                'name' => 'Supplements',
                'description' => 'Health supplements, vitamins, and dietary aids.',
                'icon' => '🧬',
            ],
            [
                'name' => 'Personal Care',
                'description' => 'Personal hygiene and grooming products.',
                'icon' => '🪥',
            ],
        ];

        foreach ($categories as $cat) {
            $slug = Str::slug($cat['name']);
            Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $cat['name'],
                    'slug' => $slug,
                    'type' => 'category',
                    'description' => $cat['description'],
                    'icon' => $cat['icon'] ?? null,
                    'is_active' => true,
                ]
            );
            $this->command->line("  ✓ Category: {$cat['name']}");
        }
    }

    private function seedConcerns(): void
    {
        $concerns = [
            // ── Mental Health & Neurological ──
            [
                'name' => 'Anxiety & Stress',
                'description' => 'Products for managing anxiety, nervousness, panic disorders, and daily stress.',
                'icon' => '😰',
            ],
            [
                'name' => 'Depression & Mood Disorders',
                'description' => 'Supplements and remedies to support emotional balance and uplift mood.',
                'icon' => '😔',
            ],
            [
                'name' => 'Insomnia & Sleep Disorders',
                'description' => 'Sleep aids, calming formulas, and products for better sleep quality.',
                'icon' => '😴',
            ],
            [
                'name' => 'ADHD & Cognitive Focus',
                'description' => 'Brain health supplements for improved focus, concentration, and mental clarity.',
                'icon' => '🧠',
            ],
            [
                'name' => 'Migraines & Headaches',
                'description' => 'Targeted relief products for chronic migraines, tension headaches, and cluster headaches.',
                'icon' => '🤕',
            ],
            [
                'name' => 'Epilepsy & Seizure Disorders',
                'description' => 'Clinically researched formulations for seizure management and neurological support.',
                'icon' => '⚡',
            ],

            // ── Pain & Inflammation ──
            [
                'name' => 'Chronic Pain',
                'description' => 'Products for managing persistent body pain, neuropathic pain, and fibromyalgia.',
                'icon' => '🩹',
            ],
            [
                'name' => 'Arthritis & Joint Pain',
                'description' => 'Anti-inflammatory solutions for arthritis, joint stiffness, and mobility support.',
                'icon' => '🦴',
            ],
            [
                'name' => 'Back Pain & Muscle Spasms',
                'description' => 'Topicals, oils, and oral supplements for back pain and muscle cramp relief.',
                'icon' => '🔙',
            ],
            [
                'name' => 'Inflammation & Swelling',
                'description' => 'Natural anti-inflammatory products for reducing swelling and tissue inflammation.',
                'icon' => '🔥',
            ],
            [
                'name' => 'Sports Injuries & Recovery',
                'description' => 'Fast-acting recovery products for sprains, strains, and post-workout soreness.',
                'icon' => '🏃',
            ],

            // ── Digestive & Gut Health ──
            [
                'name' => 'Gut & Digestive Health',
                'description' => 'Probiotics, digestive enzymes, and products for IBS, bloating, and gut wellness.',
                'icon' => '🫃',
            ],
            [
                'name' => 'Nausea & Appetite',
                'description' => 'Anti-nausea remedies and appetite stimulants for chemotherapy patients and others.',
                'icon' => '🤢',
            ],
            [
                'name' => 'Weight Management',
                'description' => 'Metabolism boosters, fat burners, and healthy weight management supplements.',
                'icon' => '⚖️',
            ],

            // ── Skin & Beauty ──
            [
                'name' => 'Acne & Skin Conditions',
                'description' => 'Treatments for acne, eczema, psoriasis, dermatitis, and other skin conditions.',
                'icon' => '🧑‍⚕️',
            ],
            [
                'name' => 'Anti-Aging & Wrinkles',
                'description' => 'Anti-aging serums, creams, and supplements for youthful, radiant skin.',
                'icon' => '🪞',
            ],
            [
                'name' => 'Hair Loss & Thinning',
                'description' => 'Products to combat hair fall, promote regrowth, and strengthen hair follicles.',
                'icon' => '💇‍♂️',
            ],

            // ── Immunity & General Health ──
            [
                'name' => 'Immunity & Vitality',
                'description' => 'Immune-boosting supplements and tonics for overall vitality and disease resistance.',
                'icon' => '🛡️',
            ],
            [
                'name' => 'Diabetes & Blood Sugar',
                'description' => 'Supplements and formulations for blood sugar regulation and diabetic care.',
                'icon' => '🩸',
            ],
            [
                'name' => 'Heart Health & Blood Pressure',
                'description' => 'Cardiovascular support products for healthy heart function and blood pressure management.',
                'icon' => '❤️‍🩹',
            ],
            [
                'name' => 'Respiratory & Asthma',
                'description' => 'Products for lung health, breathing support, and respiratory wellness.',
                'icon' => '🫁',
            ],
            [
                'name' => 'Liver & Kidney Detox',
                'description' => 'Detoxification and cleansing products for liver and kidney health.',
                'icon' => '🫘',
            ],
            [
                'name' => 'Thyroid Health',
                'description' => 'Supplements and natural remedies for thyroid balance and hormonal support.',
                'icon' => '🦋',
            ],

            // ── Women's Health ──
            [
                'name' => 'Period Pain & PMS',
                'description' => 'Relief from menstrual cramps, PMS symptoms, and hormonal discomfort.',
                'icon' => '🩷',
            ],
            [
                'name' => 'PCOS & Hormonal Balance',
                'description' => 'Supplements for PCOS management, hormonal regulation, and reproductive health.',
                'icon' => '♀️',
            ],
            [
                'name' => 'Menopause Support',
                'description' => 'Products to ease hot flashes, mood swings, and other menopausal symptoms.',
                'icon' => '🌺',
            ],
            [
                'name' => 'Pregnancy & Postnatal Care',
                'description' => 'Safe supplements and wellness products for expecting and new mothers.',
                'icon' => '🤰',
            ],

            // ── Men's Health ──
            [
                'name' => 'Sexual Health & Performance',
                'description' => 'Supplements for libido, stamina, and overall sexual wellness for men and women.',
                'icon' => '🔥',
            ],
            [
                'name' => 'Prostate Health',
                'description' => 'Supplements and natural remedies for prostate wellness and urinary health.',
                'icon' => '♂️',
            ],

            // ── Addiction & Recovery ──
            [
                'name' => 'De-Addiction & Detox',
                'description' => 'Support products for tobacco, alcohol, and substance de-addiction and recovery.',
                'icon' => '🚭',
            ],

            // ── Eye & Ear Health ──
            [
                'name' => 'Eye Health & Vision',
                'description' => 'Supplements for eye strain, vision support, and retinal health.',
                'icon' => '👁️',
            ],

            // ── Children's Health ──
            [
                'name' => 'Children\'s Health',
                'description' => 'Safe, age-appropriate supplements and remedies for children\'s common health concerns.',
                'icon' => '👶',
            ],

            // ── Cancer Support ──
            [
                'name' => 'Cancer Support & Palliative Care',
                'description' => 'Supportive care products for managing side effects of cancer treatment.',
                'icon' => '🎗️',
            ],

            // ── Bone & Dental ──
            [
                'name' => 'Bone Health & Osteoporosis',
                'description' => 'Calcium, Vitamin D, and bone-strengthening supplements for skeletal health.',
                'icon' => '🦴',
            ],

            // ── Neurological ──
            [
                'name' => 'Alzheimer\'s & Memory Loss',
                'description' => 'Brain health supplements for cognitive decline, memory support, and neuroprotection.',
                'icon' => '🧓',
            ],
            [
                'name' => 'Parkinson\'s & Tremors',
                'description' => 'Supportive supplements for tremor management and neurological function.',
                'icon' => '🤲',
            ],

            // ── Autoimmune & Chronic ──
            [
                'name' => 'Autoimmune Conditions',
                'description' => 'Products for lupus, MS, Crohn\'s disease, and other autoimmune conditions.',
                'icon' => '🧬',
            ],
            [
                'name' => 'Chronic Fatigue & Energy',
                'description' => 'Energy-boosting supplements for chronic fatigue syndrome and low vitality.',
                'icon' => '⚡',
            ],
        ];

        foreach ($concerns as $concern) {
            $slug = Str::slug($concern['name']);
            Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'name' => $concern['name'],
                    'slug' => $slug,
                    'type' => 'concern',
                    'description' => $concern['description'],
                    'icon' => $concern['icon'] ?? null,
                    'is_active' => true,
                ]
            );
            $this->command->line("  ✓ Concern: {$concern['name']}");
        }
    }
}
