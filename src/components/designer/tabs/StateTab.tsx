import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Control, Condition } from '../../../types';
import { PlusCircle, Trash2 } from 'lucide-react';

const StateTab: React.FC = () => {
  const { questionnaire, updateControl } = useQuestionnaire();
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  
  // Flatten controls to make them easier to work with
  const flattenControls = (controls: Control[]): Control[] => {
    let result: Control[] = [];
    
    for (const control of controls) {
      result.push(control);
      
      if (control.children && control.children.length > 0) {
        result = [...result, ...flattenControls(control.children)];
      }
    }
    
    return result;
  };
  
  const allControls = flattenControls(questionnaire.controls);
  const selectedControl = allControls.find(c => c.id === selectedControlId) || null;
  
  const handleAddCondition = () => {
    if (!selectedControlId) return;
    
    const newCondition: Condition = {
      id: Date.now().toString(),
      targetControlId: '',
      property: 'visible',
      operator: 'equals',
      value: '',
    };
    
    updateControl(selectedControlId, {
      conditions: [...(selectedControl?.conditions || []), newCondition],
    });
  };
  
  const handleDeleteCondition = (conditionId: string) => {
    if (!selectedControlId || !selectedControl) return;
    
    updateControl(selectedControlId, {
      conditions: selectedControl.conditions?.filter(c => c.id !== conditionId) || [],
    });
  };
  
  const handleUpdateCondition = (conditionId: string, updates: Partial<Condition>) => {
    if (!selectedControlId || !selectedControl) return;
    
    updateControl(selectedControlId, {
      conditions: selectedControl.conditions?.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      ) || [],
    });
  };
  
  return (
    <div className="h-full flex">
      <div className="w-64 border-r p-4 bg-white shadow-sm overflow-auto">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Controls</h2>
        <div className="space-y-1">
          {allControls.map(control => (
            <button
              key={control.id}
              onClick={() => setSelectedControlId(control.id)}
              className={`w-full text-left px-3 py-2 rounded-md ${
                selectedControlId === control.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {control.label || control.type}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 bg-gray-50 overflow-auto">
        {selectedControl ? (
          <div>
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="text-lg font-medium mb-4">
                {selectedControl.label || selectedControl.type} Conditions
              </h3>
              
              {(!selectedControl.conditions || selectedControl.conditions.length === 0) && (
                <p className="text-gray-500 mb-4">No conditions defined for this control.</p>
              )}
              
              {selectedControl.conditions && selectedControl.conditions.length > 0 && (
                <div className="space-y-4 mb-4">
                  {selectedControl.conditions.map(condition => (
                    <div key={condition.id} className="p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Condition</h4>
                        <button
                          onClick={() => handleDeleteCondition(condition.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Target Control
                          </label>
                          <select
                            value={condition.targetControlId}
                            onChange={(e) => handleUpdateCondition(condition.id, { targetControlId: e.target.value })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="">Select control</option>
                            {allControls
                              .filter(c => c.id !== selectedControlId)
                              .map(control => (
                                <option key={control.id} value={control.id}>
                                  {control.label || control.type}
                                </option>
                              ))
                            }
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Property
                          </label>
                          <select
                            value={condition.property}
                            onChange={(e) => handleUpdateCondition(condition.id, { property: e.target.value as 'visible' | 'enabled' })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="visible">Visibility</option>
                            <option value="enabled">Enabled State</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Operator
                          </label>
                          <select
                            value={condition.operator}
                            onChange={(e) => handleUpdateCondition(condition.id, { operator: e.target.value as any })}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            <option value="equals">Equals</option>
                            <option value="notEquals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greaterThan">Greater Than</option>
                            <option value="lessThan">Less Than</option>
                            <option value="filled">Is Filled</option>
                            <option value="notFilled">Is Not Filled</option>
                          </select>
                        </div>
                        
                        {condition.operator !== 'filled' && condition.operator !== 'notFilled' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={condition.value || ''}
                              onChange={(e) => handleUpdateCondition(condition.id, { value: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={handleAddCondition}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusCircle size={18} />
                <span>Add Condition</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p>Select a control to manage its conditions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StateTab;