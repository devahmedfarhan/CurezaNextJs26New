<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('attribute_values')) {
            Schema::create('attribute_values', function (Blueprint $table) {
                $table->id();
                $table->foreignId('attribute_id')->constrained()->cascadeOnDelete();
                $table->string('value'); // e.g., "FDA Approved", "Vitamin C"
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('attribute_values');
    }
};
