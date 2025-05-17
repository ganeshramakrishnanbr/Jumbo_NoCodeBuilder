import React from 'react';
import { Control } from '../../../types';

interface ProtectedNumberPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const ProtectedNumberProperties: React.FC<ProtectedNumberPropertiesProps> = ({ control, onChange }) => {
  const handlePropertyChange = (property: string, value: any) => {
    onChange({
      properties: {
        ...(control.properties || {}),
        [property]: value,
      },
    });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Protected Number Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Number of Digits
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={(control.properties?.totalDigits as number) ?? 10}
            onChange={(e) => handlePropertyChange('totalDigits', Math.max(1, parseInt(e.target.value)))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Maximum number of digits allowed in the input</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mask Character
          </label>
          <input
            type="text"
            maxLength={1}
            value={(control.properties?.maskChar as string) ?? '*'}
            onChange={(e) => handlePropertyChange('maskChar', e.target.value.charAt(0) || '*')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Enter a single character to use as the mask</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show Last N Digits
          </label>
          <input
            type="number"
            min={0}
            max={4}
            value={(control.properties?.showLastDigits as number) ?? 0}
            onChange={(e) => handlePropertyChange('showLastDigits', Math.max(0, parseInt(e.target.value)))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">Number of digits to show at the end (0-4)</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="initiallyMasked"
            checked={(control.properties?.initiallyMasked ?? true)}
            onChange={(e) => handlePropertyChange('initiallyMasked', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="initiallyMasked" className="ml-2 block text-sm text-gray-700">
            Initially Masked
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProtectedNumberProperties;