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