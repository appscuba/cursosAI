
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-hotmart p-2 rounded-lg">
              <i className="fas fa-rocket text-white text-xl"></i>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Viral<span className="text-hotmart">Course</span> Architect
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-hotmart transition-colors">Características</a>
            <a href="#" className="hover:text-hotmart transition-colors">Tutorial</a>
            <button className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all text-xs">
              Suscripción Pro
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
