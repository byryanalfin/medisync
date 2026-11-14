<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', fn (Blueprint $table) => $table->string('email')->nullable());
        Schema::create('tracking_email_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('recipient');
            $table->string('status')->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tracking_email_deliveries');
        Schema::table('patients', fn (Blueprint $table) => $table->dropColumn('email'));
    }
};
