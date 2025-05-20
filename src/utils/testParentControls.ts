/**
 * Test script for validating parent control drag and drop functionality
 */

import { Control, ControlType } from '../types';
import { moveParentControl } from './dragDropUtils';
import { logControlStructure, validateControlMovement } from './debugUtils';

/**
 * Creates a mock control for testing
 * @param type Control type
 * @param index Position index (used in the ID and label)
 * @returns A mock control
 */
const createMockControl = (type: ControlType, index: number): Control => {
  return {
    id: `test-${type}-${index}`,
    type,
    label: `Test ${type} ${index}`,
    // Add other required properties based on your Control type
    isVisible: true,
    isRequired: false,
    // Add any other properties needed
  } as Control;
};

/**
 * Creates a set of mock controls for testing
 * @param count Number of regular controls to create
 * @param includeParentControls Whether to include parent controls
 * @returns An array of mock controls
 */
const createMockControls = (count: number, includeParentControls: boolean = true): Control[] => {
  const controls: Control[] = [];
  
  // Add some regular controls
  for (let i = 0; i < count; i++) {
    controls.push(createMockControl(ControlType.TextInput, i));
  }
  
  // Add parent controls if requested
  if (includeParentControls) {
    controls.push(createMockControl(ControlType.Tab, 100));
    controls.push(createMockControl(ControlType.Accordion, 101));
    controls.push(createMockControl(ControlType.ColumnLayout, 102));
  }
  
  return controls;
};

/**
 * Tests moving a parent control from one position to another
 * @param controlType The type of parent control to test
 */
const testMoveParentControl = (controlType: ControlType): void => {
  console.log(`\n==== Testing ${controlType} Movement ====`);
  
  // Create test data
  const controls = createMockControls(5);
  
  // Find the parent control of the specified type
  const parentControl = controls.find(c => c.type === controlType);
  if (!parentControl) {
    console.error(`No ${controlType} control found in test data`);
    return;
  }
  
  // Get the current index
  const currentIndex = controls.findIndex(c => c.id === parentControl.id);
  console.log(`Starting position of ${controlType}: ${currentIndex}`);
  
  // Test moving to various positions
  const targetPositions = [0, 2, controls.length - 1];
  
  for (const targetPosition of targetPositions) {
    console.log(`\nMoving ${controlType} from position ${currentIndex} to position ${targetPosition}`);
    
    // Execute the move
    const updatedControls = moveParentControl(controls, parentControl.id, targetPosition);
    
    // Validate the result
    const validation = validateControlMovement(controls, updatedControls, parentControl.id, targetPosition);
    
    console.log(`Movement validation: ${validation.success ? 'SUCCESS' : 'FAILED'}`);
    validation.messages.forEach(msg => console.log(`- ${msg}`));
  }
};

/**
 * Executes all parent control movement tests
 */
export const runParentControlTests = (): void => {
  console.log('=================================');
  console.log('PARENT CONTROL MOVEMENT TEST SUITE');
  console.log('=================================\n');
  
  testMoveParentControl(ControlType.Tab);
  testMoveParentControl(ControlType.Accordion);
  testMoveParentControl(ControlType.ColumnLayout);
  
  console.log('\n=================================');
  console.log('TEST SUITE COMPLETED');
  console.log('=================================');
};

// Execute the tests when this file is run directly
if (require.main === module) {
  runParentControlTests();
}
