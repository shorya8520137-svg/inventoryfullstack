# Self Transfer - Complete Data Flow Analysis

## Overview
Self Transfer moves inventory from one warehouse/store to another warehouse/store.

---

## Tables Involved

### 1. **stock_batches** (Primary Inventory Table)
- **Purpose**: Tracks actual physical inventory at each location
- **Operations**:
  - **Host Location (Source)**: Stock is DEDUCTED using FIFO
  - **Receiver Location (Destination)**: Stock is ADDED (update existing batch or create new)

### 2. **inventory_ledger_base** (Audit Trail Table)
- **Purpose**: Records all inventory movements for tracking and timeline
- **Operations**:
  - **TWO entries created** for each product transfer:
    1. Host entry with `direction='OUT'`
    2. Receiver entry with `direction='IN'`

---

## Complete Data Flow (Step by Step)

### Input Data (from Frontend Form):
```javascript
{
  transferType: "warehouse-to-warehouse" or "store-to-store",
  sourceWarehouse: "GGM_WH",
  destinationWarehouse: "DELHI_WH",
  orderRef: "ST123",
  products: [
    { name: "Product A | Variant | BARCODE123", qty: 10 },
    { name: "Product B | Variant | BARCODE456", qty: 5 }
  ],
  // Optional fields
  awbNumber, selectedLogistics, selectedPaymentMode,
  selectedExecutive, invoiceAmount, weight, dimensions, remarks
}
```

---

## Database Operations (For Each Product)

### Step 1: Stock Validation
**Query**: Check if source has enough stock
```sql
SELECT SUM(qty_available) as available_stock 
FROM stock_batches 
WHERE barcode = 'BARCODE123' 
  AND warehouse = 'GGM_WH' 
  AND status = 'active'
```
- If `available_stock < required_qty` → **REJECT** transfer
- If sufficient → **PROCEED**

---

### Step 2: Deduct from Host Location (Source)
**Table**: `stock_batches`

**Query**: Get batches to deduct from (FIFO order)
```sql
SELECT id, qty_available 
FROM stock_batches 
WHERE barcode = 'BARCODE123' 
  AND warehouse = 'GGM_WH' 
  AND status = 'active' 
  AND qty_available > 0
ORDER BY created_at ASC  -- FIFO
```

**Update**: Deduct quantity from each batch
```sql
UPDATE stock_batches 
SET qty_available = (qty_available - deducted_qty),
    status = CASE 
      WHEN (qty_available - deducted_qty) = 0 THEN 'exhausted'
      ELSE 'active'
    END
WHERE id = batch_id
```

**Example**:
- Batch 1: 8 units available → Deduct 8 → 0 left (status='exhausted')
- Batch 2: 5 units available → Deduct 2 → 3 left (status='active')
- Total deducted: 10 units

---

### Step 3: Add to Receiver Location (Destination)
**Table**: `stock_batches`

**Option A**: If existing active batch found
```sql
-- Find existing batch
SELECT id, qty_available 
FROM stock_batches 
WHERE barcode = 'BARCODE123' 
  AND warehouse = 'DELHI_WH' 
  AND product_name = 'Product A'
  AND status = 'active'
ORDER BY created_at DESC 
LIMIT 1

-- Update existing batch
UPDATE stock_batches 
SET qty_available = qty_available + 10,
    status = 'active'
WHERE id = existing_batch_id
```

**Option B**: If no existing batch
```sql
INSERT INTO stock_batches (
  product_name, barcode, warehouse, source_type,
  qty_initial, qty_available, unit_cost, status
) VALUES (
  'Product A', 'BARCODE123', 'DELHI_WH', 'SELF_TRANSFER',
  10, 10, 0.00, 'active'
)
```

---

### Step 4: Create Ledger Entries (Audit Trail)
**Table**: `inventory_ledger_base`

**Entry 1**: Host Location (OUT)
```sql
INSERT INTO inventory_ledger_base (
  event_time, movement_type, barcode, product_name,
  location_code, qty, direction, reference
) VALUES (
  NOW(), 'SELF_TRANSFER', 'BARCODE123', 'Product A',
  'GGM_WH', 10, 'OUT', 'SELF_TRANSFER_ST123_1736934567890'
)
```

**Entry 2**: Receiver Location (IN)
```sql
INSERT INTO inventory_ledger_base (
  event_time, movement_type, barcode, product_name,
  location_code, qty, direction, reference
) VALUES (
  NOW(), 'SELF_TRANSFER', 'BARCODE123', 'Product A',
  'DELHI_WH', 10, 'IN', 'SELF_TRANSFER_ST123_1736934567890'
)
```

---

## Summary of Database Changes

### For Transfer: GGM_WH → DELHI_WH (Product A, 10 units)

| Table | Action | Details |
|-------|--------|---------|
| **stock_batches** | UPDATE | GGM_WH: Deduct 10 units (FIFO) |
| **stock_batches** | UPDATE/INSERT | DELHI_WH: Add 10 units |
| **inventory_ledger_base** | INSERT | GGM_WH: OUT entry (qty=10) |
| **inventory_ledger_base** | INSERT | DELHI_WH: IN entry (qty=10) |

---

## Key Points

1. **NO separate self_transfer table** - everything tracked via:
   - `stock_batches` (actual inventory)
   - `inventory_ledger_base` (movement history)

2. **Atomic Transaction**: All operations wrapped in transaction
   - If ANY step fails → ROLLBACK everything
   - Only commits if ALL products transferred successfully

3. **FIFO Deduction**: Stock deducted from oldest batches first

4. **Dual Ledger Entries**: Both OUT and IN entries created for complete audit trail

5. **Timeline Visibility**: Both entries appear in timeline with same reference number

---

## Response Format

```json
{
  "success": true,
  "message": "Self Transfer created successfully",
  "transfer_reference": "SELF_TRANSFER_ST123_1736934567890",
  "order_ref": "ST123",
  "host_location": "GGM_WH",
  "receiver_location": "DELHI_WH",
  "products_transferred": 2,
  "total_quantity": 15,
  "transfer_type": "warehouse-to-warehouse"
}
```

---

## Verification Queries

### Check stock levels after transfer:
```sql
-- GGM_WH (should be reduced)
SELECT SUM(qty_available) FROM stock_batches 
WHERE barcode = 'BARCODE123' AND warehouse = 'GGM_WH' AND status = 'active';

-- DELHI_WH (should be increased)
SELECT SUM(qty_available) FROM stock_batches 
WHERE barcode = 'BARCODE123' AND warehouse = 'DELHI_WH' AND status = 'active';
```

### Check ledger entries:
```sql
SELECT * FROM inventory_ledger_base 
WHERE reference = 'SELF_TRANSFER_ST123_1736934567890'
ORDER BY direction DESC;
-- Should show 2 entries per product: OUT and IN
```
