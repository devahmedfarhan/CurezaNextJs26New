<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('attributes')) {
            Schema::create('attributes', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique(); // e.g., "Certification", "Ingredient"
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('attributes');
    }
};
