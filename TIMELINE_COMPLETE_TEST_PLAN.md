# Complete Timeline Test Plan

## Test Objective
Verify that both Product Timeline and Nested Dispatch Timeline display correct data.

---

## Test 1: Product Timeline - Event Data

### API Endpoint
```
GET /api/timeline/:barcode
```

### Test Cases

#### TC1.1: Timeline with Multiple Event Types
**Barcode:** `2460-3499`

**Expected Data:**
- ✅ Opening Stock: 0
- ✅ Bulk Upload: 8 units
- ✅ Dispatch: 24 units (multiple events)
- ✅ Damage: 3 units
- ✅ Return: 10 units
- ✅ Transfer IN: 5 units
- ✅ Transfer OUT: 5 units
- ✅ Final Stock: 8 units

**Expected Display:**
Each event should show:
- Type (with color badge)
- Quantity
- Direction (IN/OUT)
- Warehouse
- Reference
- Date & Time
- Running Balance

#### TC1.2: Event Type Colors
| Event Type | Badge Color | Direction |
|------------|-------------|-----------|
| BULK_UPLOAD | Blue | IN |
| DISPATCH | Orange | OUT |
| DAMAGE | Red | OUT |
| RECOVER | Green | IN |
| RETURN | Green | IN |
| SELF_TRANSFER | Purple | IN/OUT |
| DISPATCH_REVERSAL | Yellow | IN |

#### TC1.3: Running Balance Calculation
- Should start from opening stock
- IN events: balance increases
- OUT events: balance decreases
- Final balance should match current stock

---

## Test 2: Nested Dispatch Timeline - Complete Order Data

### API Endpoint
```
GET /api/order-tracking/:dispatchId/timeline
```

### Test Cases

#### TC2.1: Dispatch Details Display
**Dispatch ID:** Extract from DISPATCH event reference

**Expected Dispatch Information:**
```
✅ Dispatch ID: 22
✅ Status: Delivered / Pending / Dispatched
✅ Warehouse: GGM_WH
✅ Order Reference: ORD-2026-001
✅ Customer: John Doe
✅ Product Name: iPhone 15 Pro
✅ Barcode: 2460-3499
✅ Quantity: 1
✅ AWB Number: 898989
✅ Logistics: Delhivery
✅ Payment Mode: Prepaid
✅ Invoice Amount: ₹129,999
✅ Timestamp: 2026-01-16 08:58:38
```

**Optional Fields (if available):**
```
✅ Variant: 256GB Black
✅ Dimensions: L × W × H
✅ Weight: kg
✅ Parcel Type: Forward/Reverse
✅ Processed By: username
✅ Remarks: Any notes
```

#### TC2.2: Dispatch Items Array
If dispatch has multiple items:
```json
{
  "items": [
    {
      "id": 45,
      "product_name": "iPhone 15 Pro",
      "variant": "256GB Black",
      "barcode": "2460-3499",
      "qty": 1,
      "selling_price": 129999.00
    }
  ]
}
```

**Expected Display:**
- Product Name
- Variant
- Barcode
- Quantity
- Selling Price

#### TC2.3: Nested Timeline Events
**Expected Events for Dispatch:**
- Original DISPATCH event
- Any DAMAGE events for this product
- Any RECOVER events
- Any SELF_TRANSFER events
- Related inventory movements

**Each Event Should Show:**
- Type
- Description
- Quantity
- Direction
- Warehouse
- Date & Time
- Additional fields (AWB, Logistics for dispatch events)

#### TC2.4: Summary Statistics
```
✅ Total Movements: X
✅ Dispatched: X units
✅ Damaged: X units
✅ Recovered: X units
✅ Self Transfer IN: X units
✅ Self Transfer OUT: X units
✅ Current Stock: X units
```

---

## Test 3: User Flow Testing

### Scenario 1: View Product Timeline
1. Open Product Tracker
2. Search for barcode: `2460-3499`
3. Click "Track Product"

**Expected Result:**
- ✅ Timeline table loads with all events
- ✅ Summary shows correct counts
- ✅ Events are sorted by date (newest first)
- ✅ Running balance is calculated correctly
- ✅ DISPATCH events are clickable

### Scenario 2: Click on DISPATCH Event
1. From timeline, click on any DISPATCH event
2. Modal should open

**Expected Result:**
- ✅ Modal opens with dispatch details
- ✅ All dispatch fields are populated (not showing N/A)
- ✅ Customer name is shown
- ✅ AWB number is shown
- ✅ Order reference is shown
- ✅ Logistics partner is shown
- ✅ Payment mode is shown
- ✅ Invoice amount is shown
- ✅ Nested timeline is displayed below

### Scenario 3: View Nested Timeline
1. In the dispatch modal, scroll to timeline section

**Expected Result:**
- ✅ Timeline shows events related to this dispatch
- ✅ Each event has description
- ✅ Timestamps are formatted correctly
- ✅ Event types are clear

### Scenario 4: Handle Missing Dispatch
1. Click on a DISPATCH event with deleted/invalid ID
2. System should handle gracefully

**Expected Result:**
- ✅ Alert shows: "Dispatch order #X not found..."
- ✅ Modal closes automatically
- ✅ No error in console
- ✅ User can continue using the app

---

## Test 4: Data Accuracy

### TC4.1: Product Timeline Accuracy
**Verify:**
- ✅ Total IN matches sum of all IN events
- ✅ Total OUT matches sum of all OUT events
- ✅ Final stock = Opening + Total IN - Total OUT
- ✅ Running balance is correct at each step

### TC4.2: Nested Timeline Accuracy
**Verify:**
- ✅ Dispatch details match database
- ✅ Timeline events are for correct barcode
- ✅ Summary counts match timeline events
- ✅ Current stock is accurate

---

## Test 5: Edge Cases

### TC5.1: Product with No Events
**Barcode:** New product with no movements

**Expected:**
- ✅ Shows "No timeline data found"
- ✅ Summary shows all zeros
- ✅ No errors

### TC5.2: Dispatch with No Timeline
**Dispatch ID:** Dispatch with only dispatch event

**Expected:**
- ✅ Shows dispatch details
- ✅ Timeline shows only dispatch event
- ✅ Summary shows correct counts

### TC5.3: Deleted Dispatch
**Dispatch ID:** Non-existent ID

**Expected:**
- ✅ 404 error handled gracefully
- ✅ User-friendly alert message
- ✅ Modal closes
- ✅ No console errors

---

## Test 6: API Response Validation

### Product Timeline Response
```javascript
{
  success: true,
  data: {
    product_code: string,
    warehouse_filter: string,
    timeline: [
      {
        id: number,
        type: string,
        timestamp: string,
        quantity: number,
        direction: 'IN' | 'OUT',
        warehouse: string,
        reference: string,
        description: string,
        balance: number,
        source: string
      }
    ],
    summary: {
      total_entries: number,
      opening_stock: number,
      total_in: number,
      total_out: number,
      net_movement: number,
      current_stock: number,
      breakdown: object
    }
  }
}
```

### Nested Timeline Response
```javascript
{
  success: true,
  data: {
    dispatch: {
      id: number,
      status: string,
      warehouse: string,
      order_ref: string,
      customer: string,
      product_name: string,
      barcode: string,
      qty: number,
      awb: string,
      logistics: string,
      payment_mode: string,
      invoice_amount: number,
      timestamp: string,
      items: array
    },
    timeline: array,
    summary: object
  }
}
```

---

## Test Execution Checklist

### Pre-Test Setup
- [ ] Server is running
- [ ] Database has test data
- [ ] User is logged in
- [ ] Token is valid

### Product Timeline Tests
- [ ] TC1.1: Multiple event types display correctly
- [ ] TC1.2: Event colors are correct
- [ ] TC1.3: Running balance is accurate
- [ ] Summary statistics are correct
- [ ] Events are sorted by date
- [ ] Warehouse filter works

### Nested Timeline Tests
- [ ] TC2.1: All dispatch fields display
- [ ] TC2.2: Items array displays (if present)
- [ ] TC2.3: Nested timeline events show
- [ ] TC2.4: Summary statistics are correct
- [ ] Modal opens/closes properly
- [ ] Data is not showing N/A for valid fields

### User Flow Tests
- [ ] Search and track product works
- [ ] Click on DISPATCH opens modal
- [ ] Modal shows complete data
- [ ] Close modal works
- [ ] Can open multiple dispatches

### Error Handling Tests
- [ ] 404 for missing dispatch handled
- [ ] Network errors handled
- [ ] Invalid barcode handled
- [ ] Empty timeline handled

---

## Success Criteria

### Product Timeline
✅ Shows all event types with correct data
✅ Running balance calculated correctly
✅ Summary statistics match events
✅ Events are clickable (DISPATCH)
✅ Warehouse filter works
✅ Date range filter works

### Nested Dispatch Timeline
✅ Shows complete dispatch order details
✅ Customer, AWB, Order Ref are NOT "N/A"
✅ All dispatch fields are populated
✅ Nested timeline shows related events
✅ Summary statistics are accurate
✅ Modal UI is clean and readable

### Error Handling
✅ 404 errors show user-friendly message
✅ Modal closes on error
✅ No console errors
✅ App remains functional after errors

---

## Test Script

Run the automated test:
```bash
node test-complete-timeline-flow.js
```

This will test:
1. Login
2. Product timeline API
3. Extract dispatch IDs
4. Nested timeline API
5. Data structure validation
6. Error handling

---

## Known Issues (Fixed)

1. ✅ **FIXED:** Warehouse showing as "undefined" in logs
   - Now shows "ALL" when no filter applied

2. ✅ **FIXED:** 404 errors not handled gracefully
   - Now shows user-friendly alert and closes modal

3. ✅ **FIXED:** Dispatch fields showing N/A
   - Fixed data structure mapping in ProductTracker.jsx
   - Now correctly accesses `data.data.dispatch` fields

---

## Next Steps

1. ✅ Fix data structure mapping (DONE)
2. ⏳ Test on production server
3. ⏳ Verify all dispatch fields display correctly
4. ⏳ Test with multiple products
5. ⏳ Test with different warehouses
6. ⏳ Commit and push fixes
