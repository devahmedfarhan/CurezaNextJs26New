<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Faq extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'topic_id',
        'topic_title',
        'topic_icon',
        'topic_description',
        'subtopic_id',
        'subtopic_title',
        'question',
        'answer',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function booted()
    {
        static::saved(function () {
            self::writeStaticJson();
        });

        static::deleted(function () {
            self::writeStaticJson();
        });
    }

    /**
     * Export all FAQs to frontend static JSON files.
     */
    public static function writeStaticJson()
    {
        try {
            $dir = base_path('../frontend/src/data');
            
            // Create directory if not exists
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }

            // 1. Export Help Center FAQs
            $helpFaqs = self::where('category', 'help')
                ->orderBy('order')
                ->get();

            $topics = [];
            foreach ($helpFaqs as $faq) {
                $topicId = $faq->topic_id;
                if (empty($topicId)) {
                    continue;
                }

                if (!isset($topics[$topicId])) {
                    $topics[$topicId] = [
                        'id' => $topicId,
                        'title' => $faq->topic_title ?: ucfirst($topicId),
                        'icon' => $faq->topic_icon ?: 'HelpCircle',
                        'description' => $faq->topic_description ?: '',
                        'subTopics' => []
                    ];
                }

                $subTopicId = $faq->subtopic_id ?: 'general';
                if (!isset($topics[$topicId]['subTopics'][$subTopicId])) {
                    $topics[$topicId]['subTopics'][$subTopicId] = [
                        'id' => $subTopicId,
                        'title' => $faq->subtopic_title ?: ucfirst($subTopicId),
                        'faqs' => []
                    ];
                }

                // Generate or use question slug
                $faqId = Str::slug(substr($faq->question, 0, 50));
                $topics[$topicId]['subTopics'][$subTopicId]['faqs'][] = [
                    'id' => $faqId,
                    'q' => $faq->question,
                    'a' => $faq->answer
                ];
            }

            // Convert nested arrays to simple arrays
            $finalTopics = [];
            foreach ($topics as $topicId => $topicData) {
                $subTopics = [];
                foreach ($topicData['subTopics'] as $subTopicId => $subTopicData) {
                    $subTopics[] = $subTopicData;
                }
                $topicData['subTopics'] = $subTopics;
                $finalTopics[] = $topicData;
            }

            $helpPath = $dir . '/help-faqs.json';
            file_put_contents($helpPath, json_encode($finalTopics, JSON_PRETTY_PRINT));

            // 2. Export Homepage FAQs
            $homeFaqs = self::where('category', 'home')
                ->orderBy('order')
                ->get()
                ->map(function ($faq) {
                    return [
                        'question' => $faq->question,
                        'answer' => $faq->answer
                    ];
                });

            $homePath = $dir . '/home-faqs.json';
            file_put_contents($homePath, json_encode($homeFaqs, JSON_PRETTY_PRINT));

            \Illuminate\Support\Facades\Log::info("Wrote static FAQs to frontend: {$helpPath} and {$homePath}");
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to write static FAQs: " . $e->getMessage());
        }
    }
}
