import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-6 px-4 mb-8 rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">Investment Analyzer</h1>
        <p className="mt-2 text-blue-100">
          AI-powered analysis for your investment portfolio
        </p>
      </div>
    </header>
  );
};

export default Header;