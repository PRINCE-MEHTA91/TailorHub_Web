import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
  return (
    <div className="bg-gray-800 p-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for tailors, fabrics, and more"
          className="w-full py-3 pl-4 pr-16 rounded-full text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="absolute inset-y-0 right-0 px-6 bg-blue-500 text-white rounded-r-full flex items-center space-x-2">
          <FaSearch />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
