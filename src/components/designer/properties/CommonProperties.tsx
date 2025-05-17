import React from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Control, Dependency, DependencyCondition, ControlType } from '../../../types';
import { Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';

interface CommonPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
  availableControls: Control[];
}

const CommonProperties: React.FC<CommonPropertiesProps> = ({ control, onChange, availableControls }) => {
  const addDependency = () => {
    const newDependency: Dependency = {
      id: nanoid(),
      targetControlId: '',
      property: 'visible',
      condition: {
        type: 'equals',
        value: [],
      },
    };

    onChange({
      dependencies: [...(control.dependencies || []), newDependency],
    });
  };

  const updateDependency = (dependencyId: string, updates: Partial<Dependency>) => {
    onChange({
      dependencies: (control.dependencies || []).map(dep =>
        dep.id === dependencyId ? { ...dep, ...updates } : dep
      ),
    });
  };

  const removeDependency = (dependencyId: string) => {
    onChange({
      dependencies: (control.dependencies || []).filter(dep => dep.id !== dependencyId),
    });
  };

  const getControlValues = (targetControl: Control | undefined) => {
    if (!targetControl?.properties?.options) return [];
    return targetControl.properties.options;
  };

  const handleValueChange = (dependency: Dependency, value: string, isCheckbox: boolean = false) => {
    if (isCheckbox) {
      const currentValues = dependency.condition.value || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      updateDependency(dependency.id, {
        condition: {
          ...dependency.condition,
          value: newValues
        }
      });
    } else {
      updateDependency(dependency.id, {
        condition: {
          ...dependency.condition,
          value: [value]
        }
      });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Common Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            id="label"
            value={control.label || ''}
            onChange={(e) => onChange({ label: e.target.value })}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="required"
            checked={control.required || false}
            onChange={(e) => onChange({ required: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
            Required
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="visible"
            checked={control.visible !== false}
            onChange={(e) => onChange({ visible: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="visible" className="ml-2 block text-sm text-gray-700">
            Visible
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enabled"
            checked={control.enabled !== false}
            onChange={(e) => onChange({ enabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
            Enabled
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Dependencies</label>
            <button
              type="button"
              onClick={addDependency}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={16} className="mr-1" />
              Add Dependency
            </button>
          </div>

          <div className="space-y-4">
            {(control.dependencies || []).map((dependency) => {
              const targetControl = availableControls.find(c => c.id === dependency.targetControlId);
              const controlValues = getControlValues(targetControl);
              
              return (
                <div key={dependency.id} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Dependency</h4>
                    <button
                      onClick={() => removeDependency(dependency.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Control
                      </label>
                      <select
                        value={dependency.targetControlId}
                        onChange={(e) => updateDependency(dependency.id, {
                          targetControlId: e.target.value,
                          condition: { type: 'equals', value: [] }
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="">Select a control</option>
                        {availableControls
                          .filter(c => [ControlType.Checkbox, ControlType.RadioButton, ControlType.Dropdown].includes(c.type))
                          .map((ctrl) => (
                            <option key={ctrl.id} value={ctrl.id}>
                              {ctrl.label || ctrl.type}
                            </option>
                          ))
                        }
                      </select>
                    </div>

                    {targetControl && controlValues.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {targetControl.type === ControlType.Checkbox ? 'Values (Optional Multiple Selection)' : 'Value'}
                        </label>
                        
                        {targetControl.type === ControlType.Checkbox ? (
                          <div className="space-y-2">
                            {controlValues.map((option: any) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`${dependency.id}-${option.value}`}
                                  checked={dependency.condition.value?.includes(option.value) || false}
                                  onChange={() => handleValueChange(dependency, option.value, true)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label 
                                  htmlFor={`${dependency.id}-${option.value}`}
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <select
                            value={dependency.condition.value?.[0] || ''}
                            onChange={(e) => handleValueChange(dependency, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">Select a value</option>
                            {controlValues.map((option: any) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonProperties;