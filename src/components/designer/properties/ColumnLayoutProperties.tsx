import React from 'react';
import { Control } from '../../../types';

interface ColumnLayoutPropertiesProps {
  control: Control;
  onChange: (updates: Partial<Control>) => void;
}

const ColumnLayoutProperties: React.FC<ColumnLayoutPropertiesProps> = ({ control, onChange }) => {
  const columnControl = control as any;
  
  const handleColumnsChange = (numColumns: number) => {
    // Get existing columns or empty arrays
    const existingColumns = columnControl.columnControls || [];
    
    // Create a new array with the correct number of columns
    const newColumnControls = Array.from({ length: numColumns }, (_, i) => 
      // Keep existing column data or create an empty array
      existingColumns[i] || []
    );
    
    onChange({ 
      columns: numColumns,
      columnControls: newColumnControls,
    });
  };
  
  const handleColumnRatioChange = (ratio: string) => {
    onChange({ columnRatio: ratio });
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Column Layout Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Columns
          </label>
          <select
            value={columnControl.columns || 2}
            onChange={(e) => handleColumnsChange(parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
            <option value={4}>4 Columns</option>
          </select>
        </div>
        
        {columnControl.columns > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Ratio
            </label>
            <select
              value={columnControl.columnRatio || 'equal'}
              onChange={(e) => handleColumnRatioChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="equal">Equal Width</option>
              {columnControl.columns === 2 && (
                <>
                  <option value="30:70">30% : 70%</option>
                  <option value="70:30">70% : 30%</option>
                  <option value="40:60">40% : 60%</option>
                  <option value="60:40">60% : 40%</option>
                </>
              )}
              {columnControl.columns === 3 && (
                <>
                  <option value="25:50:25">25% : 50% : 25%</option>
                  <option value="20:60:20">20% : 60% : 20%</option>
                </>
              )}
            </select>
          </div>
        )}
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="responsiveBehavior"
            checked={columnControl.responsiveBehavior === 'stack'}
            onChange={(e) => onChange({ responsiveBehavior: e.target.checked ? 'stack' : 'scroll' })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="responsiveBehavior" className="ml-2 block text-sm text-gray-700">
            Stack columns on mobile
          </label>
        </div>
      </div>
    </div>
  );
};

export default ColumnLayoutProperties;