# Accordion Control Implementation Plan

## Code Analysis

After examining the test results and analyzing the code base, we've identified the specific areas that need to be modified to fix the issues with the Accordion control:

### Issue 1: Horizontal Layout Drag and Drop

The problem is in the `CanvasControl.tsx` file, specifically in the `renderAccordionControl` function. When the layout is set to horizontal, the event handlers for drag and drop aren't being properly applied to sections 2 and 3. 

The issue appears to be related to:

1. Event bubbling/propagation in the nested flex container structure
2. Z-index or positioning issues that prevent events from reaching the correct handler
3. Missing or incorrectly attached event handlers in the horizontal layout mode

### Issue 2: Required Field Indicator

The issue lies in how the Accordion header is rendered. Currently, the required indicator (*) is not included in the header rendering logic. We need to modify the header rendering to properly display the required indicator when the control's `required` property is true.

## Code Changes Required

### For Issue 1 (Horizontal Layout):

1. Update the `renderAccordionControl` function in `CanvasControl.tsx` to ensure event handlers are properly attached to all sections in horizontal mode
2. Review and modify CSS properties that might be blocking event propagation
3. Ensure all drop zones have the correct z-index and position properties

### For Issue 2 (Required Field Indicator):

1. Update the Accordion header rendering logic to include the required indicator
2. Ensure conditional logic correctly checks the control's required state
3. Add appropriate styling for the indicator

## Specific Code Locations

- `src/components/designer/canvas/CanvasControl.tsx` - Main file containing the Accordion control rendering logic
- The `renderAccordionControl` function - Needs updates for both issues

## Implementation Steps

### Issue 1: Horizontal Layout Drag and Drop

1. Debug event propagation in horizontal layout mode
2. Update event handlers for Section containers
3. Fix CSS properties to ensure events reach their targets
4. Test drag and drop in all sections
5. Enhance flex container architecture for better event handling
6. Add debug logging for drag and drop operations
7. Implement data-* attributes for better CSS targeting
8. Increase drop target sizes for better usability

### Issue 2: Required Field Indicator

1. Locate where the Accordion header is rendered
2. Add conditional rendering for the required indicator
3. Apply appropriate styling
4. Test that the indicator appears correctly when required is set to true
