# Implementation Plan - Parent Control Drag-and-Drop Fix (LOG6)

## Issue Summary
Parent controls (Tab, Accordion, ColumnLayout) can be placed on the canvas but cannot be reordered through drag and drop functionality after initial placement.

## Root Cause Analysis
Based on the code analysis, there appear to be several potential causes for this issue:

1. **Drag Handle Implementation in CanvasControl:**
   The drag handle is implemented inside the CanvasControl component, but it may not be properly handling parent controls or propagating events correctly.

2. **Event Propagation:**
   The drag events may not be bubbling up correctly from the CanvasControl component to the DesignCanvas component.

3. **Type-Specific Handling:**
   While special handling is in place for Tab controls, it might not be working correctly for all parent control types.

4. **Control Type Detection:**
   The `canDropIn` function in DragDropContext may not be correctly identifying parent controls for valid drop targets.

5. **CSS/Visual Indicators:**
   Visual indicators may not be updated correctly during drag operations for parent controls.

## Implementation Approach

### Step 1: Enhanced Logging
- Add detailed logging to track drag events for parent controls
- Log all stages of the drag process: start, over, drop
- Compare behavior between parent controls and regular controls

### Step 2: Fix Drag Handle Implementation
- Review and fix the drag handle implementation in CanvasControl
- Ensure proper event propagation from the drag handle to the parent component
- Add explicit handler for parent control types

### Step 3: Enhance Type-Specific Handling
- Extend the special handling that exists for Tab controls to Accordion and ColumnLayout controls
- Add consistent treatment across all parent control types
- Fix any issues with parent control detection

### Step 4: Update moveControlInArray Utility
- Update the moveControlInArray utility to handle parent controls correctly
- Ensure correct index calculation for all control types
- Add special case handling for parent controls if needed

### Step 5: UI Refresh Improvements
- Ensure UI is properly refreshed after drag operations
- Fix visual indicator issues
- Add forced refresh for parent controls

## Specific Code Changes

1. **CanvasControl.tsx**
   - Update handleDragStart to have special handling for parent controls
   - Ensure event.stopPropagation() is used correctly
   - Add visual feedback specific to parent controls

2. **DesignCanvas.tsx**
   - Update handleDrop to properly handle all parent control types, not just Tab controls
   - Add consistent movement implementation for all parent controls
   - Fix any index calculation issues

3. **dragDropUtils.ts**
   - Enhance moveControlInArray to better handle parent controls
   - Add parent-specific handling if needed
   - Improve logging for parent control operations

4. **DragDropContext.tsx**
   - Verify canDropIn correctly handles all parent control types
   - Add explicit checking for parent controls in relevant functions

## Testing Approach
1. Test each parent control type separately:
   - Tab control
   - Accordion control
   - ColumnLayout control

2. Test various scenarios:
   - Drag from top to bottom
   - Drag from bottom to top
   - Drag between other parent controls
   - Drag between regular controls

3. Test edge cases:
   - Drag when there's only one control on the canvas
   - Drag when there are many controls
   - Cancel drag operations

4. Cross-browser testing:
   - Test in Chrome, Firefox, Edge, and Safari
