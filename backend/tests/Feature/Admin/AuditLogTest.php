<?php

namespace Tests\Feature\Admin;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsStaff;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase, ActsAsStaff;

    private User $actor;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actor = $this->actingAsSuperAdmin();
    }

    // Add one log row
    private function entry(string $action, string $subject = 'product', ?int $userId = null, ?array $changes = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $userId, 'action' => $action, 'subject_type' => $subject, 'subject_id' => 1,
            'summary' => "Did {$action}", 'changes' => $changes, 'ip_address' => '127.0.0.1',
        ]);
    }

    public function test_entries_come_newest_first_with_who_and_what(): void
    {
        $this->entry('product.created', userId: $this->actor->id);
        $this->entry('stock.updated', changes: ['Black / M' => ['from' => 10, 'to' => 7]]); // No user = automatic

        $this->getJson('/api/v1/admin/audit-logs')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['*' => ['id', 'action', 'summary', 'changes', 'by', 'subjectType', 'subjectId', 'ip', 'createdAt']],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ])
            ->assertJsonPath('data.0.action', 'stock.updated')      // Newest first
            ->assertJsonPath('data.0.by', 'System')                 // No user = System
            ->assertJsonPath('data.0.changes.Black / M.to', 7)
            ->assertJsonPath('data.1.by', $this->actor->name);
    }

    public function test_it_can_be_filtered_by_action_and_by_subject(): void
    {
        $this->entry('product.created');
        $this->entry('stock.updated');
        $this->entry('staff.created', subject: 'user');

        $this->getJson('/api/v1/admin/audit-logs?action=stock.updated')->assertOk()->assertJsonCount(1, 'data');
        $this->getJson('/api/v1/admin/audit-logs?subject_type=user')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.action', 'staff.created');
        $this->getJson('/api/v1/admin/audit-logs?action=stock.updated&subject_type=user')->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_it_is_paged_thirty_at_a_time(): void
    {
        foreach (range(1, 31) as $i) {
            $this->entry('product.updated');
        }

        $this->getJson('/api/v1/admin/audit-logs')->assertOk()->assertJsonCount(30, 'data')->assertJsonPath('meta.total', 31);
        $this->getJson('/api/v1/admin/audit-logs?page=2')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_an_oversized_filter_is_rejected(): void
    {
        $this->getJson('/api/v1/admin/audit-logs?action=' . str_repeat('a', 51))
            ->assertUnprocessable()->assertJsonValidationErrors(['action']);
    }
}