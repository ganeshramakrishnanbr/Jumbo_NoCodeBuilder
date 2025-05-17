import React from 'react';
import ControlPalette from '../controls/ControlPalette';
import DesignCanvas from '../canvas/DesignCanvas';
import PropertiesPanel from '../properties/PropertiesPanel';
import { DragDropProvider } from '../../../contexts/DragDropContext';

const DesignTab: React.FC = () => {
  return (
    <DragDropProvider>
      <div className="h-full flex">
        <div className="w-64 border-r p-4 bg-white shadow-sm overflow-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Controls</h2>
          <ControlPalette />
        </div>
        <div className="flex-1 p-4 bg-gray-50 overflow-auto">
          <DesignCanvas />
        </div>
        <div className="w-72 border-l p-4 bg-white shadow-sm overflow-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Properties</h2>
          <PropertiesPanel />
        </div>
      </div>
    </DragDropProvider>
  );
};

export default DesignTab;