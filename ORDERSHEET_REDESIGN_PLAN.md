# OrderSheet Redesign Plan

## What WILL Change (UI Only):
1. **Table → Card Layout**: Replace `<table>` with card grid
2. **Column Filters**: Add search bars for Product, AWB, Amount sorting
3. **Export Fix**: Separate Length, Width, Height, Weight columns
4. **Professional Spacing**: 16-20px padding, proper shadows

## What WILL NOT Change (Backend Safe):
- ✅ All API calls (`fetchOrders`, `deleteDispatch`, `updateOrderStatus`)
- ✅ All state management
- ✅ All data fetching logic
- ✅ Timeline modal
- ✅ Delete confirmation
- ✅ Status dropdown
- ✅ Remarks editing
- ✅ Export warehouse selection

## Implementation Strategy:
- Keep existing component structure
- Only modify the JSX rendering (lines 700-1100)
- Keep all functions and hooks unchanged
- Test after each change

## Estimated Time: 20-25 minutes
