# Parent Control Drag-and-Drop - Testing Guide

## Overview
This document provides a comprehensive guide for testing the parent control drag-and-drop functionality implemented in LOG6. It includes both automated tests and manual testing procedures to ensure the functionality works as expected.

## Prerequisites
- Access to the development environment with the latest code
- Basic understanding of the questionnaire designer UI
- Chrome browser with developer tools access

## Test Environment Setup
1. Clone the repository and ensure you have the latest code
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open Chrome DevTools (F12) for console access during testing

## Automated Tests

### Running the Test Script
We've created a test script that validates the parent control movement functionality:

1. Open a terminal in the project root directory
2. Execute the test script:
```bash
npx ts-node src/utils/testParentControls.ts
```

3. Review the test results in the terminal output

### What the Automated Tests Cover
- Moving Tab controls to different positions
- Moving Accordion controls to different positions
- Moving ColumnLayout controls to different positions
- Validation of control structure before and after movement
- Edge case handling (first position, last position, etc.)

## Manual Testing

### Using Browser Test Helpers
We've created browser console helpers to assist with manual testing:

1. Open the application in Chrome
2. Open Chrome DevTools (F12)
3. Copy and paste the appropriate helper from the browser console:

#### Identify Parent Controls
```javascript
// Identify and list all parent controls in the current questionnaire
const questionnaireHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
if (!questionnaireHook) {
  console.error('React DevTools not found');
  return;
}

// Find the questionnaire state
let questionnaire = null;
try {
  const fiberNodes = Array.from(questionnaireHook.getFiberRoots(1));
  for (const root of fiberNodes) {
    const node = root.current;
    if (node?.memoizedState?.memoizedState?.questionnaire?.controls) {
      questionnaire = node.memoizedState.memoizedState.questionnaire;
      break;
    }
  }
} catch (e) {
  console.error('Error:', e);
}

if (!questionnaire) {
  console.error('Questionnaire not found');
  return;
}

// List parent controls
const parentTypes = ['Tab', 'Accordion', 'ColumnLayout'];
const parentControls = questionnaire.controls.filter(c => parentTypes.includes(c.type));
console.table(parentControls.map((c, i) => ({ 
  index: i, 
  id: c.id, 
  type: c.type, 
  label: c.label 
})));
```

#### Monitor Drag and Drop Events
```javascript
// Monitor drag and drop events for parent controls
document.addEventListener('dragstart', (e) => {
  const element = e.target.closest('[data-control-type]');
  if (element) {
    const type = element.getAttribute('data-control-type');
    if (['Tab', 'Accordion', 'ColumnLayout'].includes(type)) {
      console.log('Parent control drag started:', {
        type,
        id: element.getAttribute('data-control-id')
      });
    }
  }
});

document.addEventListener('drop', (e) => {
  console.log('Drop event detected:', e.target);
});

console.log('Drag and drop monitoring active');
```

### Manual Test Cases

#### Tab Controls

##### Test Case 1: Move Tab Control from Top to Middle
1. Create a new questionnaire or open an existing one
2. Add a Tab control at the top of the questionnaire
3. Add a few other controls (TextInput, etc.) after the Tab
4. Try to drag the Tab control to a position between other controls
5. Verify that:
   - The Tab control moves to the correct position
   - The Tab's structure and content remain intact
   - Visual feedback during dragging is appropriate

##### Test Case 2: Move Tab Control with Content
1. Create a Tab control with multiple tabs and content in each tab
2. Drag the Tab control to a new position
3. Verify that:
   - All tabs are preserved
   - All content within each tab is preserved
   - The active tab remains active after moving

#### Accordion Controls

##### Test Case 1: Move Accordion Control
1. Add an Accordion control to the questionnaire
2. Add sections to the Accordion with various controls
3. Drag the Accordion to a new position
4. Verify that:
   - The Accordion moves to the correct position
   - All sections and their content remain intact
   - Expanded/collapsed state is preserved

##### Test Case 2: Move Accordion with Multiple Expanded Sections
1. Create an Accordion with multiple sections
2. Expand several sections
3. Drag the Accordion to a new position
4. Verify that the expansion state is preserved after moving

#### ColumnLayout Controls

##### Test Case 1: Move ColumnLayout Control
1. Add a ColumnLayout control to the questionnaire
2. Add controls to different columns
3. Drag the ColumnLayout to a new position
4. Verify that:
   - The ColumnLayout moves to the correct position
   - All columns and their content remain intact

##### Test Case 2: Move Complex ColumnLayout
1. Create a ColumnLayout with multiple columns
2. Add different types of controls to each column
3. Drag the ColumnLayout to a new position
4. Verify that the column structure and all content is preserved

#### Edge Cases

##### Test Case 1: Rapid Movement
1. Add multiple parent controls to the questionnaire
2. Quickly drag and drop parent controls multiple times in succession
3. Verify that all movements are handled correctly without errors

##### Test Case 2: Move to Same Position
1. Drag a parent control and drop it at its current position
2. Verify that no change occurs and the UI remains stable

## Troubleshooting

### Common Issues
- **Parent control not moving**: Check the console for any errors related to moveParentControl
- **Visual glitches during drag**: Ensure the proper CSS classes are applied during drag operations
- **Children lost after moving**: Verify that deep cloning is working correctly
- **JavaScript errors**: Check for type errors or undefined values in the console

### Logging
We've added enhanced logging throughout the drag-and-drop process. To view detailed logs:
1. Open Chrome DevTools
2. Navigate to the Console tab
3. Filter for "[DRAG-DEBUG]" to see only relevant logs
4. Look for messages about parent control movement

## Reporting Issues
If you encounter any issues during testing, please document:
1. The specific test case that failed
2. Expected vs. actual behavior
3. Any console errors or warnings
4. Steps to reproduce the issue
5. Screenshots if relevant

## Next Steps
Once testing is complete, update the Test_Plan_Execution.md document with your results, including:
- Pass/fail status for each test case
- Any observations or issues found
- Recommendations for further improvements

## Conclusion
Thorough testing of the parent control drag-and-drop functionality will ensure a smooth user experience in the questionnaire designer. The combination of automated and manual tests should verify that all parent control types can be placed and repositioned as expected.
