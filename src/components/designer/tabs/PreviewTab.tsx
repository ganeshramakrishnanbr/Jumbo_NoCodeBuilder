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

  const handleInputChange = (controlId: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [controlId]: value
    }));
  };

  const toggleMask = (controlId: string) => {
    setShowMasked(prev => ({
      ...prev,
      [controlId]: !prev[controlId]
    }));
  };

  const renderLabel = (label: string, required: boolean = false) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );

  const renderTextBox = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Text Input', control.required)}
        <input
          type="text"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          placeholder={control.properties?.placeholder}
          disabled={!control.enabled}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
    );
  };

  const renderCheckbox = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Checkbox', control.required)}
        <div className="space-y-2">
          {(control.properties?.options || []).map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="checkbox"
                checked={formValues[`${control.id}_${option.id}`] || false}
                onChange={(e) => handleInputChange(`${control.id}_${option.id}`, e.target.checked)}
                disabled={!control.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRadioButton = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Radio Button', control.required)}
        <div className="space-y-2">
          {(control.properties?.options || []).map((option: any) => (
            <div key={option.id} className="flex items-center">
              <input
                type="radio"
                name={control.id}
                checked={formValues[control.id] === option.value}
                onChange={() => handleInputChange(control.id, option.value)}
                disabled={!control.enabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <label className="ml-2 block text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDropdown = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Dropdown', control.required)}
        <select
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          disabled={!control.enabled}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
        >
          <option value="">Select an option</option>
          {(control.properties?.options || []).map((option: any) => (
            <option key={option.id} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const renderNumeric = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Numeric Input', control.required)}
        <input
          type="number"
          value={formValues[control.id] || ''}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          min={control.properties?.min ?? 0}
          max={control.properties?.max ?? 100}
          step={control.properties?.step ?? 1}
          disabled={!control.enabled}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
        />
      </div>
    );
  };

  const renderToggleSlider = (control: Control) => {
    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Toggle Slider', control.required)}
        <input
          type="range"
          value={formValues[control.id] || control.properties?.min || 0}
          onChange={(e) => handleInputChange(control.id, e.target.value)}
          min={control.properties?.min ?? 0}
          max={control.properties?.max ?? 100}
          step={control.properties?.step ?? 1}
          disabled={!control.enabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{control.properties?.min ?? 0}</span>
          <span>{control.properties?.max ?? 100}</span>
        </div>
      </div>
    );
  };

  const renderProtectedNumber = (control: Control) => {
    if (!control.visible) return null;

    const value = formValues[control.id] || '';
    const maskChar = control.properties?.maskChar || '*';
    const totalDigits = control.properties?.totalDigits || 10;
    const showLastDigits = control.properties?.showLastDigits || 0;
    const initiallyMasked = control.properties?.initiallyMasked ?? true;
    const isShowingMasked = showMasked[control.id] ?? initiallyMasked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, '');
      if (newValue.length <= totalDigits) {
        handleInputChange(control.id, newValue);
      }
    };

    const getMaskedValue = (value: string): string => {
      if (!value) return '';
      if (!isShowingMasked) return value;

      const visiblePart = value.slice(-showLastDigits);
      const maskedPart = maskChar.repeat(value.length - showLastDigits);
      return maskedPart + visiblePart;
    };

    return (
      <div className="space-y-2">
        {renderLabel(control.label || 'Protected Number', control.required)}
        <div className="relative">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={getMaskedValue(value)}
            onChange={handleChange}
            maxLength={totalDigits}
            placeholder={`Enter up to ${totalDigits} digits`}
            disabled={!control.enabled}
            className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={() => toggleMask(control.id)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {isShowingMasked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>
        <div className="text-xs text-gray-500 flex justify-between">
          <span>{value.length} / {totalDigits} digits</span>
          {!control.enabled && <span className="text-gray-400">This field is disabled</span>}
        </div>
      </div>
    );
  };

  const renderAddressControl = (control: Control) => {
    if (!control.properties?.fields) return null;

    const countryField = control.properties.fields.find((f: any) => f.label === 'Country');
    const selectedCountry = formValues[countryField?.id || ''];

    return (
      <div className="space-y-4 p-4 border rounded-md bg-white">
        <h3 className="font-medium text-gray-900">{control.label || 'Address'}</h3>
        {control.properties.fields.map((field: any) => {
          if (field.label === 'State/Province' && selectedCountry !== 'US') {
            return null;
          }

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
      case ControlType.Numeric:
        return renderNumeric(control);
      case ControlType.ToggleSlider:
        return renderToggleSlider(control);
      case ControlType.ProtectedNumber:
        return renderProtectedNumber(control);
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
      default:
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
            {questionnaire.controls.map((control) => renderControl(control))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;