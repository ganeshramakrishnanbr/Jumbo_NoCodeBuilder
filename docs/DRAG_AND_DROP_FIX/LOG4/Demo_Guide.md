# Drag-and-Drop Demo Guide

This document provides step-by-step instructions for demonstrating the enhanced drag-and-drop functionality.

## Setup Demo Environment

1. Launch the application at http://localhost:5180/ (or your current port)
2. Open browser developer tools (F12)
3. Navigate to the questionnaire designer page
4. Clear any existing questionnaire by refreshing the page

## Demo Scenario 1: Basic Controls Movement

### Steps:
1. Add three TextBox controls to the canvas:
   - Drag and drop from the control palette
   - Label them "First Control", "Second Control", and "Third Control"

2. Demonstrate moving the third control to the first position:
   - Drag "Third Control" and drop it above "First Control"
   - Verify it becomes the first control
   - Check console logs showing [DRAG-DEBUG] entries

3. Demonstrate moving the first control to the middle:
   - Drag the now-first control and drop it between the other two
   - Verify it moves to the second position

**Expected Result:** All controls move smoothly to their new positions, with UI refreshing properly after each move.

## Demo Scenario 2: Tab Control Special Handling

### Steps:
1. Add a Tab control to the canvas as the first element:
   - Drag Tab control from palette
   - Label it "Main Tabs"

2. Add a TextBox control after the Tab control

3. Demonstrate moving the Tab control to the end:
   - Drag the Tab control and drop it after the TextBox
   - Verify it moves to the last position
   - Note the special handling in console logs

4. Demonstrate moving the Tab control back to first position:
   - Drag the Tab control and drop it before the TextBox
   - Verify it returns to the first position

**Expected Result:** Tab control moves freely between positions, maintaining its structure and content.

## Demo Scenario 3: Complex Container Nesting

### Steps:
1. Create a complex structure:
   - Add a Tab control as the first element
   - Add a ColumnLayout control as the second element
   - Add an Accordion control as the third element

2. Demonstrate reordering the container controls:
   - Move the first position Tab control to the last position
   - Move the Accordion control to the first position
   - Move the ColumnLayout to the middle

3. Add some content to each container:
   - Add a TextBox to the Tab control
   - Add a Checkbox to the ColumnLayout
   - Add a Dropdown to the Accordion

4. Verify parent-child relationships maintain integrity after moving

**Expected Result:** All container controls can be freely reordered while maintaining their child controls.

## Demo Scenario 4: Edge Cases

### Steps:
1. Demonstrate single element reordering:
   - Create a questionnaire with only one Tab control
   - Try to drag it (should show indicators but not change position)

2. Demonstrate rapid multiple movements:
   - Add multiple controls to the canvas
   - Quickly drag and drop controls in succession
   - Verify UI stays consistent

3. Demonstrate cancel operation:
   - Start dragging a control
   - Press ESC key to cancel
   - Verify the control returns to its original position

**Expected Result:** Edge cases are handled gracefully without UI glitches or data inconsistencies.

## Success Criteria

The drag-and-drop functionality should demonstrate:

1. **Reliability:** Controls consistently move to the expected positions
2. **Visual Feedback:** Clear indicators show where controls will be placed
3. **Performance:** Smooth transitions without lag or flicker
4. **Data Integrity:** Control structure and content preserved after movement
5. **Cross-Browser:** Consistent behavior across Chrome, Firefox, Edge, and Safari
6. **Error Handling:** Graceful handling of edge cases

## Interactive Element Verification

When rearranging controls, verify that:

1. **Interactivity** is maintained after movement
2. **Visual styles** remain consistent
3. **Parent-child relationships** are preserved
4. **Event handlers** continue to function properly

This demo guide effectively showcases the enhanced drag-and-drop functionality with particular emphasis on the fixed issues around first position controls and Tab control movement.
