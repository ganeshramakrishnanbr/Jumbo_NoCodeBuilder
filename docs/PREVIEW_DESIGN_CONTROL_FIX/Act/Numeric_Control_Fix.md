# Numeric Control Preview Fix

## Issue Description
In the Preview tab, numeric controls were not displaying properly. The label for the numeric control should be visible, and the numeric input field should show the expected value range, but these elements were not rendering correctly.

## Root Cause
The `renderControl` function in the `PreviewTab.tsx` file was missing a case to handle `ControlType.Numeric`. As a result, when a numeric control was added to the questionnaire, the default rendering was used, showing only the control type but not the proper input field with its associated label and validation information.

## Solution
Added a new `renderNumeric` function to the `PreviewTab.tsx` file that properly renders numeric controls in the preview mode. This function displays:

1. The control label with required indicator if applicable
2. A numeric input field with correct min, max, and step values
3. Helper text showing the valid range for the numeric input

Then updated the `renderControl` function to call this new function when handling `ControlType.Numeric`.

## Implementation Details

```typescript
const renderNumeric = (control: Control) => {
  const min = control.properties?.min ?? 0;
  const max = control.properties?.max ?? 100;
  const step = control.properties?.step ?? 1;
  
  return (
    <div className="mb-4">
      {renderLabel(control.label || 'Number of digits', control.required)}
      <div className="flex flex-col">
        <input
          type="number"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          min={min}
          max={max}
          step={step}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required={control.required}
        />
        <div className="mt-1 text-xs text-gray-500">
          Valid range: {min} - {max}
        </div>
      </div>
    </div>
  );
};
```

And added the new case to the switch statement:

```typescript
case ControlType.Numeric:
  return renderNumeric(control);
```

## Testing

The fix was tested with the following scenarios:

1. Adding a new numeric control to the questionnaire
2. Setting different min/max/step values through the Properties Panel
3. Verifying that the control displays correctly in the Preview tab
4. Testing with and without a custom label
5. Testing with required and optional settings

All tests confirmed that the numeric control now displays correctly in the Preview tab, showing the proper label, input field, and valid range information.

## Related Components

This fix complements the earlier fixes for parent controls in the Properties Panel, ensuring that all control types render properly throughout the questionnaire designer interface.
