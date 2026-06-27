<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Populate Category Mega Menu Sections
        $categoryMappings = [
            'thc' => ['thc-oils', 'classical-ayurvedic-medicines', 'vapes-inhalables'],
            'cbd' => ['cbd-oils-tinctures', 'gummies-edibles', 'topicals-roll-ons', 'pet-care'],
            'herbal' => ['herbal-ayurveda', 'ayurveda', 'organic-groceries-pantry', 'aromatherapy-essential-oils'],
            'supplements' => ['supplements-vitamins', 'single-herb-supplements', 'combo-packs-kits', 'intimate-wellness', 'skincare']
        ];

        foreach ($categoryMappings as $section => $slugs) {
            DB::table('categories')
                ->where('type', 'category')
                ->whereIn('slug', $slugs)
                ->update(['mega_menu_section' => $section, 'show_in_mega_menu' => true]);
        }

        // 2. Populate Concern Mega Menu Sections
        $concernMappings = [
            'mental' => [
                'anxiety-stress', 'stress-anxiety', 'depression-mood-disorders', 
                'insomnia-sleep-disorders', 'sleep-disorders', 'adhd-cognitive-focus', 
                'de-addiction-detox', 'addiction-detox', 'mental-health'
            ],
            'physical' => [
                'chronic-pain', 'pain-relief', 'arthritis-joint-pain', 
                'back-pain-muscle-spasms', 'migraines-headaches', 'headaches-migraines', 
                'cancer-support-palliative-care', 'palliative-care', 'injury-recovery'
            ],
            'general' => [
                'gut-digestive-health', 'nausea-appetite-loss', 'acidity-bloating', 
                'constipation-bowel-health', 'weight-management', 'obesity-metabolic-syndrome',
                'acne-pimples', 'eczema-psoriasis', 'anti-aging-wrinkles', 'hair-loss-thinning',
                'pigmentation-dark-spots', 'dry-sensitive-skin', 'immunity-vitality', 
                'diabetes-blood-sugar', 'heart-health-cholesterol', 'high-blood-pressure',
                'respiratory-asthma', 'liver-health-detox', 'kidney-health', 'thyroid-health',
                'anemia-iron-deficiency'
            ]
        ];

        foreach ($concernMappings as $section => $slugs) {
            DB::table('categories')
                ->where('type', 'concern')
                ->where(function ($query) use ($slugs) {
                    foreach ($slugs as $slug) {
                        $query->orWhere('slug', 'like', '%' . $slug . '%');
                    }
                })
                ->update(['mega_menu_section' => $section, 'show_in_mega_menu' => true]);
        }

        // 3. Populate Brand Mega Menu Sections
        $brandMappings = [
            'cannabis_hemp' => ['aura-wellness', 'hemp-horizon', 'green-earth'],
            'ayurvedic_herbal' => ['ayurlife-organics', 'vedic-pure', 'somya-herbals', 'pure-ayur', 'sattva-remedies', 'amrit-life'],
            'wellness_care' => ['prana-naturals', 'green-elements', 'ojas-organics', 'noelle-rosa']
        ];

        foreach ($brandMappings as $section => $slugs) {
            DB::table('brands')
                ->whereIn('slug', $slugs)
                ->update(['mega_menu_section' => $section, 'show_in_mega_menu' => true]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('categories')->update(['mega_menu_section' => null]);
        DB::table('brands')->update(['mega_menu_section' => null]);
    }
};
