<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogPostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:blog_posts,slug,' . $this->route('post'),
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'featured_image' => 'nullable',
            'category_id' => 'required|exists:blog_categories,id',
            'author_id' => 'required|exists:blog_authors,id',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:255',
            'meta_keywords' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:blog_tags,id',
            'fact_checked_by' => 'nullable|string|max:255',
            'fact_checker_title' => 'nullable|string|max:255',
            'fact_checker_image' => 'nullable',
            'fact_checker_credentials' => 'nullable|string|max:1000',
            'recommended_products' => 'nullable|array',
            'citations' => 'nullable|array',
        ];
    }

    protected function prepareForValidation()
    {
        if (is_string($this->recommended_products)) {
            $this->merge([
                'recommended_products' => json_decode($this->recommended_products, true),
            ]);
        }

        if (is_string($this->citations)) {
            $this->merge([
                'citations' => json_decode($this->citations, true),
            ]);
        }
    }
}
