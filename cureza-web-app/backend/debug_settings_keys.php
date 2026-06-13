<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$settings = App\Models\SystemSetting::all();
foreach ($settings as $s) {
    echo "Key: {$s->key} | Value: {$s->value} | Group: {$s->group}\n";
}
