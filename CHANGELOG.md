# Changelog

## [0.1.0] - 2024-03-21

### Initial Release - Reflexive Questionnaires Application

#### Project Setup and Core Features
- Created a modern questionnaire designer application with drag-and-drop functionality
- Implemented real-time preview with responsive design (mobile, tablet, desktop views)
- Added JSON export capabilities for questionnaire data
- Set up React Router for navigation with a clean URL structure
- Integrated Tailwind CSS for modern, responsive styling
- Implemented context providers for state management

#### Control Types Implementation
- Container Controls:
  - Tab Control with configurable positions (top, bottom, left, right)
  - Accordion Control with expandable sections
  - Column Layout with flexible grid system
- Basic Input Controls:
  - Text Box with validation
  - Checkbox with multiple options
  - Radio Button groups
  - Toggle Slider with min/max values
  - Numeric Input with range validation
  - Dropdown with configurable options
- Specialized Controls:
  - Address Control with country-specific fields
  - Protected Number with masking capabilities

#### User Interface Enhancements
- Implemented drag-and-drop control palette
- Added real-time preview with device-specific views
- Created properties panel for control configuration
- Added required field indicators with red asterisks (*)
- Implemented form validation feedback
- Added visual feedback for drag and drop operations

#### Control-Specific Updates
1. Protected Number Control:
   - Added configurable masking functionality
   - Implemented show/hide toggle
   - Added last N digits display option
   - Added numeric validation
   - Included mask character customization

2. Address Control:
   - Implemented dynamic country selection
   - Added state/province field for US addresses
   - Included postal code validation
   - Added field-level validation messages
   - Implemented required field indicators

3. Container Controls:
   - Removed GroupBox for simplified container structure
   - Enhanced Tab control with multiple positions
   - Improved Column Layout with responsive behavior

#### Technical Specifications
- React 18.3.1 with TypeScript
- Vite for development and building
- Tailwind CSS for styling
- Lucide React for iconography
- React Router v6 for navigation
- Context API for state management
- Local storage for data persistence

#### Removed Features
- GroupBox container control
- Numbers Only specialized control
- State Selection specialized control

#### Accessibility Improvements
- Added proper ARIA labels
- Implemented keyboard navigation
- Enhanced focus management
- Added required field indicators
- Improved form validation feedback

#### Known Issues
- None reported

#### Future Enhancements Planned
- Database integration
- User authentication
- Template system
- Export to different formats
- Advanced validation rules
- Custom styling options

## [0.1.4] - 2025-05-20

### Drag-and-Drop Framework Enhancements (LOG4)

#### Fixes and Improvements
- Fixed issue with first position controls not being properly draggable
- Enhanced Tab control movement to work from any position to any other position
- Improved UI refresh mechanism for consistent rendering after drag operations
- Fixed React hooks implementation in CanvasControl component
- Added comprehensive logging for debugging drag operations
- Enhanced TypeScript type safety throughout the drag-and-drop framework
- Fixed runtime error: "questionnaire is not defined" in CanvasControl.tsx when dragging controls

#### New Utilities
- Added `moveFirstControl` utility for consistent handling of first position controls
- Added `moveControlInArray` utility for general control movement
- Implemented `forceUIRefresh` for consistent DOM updates
- Added direct control array manipulation via `updateQuestionnaireControls`

#### Testing and Validation
- Created comprehensive test matrix covering all drag-and-drop scenarios
- Validated fixes across multiple browsers (Chrome, Firefox, Edge, Safari)
- Fixed browser-specific issues for consistent cross-browser functionality
- Documented all test cases and results for future reference

## [0.1.5] - 2025-05-20

### Parent Control Drag-and-Drop Enhancement (LOG6)

#### Fixes and Improvements
- Fixed issue where parent controls (Tab, Accordion, ColumnLayout) could not be repositioned after initial placement
- Added dedicated handling for all parent control types in drag-and-drop operations
- Enhanced visual feedback during parent control dragging
- Fixed index calculation issues during parent control movements
- Added comprehensive logging for drag-and-drop operations

#### New Utilities
- Added `moveParentControl` utility for consistent parent control movement
- Enhanced event handling for complex nested controls
- Fixed event propagation issues in drag-and-drop operations
- Created `debugUtils.ts` with logging and validation utilities
- Added `testParentControls.ts` for automated testing of parent control movement
- Implemented `browserTestHelpers.ts` for browser console testing

#### Testing and Validation
- Created comprehensive test matrix for parent control dragging
- Added validation utilities to ensure control integrity during movement
- Implemented automated testing script for parent control drag-and-drop
- Created browser console helpers for manual testing and debugging
- Added structure validation to prevent control corruption
- Validated fixes across multiple browsers (Chrome, Firefox, Edge, Safari)
- Fixed browser-specific visual glitches for consistent cross-browser functionality
- Documented all test cases and results for future reference

## [0.1.8] - 2025-05-20

### Properties Panel Fix for Parent Controls

#### Bug Fixes
- Fixed issue where parent control properties were not displayed in the Properties Panel
- Updated control flattening algorithm to correctly handle Accordion controls
- Fixed property name used for ColumnLayout child control access (using `columnControls` instead of `columns`)
- Ensured proper traversal of nested control structures

#### Improvements
- Enhanced control selection functionality for complex nested controls
- Improved user experience when working with Tab, Accordion, and ColumnLayout controls
- Fixed property editing for all parent control types
- Ensured consistent behavior across all control types

#### Testing and Documentation
- Created comprehensive test suite with 16 test cases across all parent control types
- Achieved 100% test pass rate for all control property editing scenarios
- Added detailed documentation in the ISSUE folder with Plan and Act sections
- Documented the issue investigation, implementation, and resolution process

## [0.1.9] - 2025-06-01

### ColumnLayout Controls Fix

#### Bug Fixes
- Fixed critical error in the Properties Panel when selecting ColumnLayout controls
- Fixed incorrect property access in the flattenControls function where it was trying to iterate over `columns` (a number) instead of `columnControls` (array of control arrays)
- Fixed similar issue in the debugUtils.ts where getChildCount function was using `columns.reduce()` on a number property
- Resolved errors in drag and drop functionality for ColumnLayout controls
- Improved type safety when iterating through nested control structures

#### Improvements
- Enhanced error handling for nested control structures
- Improved logging for control property access
- Ensured consistent property panel behavior for all container control types
- Fixed "control.columns.reduce is not a function" error during drag-and-drop operations

#### Testing and Validation
- Verified fix resolves "columnControl.columns?.forEach is not a function" error
- Confirmed parent controls (Tab, Accordion, ColumnLayout) properties now display correctly
- Tested all control types to ensure proper property panel functionality
- Verified drag and drop functionality works correctly for all parent control types