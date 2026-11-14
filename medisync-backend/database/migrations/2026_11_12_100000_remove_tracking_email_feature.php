<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('jobs')) {
            DB::table('jobs')->where('payload', 'like', '%SendTrackingCodeEmail%')->delete();
        }
        if (Schema::hasTable('failed_jobs')) {
            DB::table('failed_jobs')->where('payload', 'like', '%SendTrackingCodeEmail%')->delete();
        }
        Schema::dropIfExists('tracking_email_deliveries');
        if (Schema::hasColumn('patients', 'email')) {
            Schema::table('patients', fn (Blueprint $table) => $table->dropColumn('email'));
        }
    }

    public function down(): void
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
};
