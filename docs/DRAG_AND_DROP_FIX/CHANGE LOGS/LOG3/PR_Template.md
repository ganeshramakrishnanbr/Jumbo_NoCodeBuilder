# Tab Container Drag-and-Drop Fix - Pull Request

## PR Summary
This PR fixes an issue where Tab controls could not be moved from the first position to any other position in the questionnaire designer canvas.

## Changes Made
- Fixed the drag start handler in DesignCanvas.tsx to always use the correct index from questionnaire.controls
- Updated CanvasControl.tsx to properly set sourceIndex in the drag context
- Added null checks to prevent DOM-related errors during drag operations
- Enhanced documentation to reflect these changes

## Testing
All test scenarios have been verified:
- Moving Tab controls from first position to any other position
- Moving Tab controls between other control types
- Moving other control types continues to work as expected

## Related Issues
This fix resolves the remaining issue found after implementing the initial drag-and-drop reordering fix.

## Screenshots/Videos
[Include before/after screenshots or a GIF/video showing the fix working]

## Code Review Checklist
- [x] The bug has been verified and fixed
- [x] The fix is focused and doesn't include unrelated changes
- [x] All related components (DesignCanvas.tsx, CanvasControl.tsx) have been updated
- [x] Documentation has been updated
- [x] No new console errors or warnings
- [x] No new TypeScript compiler errors
- [x] The fix doesn't break existing functionality

## Implementation Approach
The primary issue was that the `sourceIndex` value was sometimes `null` in the drag context for Tab controls. This was fixed by:

1. Always using the most reliable index source: `questionnaire.controls.findIndex()`
2. Adding proper null checks to handle edge cases and prevent errors
3. Ensuring consistent index use across all components

## Next Steps
- Consider additional automated testing for drag-and-drop operations
- Review other container controls for similar issues
- Improve type safety for drag operation parameters
