import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, File, Settings, HelpCircle, ChevronRight } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { label: 'Questionnaires', icon: <File size={20} />, path: '/questionnaires' },
    { label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { label: 'Help', icon: <HelpCircle size={20} />, path: '/help' },
  ];

  return (
    <aside className="w-64 bg-white shadow-md z-10 hidden md:block">
      <div className="py-6 px-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-3 py-2.5 rounded-md group transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-800'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <span className={isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}>
                  {item.icon}
                </span>
                <span className="ml-3 font-medium">{item.label}</span>
              </div>
              {isActive(item.path) && <ChevronRight size={16} className="text-blue-600" />}
            </Link>
          ))}
        </nav>

        <div className="mt-10">
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Questionnaires
          </h3>
          <div className="mt-2 space-y-1">
            {['Employee Onboarding', 'Customer Feedback', 'Product Survey'].map((title, i) => (
              <Link
                key={i}
                to={`/questionnaires/${i}`}
                className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                {title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;