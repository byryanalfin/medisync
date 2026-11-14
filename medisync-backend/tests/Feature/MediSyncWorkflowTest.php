<?php

namespace Tests\Feature;

use App\Models\Examination;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediSyncWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'dokter'): User
    {
        return User::create(['name' => $role === 'dokter' ? 'dr. Uji' : 'Petugas Uji', 'email' => uniqid().'@medisync.test', 'nip' => uniqid(), 'password' => 'test-password', 'role' => $role]);
    }

    private function patient(): Patient
    {
        return Patient::create(['name' => 'Pasien Uji', 'rm_number' => 'RM-'.uniqid(), 'birth_date' => '1990-01-01', 'gender' => 'Perempuan']);
    }

    private function examination(User $doctor): Examination
    {
        return Examination::create(['patient_id' => $this->patient()->id, 'doctor_id' => $doctor->id, 'complaints' => 'Keluhan uji', 'diagnosis' => 'Diagnosis uji', 'care_decision' => 'rawat_jalan']);
    }

    private function prescription(User $doctor): Prescription
    {
        $prescription = Prescription::create(['examination_id' => $this->examination($doctor)->id, 'doctor_id' => $doctor->id, 'status' => 'approved', 'tracking_code' => 'MS-'.strtoupper(substr(uniqid(), -6))]);
        $prescription->items()->create(['drug_name' => 'Obat Uji', 'quantity' => '10 tablet', 'dosage' => 'Sesuai resep uji', 'instructions' => 'Sesuai petunjuk dokter', 'notes' => 'Catatan internal']);

        return $prescription;
    }

    public function test_login_me_and_logout_use_a_real_token(): void
    {
        $doctor = $this->user();
        $token = $this->postJson('/api/login', ['email' => $doctor->email, 'password' => 'test-password'])->assertOk()->json('token');
        $this->withToken($token)->getJson('/api/me')->assertOk()->assertJsonPath('user.id', $doctor->id);
        $this->withToken($token)->postJson('/api/logout')->assertOk();
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_invalid_credentials_and_missing_auth_are_rejected(): void
    {
        $this->postJson('/api/login', ['email' => 'missing@medisync.test', 'password' => 'incorrect'])->assertUnauthorized();
        $this->getJson('/api/prescriptions')->assertUnauthorized();
    }

    public function test_bpjs_checklist_and_notes_survive_another_request(): void
    {
        $prescription = $this->prescription($this->user());
        $pharmacist = $this->user('admin_apoteker');
        Sanctum::actingAs($pharmacist);
        $payload = ['bpjs_card_checked' => true, 'bpjs_identity_checked' => false, 'bpjs_documents_checked' => false, 'bpjs_notes' => 'Menunggu identitas'];
        $this->putJson("/api/prescriptions/{$prescription->id}/bpjs", $payload)->assertOk()->assertJsonPath('data.bpjs_verified_at', null);
        $this->getJson("/api/prescriptions/{$prescription->id}")->assertOk()->assertJsonPath('data.bpjs_card_checked', true)->assertJsonPath('data.bpjs_identity_checked', false)->assertJsonPath('data.bpjs_notes', 'Menunggu identitas')->assertJsonPath('data.bpjs_verifier.id', $pharmacist->id);
        $payload['bpjs_identity_checked'] = $payload['bpjs_documents_checked'] = true;
        $this->putJson("/api/prescriptions/{$prescription->id}/bpjs", $payload)->assertOk();
        $this->assertNotNull($prescription->fresh()->bpjs_verified_at);
        $payload['bpjs_card_checked'] = false;
        $this->putJson("/api/prescriptions/{$prescription->id}/bpjs", $payload)->assertOk()->assertJsonPath('data.bpjs_verified_at', null);
    }

    public function test_status_is_sequential_idempotent_and_has_an_audit_trail(): void
    {
        $prescription = $this->prescription($this->user());
        Sanctum::actingAs($this->user('admin_apoteker'));
        $this->putJson("/api/prescriptions/{$prescription->id}/status", ['status' => 'ready'])->assertUnprocessable();
        foreach (['accepted', 'preparing', 'ready', 'picked_up'] as $status) {
            $this->putJson("/api/prescriptions/{$prescription->id}/status", ['status' => $status])->assertOk()->assertJsonPath('data.status', $status);
        }
        $this->putJson("/api/prescriptions/{$prescription->id}/status", ['status' => 'picked_up'])->assertOk();
        $this->assertDatabaseCount('prescription_status_events', 4);
        $this->putJson("/api/prescriptions/{$prescription->id}/status", ['status' => 'preparing'])->assertUnprocessable();
    }

    public function test_public_tracking_contains_requested_details_and_excludes_internal_data(): void
    {
        $prescription = $this->prescription($doctor = $this->user());
        $this->getJson('/api/tracking/'.strtolower($prescription->tracking_code))->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('data.patient_name', 'Pasien Uji')
            ->assertJsonPath('data.doctor_name', $doctor->name)
            ->assertJsonPath('data.items.0.drug_name', 'Obat Uji')
            ->assertJsonMissingPath('data.rm_number')->assertJsonMissingPath('data.bpjs_notes')->assertJsonMissingPath('data.items.0.notes');
        $this->getJson('/api/tracking/MS-XXXXXX')->assertNotFound();
    }

    public function test_roles_cannot_change_each_others_work(): void
    {
        $doctor = $this->user();
        $prescription = $this->prescription($doctor);
        Sanctum::actingAs($doctor);
        $this->putJson("/api/prescriptions/{$prescription->id}/status", ['status' => 'accepted'])->assertForbidden();
        $this->putJson("/api/prescriptions/{$prescription->id}/bpjs", [])->assertForbidden();
        Sanctum::actingAs($this->user('admin_apoteker'));
        $this->postJson('/api/examinations', [])->assertForbidden();
        $this->postJson('/api/prescriptions', [])->assertForbidden();
        Sanctum::actingAs($this->user());
        $this->putJson("/api/prescriptions/{$prescription->id}", ['status' => 'approved'])->assertForbidden();
    }

    public function test_prescriptions_are_atomic_owned_by_authenticated_doctor_and_not_duplicated(): void
    {
        $doctor = $this->user();
        $examination = $this->examination($doctor);
        Sanctum::actingAs($doctor);
        $payload = ['examination_id' => $examination->id, 'doctor_id' => $this->user()->id, 'status' => 'approved', 'items' => [['drug_name' => 'Obat Uji', 'quantity' => '10 tablet', 'dosage' => 'Dosis uji', 'instructions' => 'Instruksi uji']]];
        $response = $this->postJson('/api/prescriptions', $payload)->assertCreated()->assertJsonPath('data.prescription.doctor_id', $doctor->id);
        $this->assertMatchesRegularExpression('/^MS-[A-Z0-9]{6}$/', $response->json('data.tracking_code'));
        $this->postJson('/api/prescriptions', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('prescriptions', 1);
        $this->assertDatabaseCount('prescription_items', 1);
        $payload['examination_id'] = $this->examination($doctor)->id;
        $payload['items'][0]['dosage'] = '';
        $this->postJson('/api/prescriptions', $payload)->assertUnprocessable();
        $this->assertDatabaseCount('prescriptions', 1);
    }

    public function test_patients_with_history_cannot_be_deleted(): void
    {
        $doctor = $this->user();
        $examination = $this->examination($doctor);
        Sanctum::actingAs($doctor);
        $this->deleteJson("/api/patients/{$examination->patient_id}")->assertConflict();
        $this->assertDatabaseHas('examinations', ['id' => $examination->id]);
    }

    public function test_doctor_can_release_held_prescription_but_cannot_rewind_approved_one(): void
    {
        $doctor = $this->user();
        $prescription = $this->prescription($doctor);
        $prescription->update(['status' => 'on_hold', 'tracking_code' => null]);
        Sanctum::actingAs($doctor);
        $this->putJson("/api/prescriptions/{$prescription->id}", ['status' => 'approved'])->assertOk();
        $this->assertNotNull($prescription->fresh()->tracking_code);
        $this->putJson("/api/prescriptions/{$prescription->id}", ['status' => 'draft'])->assertUnprocessable();
    }

    public function test_dashboard_uses_database_counts(): void
    {
        $doctor = $this->user();
        $this->prescription($doctor);
        Sanctum::actingAs($doctor);
        $this->getJson('/api/doctor/dashboard')->assertOk()->assertJsonPath('data.registered_patients', 1)->assertJsonPath('data.examinations_today', 1)->assertJsonPath('data.prescriptions_today', 1)->assertJsonPath('data.sent_today', 1);
    }

    public function test_inpatient_examination_cannot_create_outpatient_prescription(): void
    {
        $doctor = $this->user();
        $examination = $this->examination($doctor);
        $examination->update(['care_decision' => 'rawat_inap']);
        Sanctum::actingAs($doctor);
        $this->postJson('/api/prescriptions', ['examination_id' => $examination->id, 'status' => 'approved', 'items' => [['drug_name' => 'Obat Uji', 'quantity' => '10 tablet', 'dosage' => 'Dosis uji', 'instructions' => 'Instruksi uji']]])->assertUnprocessable();
        $this->assertDatabaseCount('prescriptions', 0);
    }

    public function test_bpjs_validation_does_not_overwrite_saved_checks(): void
    {
        $prescription = $this->prescription($this->user());
        $prescription->update(['bpjs_card_checked' => true]);
        Sanctum::actingAs($this->user('admin_apoteker'));
        $this->putJson("/api/prescriptions/{$prescription->id}/bpjs", ['bpjs_card_checked' => false])->assertUnprocessable();
        $this->assertTrue($prescription->fresh()->bpjs_card_checked);
    }

    public function test_only_pharmacy_can_manage_catalog_and_doctors_can_search_new_drugs(): void
    {
        $payload = ['name' => 'Obat Katalog Uji', 'generic_name' => 'Generik uji', 'category' => 'Kategori uji', 'unit' => 'tablet', 'stock' => 10];
        Sanctum::actingAs($this->user());
        $this->postJson('/api/drugs', $payload)->assertForbidden();
        Sanctum::actingAs($this->user('admin_apoteker'));
        $id = $this->postJson('/api/drugs', $payload)->assertCreated()->json('data.id');
        $this->postJson('/api/drugs', $payload)->assertUnprocessable();
        $this->putJson("/api/drugs/{$id}", [...$payload, 'stock' => -1])->assertUnprocessable();
        $this->putJson("/api/drugs/{$id}", [...$payload, 'stock' => 20])->assertOk()->assertJsonPath('data.stock', 20);
        Sanctum::actingAs($this->user());
        $this->getJson('/api/drugs?search=Obat%20Katalog%20Uji')->assertOk()->assertJsonPath('data.0.id', $id);
        $this->putJson("/api/drugs/{$id}", $payload)->assertForbidden();
    }
}
