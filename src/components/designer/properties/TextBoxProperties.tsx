import React from 'react';
import { Control, ControlType } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface TextBoxPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const TextBoxProperties: React.FC<TextBoxPropertiesProps> = ({ control, onChange }) => {
  console.log('TextBoxProperties rendering with control:', control);

  const handlePropertyChange = (property: string, value: any) => {
    console.log('Updating property:', property, 'with value:', value);
    onChange({
      properties: {
        ...(control.properties || {}),
        [property]: value,
      },
    });
  };

  const addOption = () => {
    const options = control.properties?.options || [];
    console.log('Adding new option to control:', control.id);
    handlePropertyChange('options', [
      ...options,
      { id: nanoid(), label: 'New Option', value: '' }
    ]);
  };

  const updateOption = (optionId: string, updates: Partial<{ label: string; value: string }>) => {
    console.log('Updating option:', optionId, 'with updates:', updates);
    const options = control.properties?.options || [];
    handlePropertyChange('options', options.map(opt => 
      opt.id === optionId ? { ...opt, ...updates } : opt
    ));
  };

  const removeOption = (optionId: string) => {
    console.log('Removing option:', optionId);
    const options = control.properties?.options || [];
    handlePropertyChange('options', options.filter(opt => opt.id !== optionId));
  };

  const renderOptionsSection = () => {
    if (!['checkbox', 'dropdown', 'radioButton'].includes(control.type)) {
      return null;
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus size={16} className="mr-1" />
            Add Option
          </button>
        </div>
        
        <div className="space-y-2">
          {(control.properties?.options || []).map((option: any) => (
            <div key={option.id} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(option.id, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(option.id, { value: e.target.value })}
                placeholder="Value"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Control Properties</h3>
      
      <div className="space-y-4">
        {control.type === 'textBox' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder Text
              </label>
              <input
                type="text"
                value={(control.properties?.placeholder as string) || ''}
                onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Length
                </label>
                <input
                  type="number"
                  min={0}
                  value={(control.properties?.minLength as number) || 0}
                  onChange={(e) => handlePropertyChange('minLength', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Length
                </label>
                <input
                  type="number"
                  min={0}
                  value={(control.properties?.maxLength as number) || 100}
                  onChange={(e) => handlePropertyChange('maxLength', parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Type
              </label>
              <select
                value={(control.properties?.inputType as string) || 'text'}
                onChange={(e) => handlePropertyChange('inputType', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="password">Password</option>
                <option value="tel">Telephone</option>
                <option value="url">URL</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="multiline"
                checked={(control.properties?.multiline as boolean) || false}
                onChange={(e) => handlePropertyChange('multiline', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="multiline" className="ml-2 block text-sm text-gray-700">
                Multiline (Textarea)
              </label>
            </div>
          </>
        )}

        {renderOptionsSection()}
      </div>
    </div>
  );
};

export default TextBoxProperties;