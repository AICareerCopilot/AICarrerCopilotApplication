
import React from 'react';
import { FileText } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Fauji Resume Maker <span className="text-primary-600">&</span> Skillsyncer
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
