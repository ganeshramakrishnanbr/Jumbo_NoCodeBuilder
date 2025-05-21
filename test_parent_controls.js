// Script to run parent control tests

console.log('======================================');
console.log('PARENT CONTROL DRAG-AND-DROP TEST TOOL');
console.log('======================================');

// Import the testing function using require
try {
  require('ts-node').register();
  const { runParentControlTests } = require('./src/utils/testParentControls');
  console.log('\nStarting automated tests...\n');
  
  // Run the tests
  runParentControlTests();
  
  console.log('\nTests completed! Please check the results above.');
  console.log('\nFor manual testing, please refer to:');
  console.log('docs/DRAG_AND_DROP_FIX/CHANGE LOGS/LOG6/Act/Testing_Guide.md');
} catch (error) {
  console.error('Error running tests:', error);
  console.log('\nTo run these tests manually, please use:');
  console.log('npx ts-node src/utils/testParentControls.ts');
}
