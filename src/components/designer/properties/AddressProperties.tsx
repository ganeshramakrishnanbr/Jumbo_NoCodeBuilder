import React from 'react';
import { Control } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';

interface AddressPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const AddressProperties: React.FC<AddressPropertiesProps> = ({ control, onChange }) => {
  const handleFieldUpdate = (fieldId: string, updates: any) => {
    const fields = control.properties?.fields || [];
    const updatedFields = fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    
    onChange({
      properties: {
        ...control.properties,
        fields: updatedFields,
      },
    });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Address Properties</h3>
      
      <div className="space-y-4">
        {control.properties?.fields.map((field: any) => (
          <div key={field.id} className="border rounded-md p-4 bg-gray-50">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleFieldUpdate(field.id, { required: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Required
                  </label>
                </div>

                {field.type === 'textBox' && field.validation && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {field.validation.minLength !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Minimum Length
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={field.validation.minLength}
                            onChange={(e) => handleFieldUpdate(field.id, {
                              validation: {
                                ...field.validation,
                                minLength: parseInt(e.target.value),
                              },
                            })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                      
                      {field.validation.maxLength !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum Length
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={field.validation.maxLength}
                            onChange={(e) => handleFieldUpdate(field.id, {
                              validation: {
                                ...field.validation,
                                maxLength: parseInt(e.target.value),
                              },
                            })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      )}
                    </div>

                    {field.validation.pattern && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Validation Message
                        </label>
                        <input
                          type="text"
                          value={field.validation.message}
                          onChange={(e) => handleFieldUpdate(field.id, {
                            validation: {
                              ...field.validation,
                              message: e.target.value,
                            },
                          })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressProperties;