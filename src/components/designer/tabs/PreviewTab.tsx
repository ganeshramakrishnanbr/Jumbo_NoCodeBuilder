import React, { useState } from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Smartphone, Tablet, Monitor, Eye, EyeOff } from 'lucide-react';
import { Control, ControlType, TabControl, ColumnLayoutControl } from '../../../types';

const PreviewTab: React.FC = () => {  
  const { questionnaire } = useQuestionnaire();
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [activeTabIndices, setActiveTabIndices] = useState<Record<string, number>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showMasked, setShowMasked] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleInputChange = (controlId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const toggleAccordionSection = (accordionId: string, sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [`${accordionId}_${sectionId}`]: !prev[`${accordionId}_${sectionId}`]
    }));
  };

  const renderTextBox = (control: Control) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type="text"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={control.properties?.placeholder}
          required={control.required}
        />
      </div>
    );
  };

  const renderCheckbox = (control: Control) => {
    const options = control.properties?.options || [];
    const values = formValues[control.id] || [];

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formValues[`${control.id}_${option.id}`] || false}
                onChange={(e) => handleInputChange(`${control.id}_${option.id}`, e.target.checked)}
                disabled={!control.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadioButton = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          {options.map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                name={control.id}
                value={option.value}
                checked={formValues[control.id] === option.value}
                onChange={(e) => handleInputChange(control.id, e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="ml-2 text-sm text-gray-700">{option.label}</label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdown = (control: Control) => {
    const options = control.properties?.options || [];
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {control.label}
          {control.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">Select an option</option>
          {options.map((option: any) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderAccordionControl = (control: AccordionControl) => {
    if (!control.sections) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {control.sections.map((section) => {
          const isExpanded = expandedSections[`${control.id}_${section.id}`];
          return (
            <div key={field.id} className="space-y-2">
              {renderLabel(field.label, field.required)}
              {field.type === 'textBox' ? (
                <input
                  type="text"
                  value={formValues[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder={`Enter ${field.label}`}
                  disabled={!control.enabled}
                />
              ) : (
                <select
                  value={formValues[field.id] || ''}
                  onChange={(e) => {
                    handleInputChange(field.id, e.target.value);
                    if (field.label === 'Country' && e.target.value !== 'US') {
                      const stateField = control.properties.fields.find((f: any) => f.label === 'State/Province');
                      if (stateField) {
                        handleInputChange(stateField.id, '');
                      }
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  disabled={!control.enabled}
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option: any) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.validation?.message && formValues[field.id] && !isValidField(field, formValues[field.id]) && (
                <p className="mt-1 text-sm text-red-600">{field.validation.message}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const isValidField = (field: any, value: string) => {
    if (!field.validation) return true;
    
    if (field.validation.pattern) {
      const regex = new RegExp(field.validation.pattern);
      return regex.test(value);
    }
    
    if (field.validation.minLength && value.length < field.validation.minLength) {
      return false;
    }
    
    if (field.validation.maxLength && value.length > field.validation.maxLength) {
      return false;
    }
    
    return true;
  };

  const renderControl = (control: Control) => {
    if (!control.visible) return null;

    switch (control.type) {
      case ControlType.Tab:
        return renderTabControl(control as TabControl);
      case ControlType.ColumnLayout:
        return renderColumnLayout(control as ColumnLayoutControl);
      case ControlType.Address:
        return renderAddressControl(control);
      case ControlType.TextBox:
        return renderTextBox(control);
      case ControlType.Checkbox:
        return renderCheckbox(control);
      case ControlType.RadioButton:
        return renderRadioButton(control);
      case ControlType.Dropdown:
        return renderDropdown(control);
      case ControlType.Accordion:
        return renderAccordionControl(control as AccordionControl);
      default:
        return (
          <div className="p-4 border rounded-md">
            <p className="font-medium">{control.label || control.type}</p>
            <p className="text-sm text-gray-500">Type: {control.type}</p>
          </div>
        );
    }
  };

  const renderTabControl = (tabControl: TabControl) => {
    const currentTabIndex = activeTabIndices[tabControl.id] || 0;
    const position = tabControl.position || 'top';
    const isVertical = position === 'left' || position === 'right';
    
    const containerClasses = {
      top: 'flex flex-col',
      bottom: 'flex flex-col-reverse',
      left: 'flex',
      right: 'flex flex-row-reverse'
    }[position];

    const tabListClasses = {
      top: 'flex border-b bg-gray-50',
      bottom: 'flex border-t bg-gray-50',
      left: 'flex flex-col border-r bg-gray-50 w-48',
      right: 'flex flex-col border-l bg-gray-50 w-48'
    }[position];

    const tabClasses = (index: number) => {
      const isActive = index === currentTabIndex;
      const baseClasses = 'px-4 py-2 font-medium text-sm transition-colors duration-150';
      const activeClasses = 'text-blue-600 bg-white';
      const inactiveClasses = 'text-gray-500 hover:text-gray-700 hover:bg-gray-100';
      
      const positionClasses = {
        top: isActive ? 'border-b-2 border-blue-500' : '',
        bottom: isActive ? 'border-t-2 border-blue-500' : '',
        left: isActive ? 'border-r-2 border-blue-500' : '',
        right: isActive ? 'border-l-2 border-blue-500' : ''
      }[position];

      return `${baseClasses} ${isActive ? activeClasses : inactiveClasses} ${positionClasses}`;
    };

    return (
      <div className="border rounded-md overflow-hidden">
        <div className={containerClasses}>
          <div className={tabListClasses}>
            {tabControl.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTabIndices(prev => ({ ...prev, [tabControl.id]: index }))}
                className={tabClasses(index)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-4 bg-white">
            {tabControl.tabs[currentTabIndex].controls.map((control) => (
              <div key={control.id} className="mb-4">
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderColumnLayout = (columnLayout: ColumnLayoutControl) => {
    const columnClass = `grid grid-cols-${columnLayout.columns} gap-4`;
    return (
      <div className={columnClass}>
        {columnLayout.columnControls.map((column, index) => (
          <div key={index} className="space-y-4">
            {column.map((control) => renderControl(control))}
          </div>
        ))}
      </div>
    );
  };

  const getViewportClass = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
        return 'w-full';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">Preview: {questionnaire.title}</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewportSize('mobile')}
            className={`p-2 rounded-md ${viewportSize === 'mobile' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Mobile View"
          >
            <Smartphone size={20} />
          </button>
          <button
            onClick={() => setViewportSize('tablet')}
            className={`p-2 rounded-md ${viewportSize === 'tablet' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Tablet View"
          >
            <Tablet size={20} />
          </button>
          <button
            onClick={() => setViewportSize('desktop')}
            className={`p-2 rounded-md ${viewportSize === 'desktop' ? 'bg-blue-100 text-blue-800' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Desktop View"
          >
            <Monitor size={20} />
          </button>
        </div>
      </div>

      <div className={`flex-1 overflow-auto ${getViewportClass()}`}>
        <div className="p-4 border rounded-md bg-white">
          <h3 className="text-lg font-medium mb-6">{questionnaire.title}</h3>          
          <div className="space-y-6">            
            {questionnaire.controls.map((control) => (
              <div key={control.id}>
                {renderControl(control)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;