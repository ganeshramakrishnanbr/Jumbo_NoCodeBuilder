import React from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Control, ControlType } from '../../../types';
import CommonProperties from './CommonProperties';
import TabProperties from './TabProperties';
import ColumnLayoutProperties from './ColumnLayoutProperties';
import TextBoxProperties from './TextBoxProperties';
import NumericProperties from './NumericProperties';
import AddressProperties from './AddressProperties';
import ProtectedNumberProperties from './ProtectedNumberProperties';

const PropertiesPanel: React.FC = () => {
  const { questionnaire, selectedControlId, setSelectedControlId, updateControl } = useQuestionnaire();
  
  const flattenControls = (controls: Control[]): Control[] => {
    let result: Control[] = [];
    
    if (!Array.isArray(controls)) return result;
    
    for (const control of controls) {
      result.push(control);
      
      if (control.type === ControlType.Tab) {
        const tabControl = control as any;
        tabControl.tabs?.forEach((tab: any) => {
          if (Array.isArray(tab.controls)) {
            result = [...result, ...flattenControls(tab.controls)];
          }
        });
      }
      
      if (control.type === ControlType.ColumnLayout) {
        const columnControl = control as any;
        columnControl.columnControls?.forEach((column: Control[]) => {
          if (Array.isArray(column)) {
            result = [...result, ...flattenControls(column)];
          }
        });
      }
    }
    
    return result;
  };
  
  const allControls = flattenControls(questionnaire.controls);
  const selectedControl = allControls.find(c => c.id === selectedControlId);

  const updateSelectedControl = (updates: Partial<Control>) => {
    if (selectedControlId) {
      console.log('Updating control:', selectedControlId, 'with:', updates);
      updateControl(selectedControlId, updates);
    }
  };

  const renderPropertiesForm = () => {
    if (!selectedControl) {
      return (
        <div className="text-gray-500 text-center p-4">
          Select a control to edit its properties
        </div>
      );
    }

    const availableControls = allControls.filter(c => c.id !== selectedControl.id);
    
    return (
      <div className="space-y-6">
        <CommonProperties 
          control={selectedControl} 
          onChange={updateSelectedControl}
          availableControls={availableControls}
        />
        
        {selectedControl.type === ControlType.Tab && (
          <TabProperties 
            control={selectedControl} 
            onChange={updateSelectedControl} 
          />
        )}
        
        {selectedControl.type === ControlType.ColumnLayout && (
          <ColumnLayoutProperties 
            control={selectedControl} 
            onChange={updateSelectedControl} 
          />
        )}
        
        {(selectedControl.type === ControlType.TextBox ||
          selectedControl.type === ControlType.Checkbox ||
          selectedControl.type === ControlType.RadioButton ||
          selectedControl.type === ControlType.Dropdown) && (
          <TextBoxProperties 
            control={selectedControl} 
            onChange={updateSelectedControl} 
          />
        )}

        {(selectedControl.type === ControlType.Numeric ||
          selectedControl.type === ControlType.ToggleSlider) && (
          <NumericProperties
            control={selectedControl}
            onChange={updateSelectedControl}
          />
        )}

        {selectedControl.type === ControlType.Address && (
          <AddressProperties
            control={selectedControl}
            onChange={updateSelectedControl}
          />
        )}

        {selectedControl.type === ControlType.ProtectedNumber && (
          <ProtectedNumberProperties
            control={selectedControl}
            onChange={updateSelectedControl}
          />
        )}
      </div>
    );
  };
  
  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-4 border-b pb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Selected Control
        </label>
        <select
          value={selectedControlId || ''}
          onChange={(e) => setSelectedControlId(e.target.value || null)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select a control</option>
          {allControls.map((control) => (
            <option key={control.id} value={control.id}>
              {control.label || control.type}
            </option>
          ))}
        </select>
      </div>
      
      {renderPropertiesForm()}
    </div>
  );
};

export default PropertiesPanel;