# Investigation Plan - Parent Control Drag-and-Drop Issue (LOG6)

## Issue Description
Users can place controls in the questionnaire designer, but they cannot reposition parent controls through drag and drop functionality.

## Investigation Approach

### 1. Analysis of Current Implementation
- Examine the drag-and-drop mechanism for parent controls
- Review the event handlers in DesignCanvas.tsx and CanvasControl.tsx
- Analyze the differences between parent control and child control drag handlers
- Inspect the moveControl function in QuestionnaireContext.tsx

### 2. Debug Process
- Add logging to track the drag-and-drop flow for parent controls
- Identify where the process is failing
- Verify event propagation and handler execution

### 3. Test Scenarios
- Test the dragging of Tab controls
- Test the dragging of Accordion controls
- Test the dragging of ColumnLayout controls
- Compare with child control drag behavior

### 4. Possible Issues to Look For
- Event handler issues (propagation, cancellation)
- Data model problems in the moveControl function
- State update issues preventing UI refresh
- Position calculation errors specific to parent controls
- Missing conditions for parent control types

## Implementation Plan

1. Add debug logging to trace the full drag-and-drop cycle
2. Create a testing document to track findings
3. Implement necessary fixes based on findings
4. Create test cases to verify the fix
5. Document the changes and update related files

## Testing Approach
- Test all parent control types (Tab, Accordion, ColumnLayout)
- Test dragging from different positions in the control array
- Test dragging to different positions
- Verify UI updates correctly after drag operations
- Ensure compatibility across browsers
