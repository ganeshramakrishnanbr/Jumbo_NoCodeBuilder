# Parent Control Testing - Quick Guide

## Running Automated Tests

To validate the parent control drag-and-drop functionality:

1. Open a terminal in the project root directory
2. Run the test script:

```bash
# Option 1: Using Node.js
node test_parent_controls.js

# Option 2: Using npx with ts-node directly
npx ts-node src/utils/testParentControls.ts
```

## Using Browser Console Helpers

For manual testing in the browser:

1. Start the development server: `npm start`
2. Open your application in Chrome
3. Open Chrome DevTools (F12)
4. Run one of these commands to import helpers:

```javascript
// Import from local file system
const fs = require('fs');
const helpers = fs.readFileSync('./src/utils/browserTestHelpers.ts', 'utf8');
eval(helpers);

// Or use these individual helpers:

// 1. Identify parent controls in the questionnaire
identifyParentControls();

// 2. Monitor drag and drop events
monitorDragDropEvents();

// 3. Log the current control structure
logControlStructureInBrowser();
```

## Comprehensive Testing

For the full testing procedure, refer to:
`docs/DRAG_AND_DROP_FIX/CHANGE LOGS/LOG6/Act/Testing_Guide.md`
