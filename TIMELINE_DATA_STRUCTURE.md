# Timeline Data Structure Documentation

## Overview
This document explains the data structure for both Product Timeline and Nested Dispatch Timeline.

---

## 1. Product Timeline (Main Timeline)

**API Endpoint:** `GET /api/timeline/:barcode`

**Purpose:** Shows all inventory movement events for a specific product

### Response Structure

```json
{
  "success": true,
  "data": {
    "product_code": "2460-3499",
    "warehouse_filter": "ALL",
    "timeline": [
      {
        "id": 123,
        "type": "DISPATCH",
        "timestamp": "2026-01-16 08:58:38",
        "quantity": 1,
        "direction": "OUT",
        "warehouse": "GGM_WH",
        "reference": "DISPATCH_22_898989",
        "description": "Dispatched 1 units via Delhivery",
        "balance": 8,
        "source": "ledger"
      },
      {
        "id": 124,
        "type": "DAMAGE",
        "timestamp": "2026-01-16 10:21:05",
        "quantity": 1,
        "direction": "OUT",
        "warehouse": "GGM_WH",
        "reference": "damage#13",
        "description": "Reported 1 units as damaged",
        "balance": 7,
        "source": "ledger"
      },
      {
        "id": 125,
        "type": "RETURN",
        "timestamp": "2026-01-16 08:31:16",
        "quantity": 1,
        "direction": "IN",
        "warehouse": "GGM_WH",
        "reference": "RETURN_14_NO_AWB",
        "description": "Return received",
        "balance": 8,
        "source": "ledger"
      }
    ],
    "summary": {
      "total_entries": 15,
      "opening_stock": 0,
      "total_in": 13,
      "total_out": 5,
      "net_movement": 8,
      "current_stock": 8,
      "breakdown": {
        "bulk_upload": 8,
        "dispatch": 24,
        "damage": 3,
        "recovery": 0,
        "returns": 10,
        "self_transfer_in": 5,
        "self_transfer_out": 5,
        "final_stock": 8
      }
    }
  }
}
```

### Event Types Shown

| Type | Direction | Description |
|------|-----------|-------------|
| BULK_UPLOAD | IN | Initial stock added to warehouse |
| DISPATCH | OUT | Product dispatched to customer |
| DAMAGE | OUT | Product marked as damaged |
| RECOVER | IN | Damaged product recovered |
| RETURN | IN | Customer return received |
| SELF_TRANSFER | IN/OUT | Transfer between warehouses |
| DISPATCH_REVERSAL | IN | Dispatch cancelled/reversed |

### Key Fields

- **type**: Event type (DISPATCH, DAMAGE, RETURN, etc.)
- **quantity**: Number of units affected
- **direction**: IN (stock increase) or OUT (stock decrease)
- **warehouse**: Warehouse location code
- **reference**: Unique reference for the event (used to get nested details)
- **balance**: Running stock balance after this event
- **timestamp**: When the event occurred

---

## 2. Nested Dispatch Timeline

**API Endpoint:** `GET /api/order-tracking/:dispatchId/timeline`

**Purpose:** Shows complete details for a specific dispatch order including its timeline

### How to Get Dispatch ID

From the Product Timeline, extract dispatch ID from the `reference` field:

```javascript
// Example reference: "DISPATCH_22_898989"
const parts = reference.split('_');
const dispatchId = parts[1]; // "22"

// Or for deleted dispatches: "DISPATCH_DELETE_22"
const dispatchId = parts[2]; // "22"
```

### Response Structure

```json
{
  "success": true,
  "data": {
    "dispatch": {
      "id": 22,
      "status": "Delivered",
      "warehouse": "GGM_WH",
      "order_ref": "ORD-2026-001",
      "customer": "John Doe",
      "product_name": "iPhone 15 Pro",
      "barcode": "2460-3499",
      "qty": 1,
      "awb": "898989",
      "logistics": "Delhivery",
      "payment_mode": "Prepaid",
      "invoice_amount": 129999.00,
      "timestamp": "2026-01-16 08:58:38",
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
    },
    "timeline": [
      {
        "id": 22,
        "source": "dispatch",
        "type": "DISPATCH",
        "timestamp": "2026-01-16 08:58:38",
        "quantity": 1,
        "direction": "OUT",
        "warehouse": "GGM_WH",
        "reference": "DISPATCH_22_898989",
        "description": "Dispatched 1 units via Delhivery",
        "status": "Delivered",
        "awb": "898989",
        "logistics": "Delhivery",
        "payment_mode": "Prepaid",
        "invoice_amount": 129999.00
      },
      {
        "id": 13,
        "source": "damage_recovery",
        "type": "DAMAGE",
        "timestamp": "2026-01-16 10:21:05",
        "quantity": 1,
        "direction": "OUT",
        "warehouse": "GGM_WH",
        "reference": "damage#13",
        "description": "Reported 1 units as damaged"
      }
    ],
    "summary": {
      "total_movements": 2,
      "dispatched": 1,
      "damaged": 1,
      "recovered": 0,
      "self_transfer_in": 0,
      "self_transfer_out": 0,
      "current_stock": 8
    }
  }
}
```

### Dispatch Object Fields

**Order Information:**
- **id**: Dispatch ID
- **status**: Current status (Pending, Dispatched, Delivered, etc.)
- **order_ref**: Order reference number
- **customer**: Customer name
- **timestamp**: When dispatch was created

**Product Information:**
- **product_name**: Product name
- **barcode**: Product barcode
- **qty**: Quantity dispatched
- **items**: Array of items in this dispatch (for multi-product orders)

**Shipping Information:**
- **warehouse**: Origin warehouse
- **awb**: Air Waybill number (tracking number)
- **logistics**: Logistics partner (Delhivery, BlueDart, etc.)

**Payment Information:**
- **payment_mode**: Prepaid, COD, etc.
- **invoice_amount**: Total invoice value

### Timeline Array

Shows all events related to this specific dispatch:
- Original dispatch event
- Any damage reports for this product
- Recovery events
- Self transfers
- Related inventory movements

---

## User Flow Example

### Step 1: View Product Timeline
User searches for barcode `2460-3499` in Product Tracker

**Shows:**
- Opening stock: 0
- Bulk Upload: 8 units
- Dispatch: 24 units (multiple dispatch events)
- Damage: 3 units
- Return: 10 units
- Final Stock: 8 units

### Step 2: Click on DISPATCH Event
User clicks on a DISPATCH event with reference `DISPATCH_22_898989`

**Frontend extracts dispatch ID:**
```javascript
const dispatchId = "22"; // from "DISPATCH_22_898989"
```

### Step 3: View Nested Timeline
Modal opens showing complete dispatch details:

**Dispatch Details:**
- Order #ORD-2026-001
- Customer: John Doe
- AWB: 898989
- Logistics: Delhivery
- Status: Delivered
- Amount: ₹129,999

**Timeline for this dispatch:**
- 2026-01-16 08:58:38 - Dispatched 1 unit
- 2026-01-16 10:21:05 - 1 unit reported damaged

---

## Data Differences

| Feature | Product Timeline | Nested Dispatch Timeline |
|---------|------------------|--------------------------|
| **Scope** | All events for a product | Events for one dispatch order |
| **Event Types** | All types (DISPATCH, DAMAGE, RETURN, etc.) | Only events related to this dispatch |
| **Dispatch Info** | Reference only | Complete order details |
| **Customer Info** | Not shown | Customer name, order ref |
| **Shipping Info** | Not shown | AWB, logistics, status |
| **Payment Info** | Not shown | Payment mode, invoice amount |
| **Items** | Not shown | List of all items in dispatch |

---

## Frontend Display

### Product Timeline Table Columns
- Type (badge with color)
- Qty
- Date
- Time
- Warehouse
- Reference (clickable for DISPATCH events)
- Balance

### Nested Timeline Modal Sections

**1. Dispatch Summary Card**
- Order Reference
- Customer Name
- AWB Number
- Logistics Partner
- Status Badge
- Invoice Amount

**2. Product Details**
- Product Name
- Variant
- Barcode
- Quantity
- Selling Price

**3. Timeline Table**
- Type
- Description
- Qty
- Direction
- Date/Time
- Warehouse

---

## API Testing

### Test Product Timeline
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://inventorysystem.cloud:3001/api/timeline/2460-3499
```

### Test Nested Timeline
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://inventorysystem.cloud:3001/api/order-tracking/22/timeline
```

---

## Notes

1. **Dispatch ID Extraction**: Always extract from the `reference` field, not from the event ID
2. **404 Handling**: Some dispatch IDs may not exist (deleted orders) - handle gracefully
3. **Multiple Items**: A dispatch can have multiple items in the `items` array
4. **Timeline Filtering**: Nested timeline only shows events related to that specific dispatch's barcode
5. **Current Stock**: Shows overall stock for the product, not just for this dispatch
