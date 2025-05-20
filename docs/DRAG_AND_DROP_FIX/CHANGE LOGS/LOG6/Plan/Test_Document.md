# Parent Control Drag-and-Drop Issue - Investigation

## Issue Description
While users can place controls in the questionnaire designer, they cannot reposition parent controls (Tab, ColumnLayout, Accordion) through drag and drop functionality after they are placed.

## Test Environment
- **Date:** May 20, 2025
- **Browser:** Chrome 125.0.6422.112
- **Application URL:** http://localhost:5180/
- **Tester:** Developer

## Test Cases

### Test Case 1: Parent Control Drag Test
**Description:** Attempt to drag a Tab control from one position to another
**Steps:**
1. Add a Tab control to the canvas
2. Add another control (e.g., TextBox) to the canvas
3. Attempt to drag the Tab control below the TextBox control

**Expected Result:** The Tab control should move below the TextBox control
**Actual Result:** The Tab control does not move

### Test Case 2: Parent Control Drag - Accordion Control
**Description:** Attempt to drag an Accordion control from one position to another
**Steps:**
1. Add an Accordion control to the canvas
2. Add another control (e.g., TextBox) to the canvas
3. Attempt to drag the Accordion control below the TextBox control

**Expected Result:** The Accordion control should move below the TextBox control
**Actual Result:** The Accordion control does not move

### Test Case 3: Parent Control Drag - ColumnLayout Control
**Description:** Attempt to drag a ColumnLayout control from one position to another
**Steps:**
1. Add a ColumnLayout control to the canvas
2. Add another control (e.g., TextBox) to the canvas
3. Attempt to drag the ColumnLayout control below the TextBox control

**Expected Result:** The ColumnLayout control should move below the TextBox control
**Actual Result:** The ColumnLayout control does not move

## Debug Analysis

### Drag Event Flow
1. In the DesignCanvas component, parent controls are rendered with drag event handlers
2. When attempting to drag parent controls, the dragStart event is properly triggered
3. The drag is initiated correctly, with `startDrag` called with the appropriate control information
4. When dropping the control, the drop event is triggered
5. However, the UI does not update to reflect the new position of the control

### Identified Issues

1. **Event Handler Connection Issue:**
   The drag handlers are attached to the control's wrapper div, but there might be an issue with how they're connected to the actual draggable element (the Move icon).

2. **State Update Issue:**
   The state is being updated correctly in the context, but the UI is not reflecting this change, suggesting a rendering or refresh issue.

3. **CSS/Visual Issue:**
   Visual indicators are applied during drag, but they might not be cleaned up properly on drop.

4. **Event Propagation Issue:**
   The drag events might not be propagating correctly from the parent control to the canvas.

## Next Steps

1. Implement additional logging in the drag event handlers to track event propagation
2. Add visual markers to identify which element is draggable
3. Check if there's a differentiation between parent controls and child controls in the drag handler
4. Test a simplified scenario with only parent controls to isolate interactions
