import React from 'react';
import CategoryCard from './CategoryCard';

const categories = [
  { id: 1, name: 'Kurtas', image: 'https://picsum.photos/seed/kurtas/400/400' },
  { id: 2, name: 'Suits', image: 'https://picsum.photos/seed/suits/400/400' },
  { id: 3, name: 'Dresses', image: 'https://picsum.photos/seed/dresses/400/400' },
  { id: 4, name: 'Accessories', image: 'https://picsum.photos/seed/accessories/400/400' },
];

const CategoryGrid = () => {
  return (
    <div className="bg-gray-200 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid;
