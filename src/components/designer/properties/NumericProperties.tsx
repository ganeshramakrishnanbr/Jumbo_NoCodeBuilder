import React from 'react';
import { Control } from '../../../types';

interface NumericPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const NumericProperties: React.FC<NumericPropertiesProps> = ({ control, onChange }) => {
  console.log('NumericProperties rendering with control:', control);

  const handlePropertyChange = (property: string, value: any) => {
    console.log('Updating numeric property:', property, 'with value:', value);
    onChange({
      properties: {
        ...(control.properties || {}),
        [property]: value,
      },
    });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Numeric Properties</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Value
            </label>
            <input
              type="number"
              value={(control.properties?.min as number) ?? 0}
              onChange={(e) => handlePropertyChange('min', parseFloat(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Value
            </label>
            <input
              type="number"
              value={(control.properties?.max as number) ?? 100}
              onChange={(e) => handlePropertyChange('max', parseFloat(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Step
          </label>
          <input
            type="number"
            min={0}
            step={0.1}
            value={(control.properties?.step as number) ?? 1}
            onChange={(e) => handlePropertyChange('step', parseFloat(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default NumericProperties;