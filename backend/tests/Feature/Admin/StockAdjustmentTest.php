<?php

namespace Tests\Feature\Admin;

use App\Models\Product;
use App\Models\ProductStock;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsStaff;
use Tests\Concerns\CreatesShopData;
use Tests\TestCase;

class StockAdjustmentTest extends TestCase
{
    use RefreshDatabase, CreatesShopData, ActsAsStaff;

    private \App\Models\User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->actingAsAdmin();
    }

    private function patchStock(Product $product, array $entries)
    {
        return $this->patchJson("/api/v1/admin/products/{$product->id}/stock", ['stock' => $entries]);
    }

    // ---------- Changing stock ----------

    public function test_set_replaces_the_quantity_and_is_audited(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'set' => 25]])->assertOk();

        $this->assertSame(25, $this->stockOf($product));
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'stock.updated', 'subject_id' => $product->id, 'user_id' => $this->admin->id,
        ]);
    }

    public function test_add_changes_the_quantity_by_an_amount(): void
    {
        $product = $this->makeProduct(); // 10 each

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'add' => 5]])->assertOk();
        $this->assertSame(15, $this->stockOf($product));

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'add' => -3]])->assertOk();
        $this->assertSame(12, $this->stockOf($product));
    }

    public function test_stock_cannot_go_below_zero(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'add' => -11]])
            ->assertUnprocessable()->assertJsonValidationErrors(['stock.0']);

        $this->assertSame(10, $this->stockOf($product));
    }

    public function test_one_bad_entry_cancels_the_whole_batch(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [
            ['color' => 'Black', 'size' => 'S', 'set' => 99],   // Fine on its own
            ['color' => 'Black', 'size' => 'M', 'add' => -999], // Impossible
        ])->assertUnprocessable();

        $this->assertSame(10, $this->stockOf($product, 'Black', 'S')); // The first one was rolled back too
    }

    public function test_set_and_add_together_are_rejected(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'set' => 5, 'add' => 5]])->assertUnprocessable();
    }

    public function test_an_entry_with_neither_set_nor_add_is_rejected(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M']])->assertUnprocessable();
    }

    public function test_an_option_the_product_does_not_have_is_rejected(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Pink', 'size' => 'M', 'set' => 5]])
            ->assertUnprocessable()->assertJsonValidationErrors(['stock.0']);
    }

    public function test_spelling_case_is_matched_to_the_real_option_without_duplicating_rows(): void
    {
        $product = $this->makeProduct(); // 2 colours x 3 sizes = 6 rows

        $this->patchStock($product, [['color' => 'black', 'size' => 'm', 'set' => 7]])->assertOk();

        $this->assertSame(7, $this->stockOf($product, 'Black', 'M'));
        $this->assertDatabaseCount('product_stocks', 6); // No stray "black / m" row
    }

    public function test_a_missing_stock_row_is_created(): void
    {
        $product = $this->makeProduct();
        ProductStock::where(['product_id' => $product->id, 'color' => 'Navy', 'size' => 'L'])->delete();

        $this->patchStock($product, [['color' => 'Navy', 'size' => 'L', 'set' => 4]])->assertOk();

        $this->assertSame(4, $this->stockOf($product, 'Navy', 'L'));
    }

    public function test_nothing_is_audited_when_nothing_changed(): void
    {
        $product = $this->makeProduct();

        $this->patchStock($product, [['color' => 'Black', 'size' => 'M', 'set' => 10]])->assertOk(); // Same as before

        $this->assertDatabaseMissing('audit_logs', ['action' => 'stock.updated']);
    }

    // ---------- The low-stock list ----------

    public function test_the_low_stock_list_shows_only_published_options_at_or_below_the_threshold(): void
    {
        $threshold = config('shop.low_stock_threshold');
        $product = $this->makeProduct();

        ProductStock::where(['product_id' => $product->id, 'color' => 'Black', 'size' => 'S'])->update(['quantity' => 2]);
        ProductStock::where(['product_id' => $product->id, 'color' => 'Black', 'size' => 'M'])->update(['quantity' => 0]);
        ProductStock::where(['product_id' => $product->id, 'color' => 'Navy',  'size' => 'S'])->update(['quantity' => $threshold]);     // On the line: included
        ProductStock::where(['product_id' => $product->id, 'color' => 'Navy',  'size' => 'M'])->update(['quantity' => $threshold + 1]); // Just above: excluded

        $this->makeProduct(['is_published' => false], stock: 1); // A draft with tiny stock must not appear

        $this->getJson('/api/v1/admin/stock/low')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.quantity', 0)            // Lowest first
            ->assertJsonPath('data.1.quantity', 2)
            ->assertJsonPath('data.2.quantity', $threshold)
            ->assertJsonPath('data.0.product.id', $product->id);
    }
}