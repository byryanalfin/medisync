<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->boolean('bpjs_card_checked')->default(false);
            $table->boolean('bpjs_identity_checked')->default(false);
            $table->boolean('bpjs_documents_checked')->default(false);
            $table->text('bpjs_notes')->nullable();
            $table->foreignId('bpjs_checked_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('bpjs_checked_at')->nullable();
            $table->timestamp('bpjs_verified_at')->nullable();
        });

        Schema::create('prescription_status_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prescription_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescription_status_events');
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bpjs_checked_by');
            $table->dropColumn(['bpjs_card_checked', 'bpjs_identity_checked', 'bpjs_documents_checked', 'bpjs_notes', 'bpjs_checked_at', 'bpjs_verified_at']);
        });
    }
};
