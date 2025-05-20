# Implementation Plan - Properties Panel Not Showing for Child Controls

## Issue Summary
When a user clicks a child control inside a parent container (Tab, Accordion, ColumnLayout), the properties panel does not update to show the child control's properties.

## Root Cause
- The click event on child controls inside containers was not setting the selected control ID, so the properties panel did not update.

## Solution
- Add an `onClick` handler to the wrapper div for each child control in Tab, Accordion, and ColumnLayout containers in `CanvasControl.tsx`.
- The handler should call `setSelectedControlId(childControl.id)` and stop propagation.

## Steps
1. Identify all places in `CanvasControl.tsx` where child controls are rendered inside containers.
2. Add the `onClick` handler to each wrapper div.
3. Test that clicking a child control selects it and shows its properties in the panel.

## Testing
- Manual test cases:
  - Click a child control inside a Tab, Accordion, or ColumnLayout and verify the properties panel updates.
  - Click a parent control and verify its properties show.
  - Drag and drop controls and verify selection and properties panel update as expected.

---
