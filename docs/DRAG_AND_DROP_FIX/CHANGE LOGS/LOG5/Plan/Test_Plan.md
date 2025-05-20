# Drag-and-Drop Framework Test Plan

## Objective
To validate that all controls, including Tab controls in the first position, can be reordered freely within the questionnaire designer.

## Test Cases

### 1. First Position Tab Controls
- [ ] Drag a Tab control from the first position to the middle of the questionnaire
- [ ] Drag a Tab control from the first position to the end of the questionnaire
- [ ] Drag a Tab control from a middle position to the first position
- [ ] Drag a Tab control from the end to the first position

### 2. First Position Other Controls
- [ ] Drag a TextBox control from the first position to the middle of the questionnaire
- [ ] Drag a ColumnLayout control from the first position to the end of the questionnaire
- [ ] Drag an Accordion control from the middle position to the first position
- [ ] Drag a Checkbox control from the end to the first position

### 3. Tab Control Movement (Any Position)
- [ ] Drag a Tab control from the middle to another middle position (e.g., from index 2 to index 4)
- [ ] Drag a Tab control from the middle to the first position
- [ ] Drag a Tab control from the middle to the end position
- [ ] Create multiple Tab controls and reorder them in various ways

### 4. Other Control Types
- [ ] Test ColumnLayout controls for dragging from any position to any other position
- [ ] Test Accordion controls for dragging from any position to any other position
- [ ] Test regular input controls (TextBox, Checkbox, etc.) for dragging from any position to any other position

### 5. Edge Cases
- [ ] Test with many controls (10+) to ensure performance and correct positioning
- [ ] Test rapidly dragging multiple controls in succession
- [ ] Test dragging a control to the position immediately before or after its current position

## Visual Verification
- [ ] Verify that visual indicators (borders, highlights) appear correctly during drag operations
- [ ] Verify that opacity changes correctly indicate which control is being dragged
- [ ] Ensure no UI artifacts remain after drag operations complete

## Browser Compatibility
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if available)
- [ ] Test in Edge

## Results

| Test Case | Result | Notes |
|-----------|--------|-------|
|           |        |       |

## Summary of Improvements
1. Added enhanced debugging to track drag operations
2. Created utility functions for consistent index handling
3. Implemented special handling for first position controls
4. Added direct control array manipulation for Tab controls
5. Ensured proper UI refreshing after drag operations
