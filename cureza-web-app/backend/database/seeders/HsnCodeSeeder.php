<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class HsnCodeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hsnCodes = [
            // Chapter 30: Pharmaceutical Products
            [
                'code' => '30049011',
                'description' => 'Ayurvedic Medicines (System of Indian Medicine)',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049012',
                'description' => 'Unani Medicines (System of Indian Medicine)',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049013',
                'description' => 'Siddha Medicines (System of Indian Medicine)',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049014',
                'description' => 'Homeopathic Medicines',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049015',
                'description' => 'Bio-chemic / Biochemic Medicines',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049099',
                'description' => 'Allopathic / General Modern Medicaments (for retail sale)',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30049099-L',
                'description' => 'Lifesaving Cancer Drugs & Specified Oncology Medicines',
                'gst_rate' => 0.00,
            ],
            [
                'code' => '30022019',
                'description' => 'Human Vaccines & Immunological Products',
                'gst_rate' => 0.00,
            ],
            [
                'code' => '30059040',
                'description' => 'Sterile Surgical Catgut, Sutures, Dressings & Bandages',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '30067000',
                'description' => 'Gel preparations for medical/lubricant or diagnostic uses',
                'gst_rate' => 5.00,
            ],
            
            // Chapter 33: Cosmetics & Personal Care
            [
                'code' => '33049910',
                'description' => 'Face Creams, Skin Creams, Sunscreens & Anti-aging creams',
                'gst_rate' => 18.00,
            ],
            [
                'code' => '33049930',
                'description' => 'Moisturizing Lotions & Body Lotions',
                'gst_rate' => 18.00,
            ],
            [
                'code' => '33049920',
                'description' => 'Face Powders, Talcum Powders & Compact powders',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '33051000',
                'description' => 'Hair Shampoos & Cleansers',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '33059011',
                'description' => 'Perfumed Hair Oils, Amla Oil & Herbal Hair Growth Oils',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '33059019',
                'description' => 'Hair Conditioners, Hair Serums & Hair Gels',
                'gst_rate' => 18.00,
            ],
            [
                'code' => '33061020',
                'description' => 'Toothpastes, Mouthwashes & Oral Hygiene Preparations',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '33074900',
                'description' => 'Agarbatti, Incense Sticks & Dhoop',
                'gst_rate' => 5.00,
            ],
            
            // Chapter 34: Soaps & Handwash
            [
                'code' => '34011110',
                'description' => 'Toilet Soaps, Medicated Soaps & Neem/Herbal Bathing Bars',
                'gst_rate' => 5.00,
            ],
            [
                'code' => '34013011',
                'description' => 'Liquid Handwash, Face Wash & Bodywash Preparations',
                'gst_rate' => 5.00,
            ],

            // Chapter 21: Food Supplements & Nutraceuticals
            [
                'code' => '21069099',
                'description' => 'Nutraceuticals, Dietary Supplements, Protein Powders & Vitamins',
                'gst_rate' => 18.00,
            ],
            [
                'code' => '22029990',
                'description' => 'Health Drinks, Aloe Vera juices, Amla juices & Giloy juices',
                'gst_rate' => 5.00,
            ],

            // Chapter 90 & 38: Medical Devices & Diagnostics
            [
                'code' => '90189099',
                'description' => 'Medical Surgical Instruments, Blood Pressure Monitors & Syringes',
                'gst_rate' => 12.00,
            ],
            [
                'code' => '90251190',
                'description' => 'Digital Thermometers, Infrared Thermometers & diagnostic monitors',
                'gst_rate' => 12.00,
            ],
            [
                'code' => '90191020',
                'description' => 'Electric Massage Apparatus & Body Massagers',
                'gst_rate' => 18.00,
            ],
            [
                'code' => '90200000',
                'description' => 'Oxygen Concentrators, Nebulizers & Breathing Apparatus',
                'gst_rate' => 12.00,
            ],
            [
                'code' => '38220090',
                'description' => 'Rapid Diagnostic Test Kits (Pregnancy, Glucose, COVID-19)',
                'gst_rate' => 12.00,
            ],
            [
                'code' => '40151100',
                'description' => 'Sterile Surgical Rubber Gloves & Nitrile Examination Gloves',
                'gst_rate' => 12.00,
            ],

            // Services & Insurance
            [
                'code' => '997133',
                'description' => 'Individual Health Insurance & Family Floaters',
                'gst_rate' => 0.00,
            ],
            [
                'code' => '997131',
                'description' => 'Life Insurance (Term, ULIP, Endowment policies)',
                'gst_rate' => 0.00,
            ],
        ];

        foreach ($hsnCodes as $codeData) {
            \App\Models\HsnCode::updateOrCreate(
                ['code' => $codeData['code']],
                [
                    'description' => $codeData['description'],
                    'gst_rate' => $codeData['gst_rate'],
                ]
            );
        }
    }
}
