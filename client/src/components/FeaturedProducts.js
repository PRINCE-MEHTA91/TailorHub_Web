import React from 'react';
import ProductCard from './ProductCard';

const products = [
  { id: 1, name: 'Elegant Kurta', price: '₹1,299', image: 'https://picsum.photos/seed/kurta/400/400' },
  { id: 2, name: 'Modern Suit', price: '₹3,499', image: 'https://picsum.photos/seed/suit/400/400' },
  { id: 3, name: 'Stylish Dress', price: '₹1,899', image: 'https://picsum.photos/seed/dress/400/400' },
  { id: 4, name: 'Classic Sherwani', price: '₹4,999', image: 'https://picsum.photos/seed/sherwani/400/400' },
];

const FeaturedProducts = () => {
  return (
    <div className="bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
