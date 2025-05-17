import React from 'react';
import { useQuestionnaire } from '../../../contexts/QuestionnaireContext';
import { Clipboard, Download } from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const JsonTab: React.FC = () => {
  const { questionnaire } = useQuestionnaire();
  
  const jsonString = JSON.stringify(questionnaire, null, 2);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString)
      .then(() => {
        alert('JSON copied to clipboard');
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  };
  
  const downloadJson = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${questionnaire.title.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 border-b mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">JSON Output</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Clipboard size={16} />
            <span>Copy</span>
          </button>
          <button
            onClick={downloadJson}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-900 rounded-md">
        <SyntaxHighlighter 
          language="json" 
          style={atomOneDark}
          customStyle={{ 
            margin: 0, 
            padding: '1rem', 
            borderRadius: '0.375rem',
            height: '100%',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default JsonTab;