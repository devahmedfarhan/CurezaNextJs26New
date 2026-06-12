<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use App\Models\Brand;
use App\Models\Order;

echo "--- FINAL AUDIT START ---\n";

// 1. Orphan Products
$orphanProducts = Product::whereNotIn('seller_id', User::pluck('id'))->count();
echo "Orphan Products: $orphanProducts\n";

// 2. Orphan Brands
$orphanBrands = Brand::whereNotIn('user_id', User::pluck('id'))->count();
echo "Orphan Brands: $orphanBrands\n";

// 3. Admin Users
$admins = User::whereIn('role', ['admin', 'super_admin'])->count();
echo "Admin Users: $admins\n";

// 4. Sellers without Brand (Should be 0 due to my OneToOne fix)
$sellersNoBrand = User::where('role', 'vendor')->doesntHave('brand')->count();
echo "Sellers without Brand: $sellersNoBrand\n";

echo "--- FINAL AUDIT END ---\n";
