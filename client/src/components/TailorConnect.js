import React from 'react';
import TailorProfileCard from './TailorProfileCard';

const TailorConnect = () => {
  const tailor = {
    name: 'Mr. John Doe',
    experience: '15+ years of experience',
    phone: '+91 12345 67890',
    address: '123, Main Street, Bhopal, MP',
  };

  return (
    <div className="bg-gray-800 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Tailor Connect</h2>
        <TailorProfileCard tailor={tailor} />
      </div>
    </div>
  );
};

export default TailorConnect;
