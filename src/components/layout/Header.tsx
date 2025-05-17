import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Settings, User, Bell } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white shadow-md z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold">Reflexive Questionnaires</h1>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link to="/questionnaires" className="hover:text-blue-200 transition-colors">
              Questionnaires
            </Link>
            <Link to="/settings" className="hover:text-blue-200 transition-colors">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-1.5 rounded-full hover:bg-blue-800 transition-colors">
            <Search size={20} />
          </button>
          <button className="p-1.5 rounded-full hover:bg-blue-800 transition-colors">
            <Bell size={20} />
          </button>
          <div className="h-8 w-px bg-blue-700"></div>
          <button className="flex items-center space-x-2 hover:bg-blue-800 rounded-full p-1.5 transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;