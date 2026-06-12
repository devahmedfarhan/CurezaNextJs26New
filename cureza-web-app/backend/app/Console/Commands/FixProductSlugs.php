<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Str;

class FixProductSlugs extends Command
{
    protected $signature = 'fix:slugs';
    protected $description = 'Generate slugs for products missing them';

    public function handle()
    {
        $products = Product::whereNull('slug')->get();
        foreach ($products as $product) {
            $product->slug = Str::slug($product->title) . '-' . Str::random(6);
            $product->save();
            $this->info("Updated: {$product->title}");
        }
        $this->info('Done.');
    }
}
