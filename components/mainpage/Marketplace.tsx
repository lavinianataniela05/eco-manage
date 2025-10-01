'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Heart,
  ShoppingCart,
  Star,
  Clock,
  Recycle,
  Leaf,
  Truck,
  Shield,
  ChevronRight,
  Sparkles,
  Tag
} from 'lucide-react';

const PRODUCTS = [
  {
    id: 1,
    name: 'Upcycled Wooden Desk',
    price: 450000,
    originalPrice: 650000,
    category: 'furniture',
    condition: 'excellent',
    rating: 4.8,
    reviewCount: 124,
    image: '/api/placeholder/300/300',
    ecoScore: 95,
    description: 'Beautiful desk made from reclaimed teak wood',
    seller: 'EcoCrafts ID',
    delivery: 'Free',
    tags: ['upcycled', 'premium', 'sustainable']
  },
  {
    id: 2,
    name: 'Vintage Denim Jacket',
    price: 125000,
    originalPrice: 200000,
    category: 'fashion',
    condition: 'good',
    rating: 4.5,
    reviewCount: 89,
    image: '/api/placeholder/300/300',
    ecoScore: 88,
    description: 'Classic denim jacket with unique vintage wash',
    seller: 'RetroThreads',
    delivery: 'Rp 15.000',
    tags: ['vintage', 'denim', 'secondhand']
  },
  {
    id: 3,
    name: 'Recycled Glass Vase Set',
    price: 85000,
    originalPrice: 120000,
    category: 'home',
    condition: 'new',
    rating: 4.9,
    reviewCount: 67,
    image: '/api/placeholder/300/300',
    ecoScore: 92,
    description: 'Set of 3 beautiful vases made from recycled glass',
    seller: 'GreenHome',
    delivery: 'Free',
    tags: ['recycled', 'handmade', 'set']
  },
  {
    id: 4,
    name: 'Bamboo Cutlery Set',
    price: 35000,
    originalPrice: 50000,
    category: 'kitchen',
    condition: 'new',
    rating: 4.7,
    reviewCount: 203,
    image: '/api/placeholder/300/300',
    ecoScore: 98,
    description: 'Sustainable bamboo cutlery for eco-friendly dining',
    seller: 'EcoEssentials',
    delivery: 'Rp 10.000',
    tags: ['bamboo', 'zero-waste', 'new']
  },
  {
    id: 5,
    name: 'Upcycled Tire Ottoman',
    price: 275000,
    originalPrice: 400000,
    category: 'furniture',
    condition: 'good',
    rating: 4.6,
    reviewCount: 45,
    image: '/api/placeholder/300/300',
    ecoScore: 90,
    description: 'Creative ottoman made from upcycled car tires',
    seller: 'TireTransform',
    delivery: 'Rp 25.000',
    tags: ['upcycled', 'creative', 'durable']
  },
  {
    id: 6,
    name: 'Organic Cotton Tote Bag',
    price: 45000,
    originalPrice: 75000,
    category: 'fashion',
    condition: 'new',
    rating: 4.8,
    reviewCount: 156,
    image: '/api/placeholder/300/300',
    ecoScore: 96,
    description: 'Stylish tote bag made from organic cotton',
    seller: 'EcoBags',
    delivery: 'Free',
    tags: ['organic', 'cotton', 'reusable']
  }
];

const CATEGORIES = [
  { name: 'All', count: 56, icon: <Recycle className="w-5 h-5" /> },
  { name: 'Furniture', count: 12, icon: <Tag className="w-5 h-5" /> },
  { name: 'Fashion', count: 18, icon: <Tag className="w-5 h-5" /> },
  { name: 'Home', count: 15, icon: <Tag className="w-5 h-5" /> },
  { name: 'Kitchen', count: 8, icon: <Tag className="w-5 h-5" /> },
  { name: 'Electronics', count: 3, icon: <Tag className="w-5 h-5" /> }
];

type ProductCardProps = {
  product: typeof PRODUCTS[0];
  onAddToCart: (productId: number) => void;
  onToggleWishlist: (productId: number) => void;
};

const ProductCard = ({ product, onAddToCart, onToggleWishlist }: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    onToggleWishlist(product.id);
  };

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  return (
    <div className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
          -{discount}%
        </div>
      )}
      
      {/* Eco Score Badge */}
      <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10 flex items-center space-x-1">
        <Leaf className="w-3 h-3" />
        <span>{product.ecoScore}</span>
      </div>
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlist}
        className={`absolute top-16 right-4 p-2 rounded-full transition-all duration-300 ${
          isWishlisted 
            ? 'bg-red-500 text-white' 
            : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-100 aspect-square">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-800">{product.rating}</span>
          </div>
          <span className="text-sm text-gray-500">({product.reviewCount})</span>
          <span className="text-sm text-gray-500">•</span>
          <span className={`text-sm font-medium ${
            product.condition === 'excellent' ? 'text-green-600' :
            product.condition === 'good' ? 'text-blue-600' : 'text-gray-600'
          }`}>
            {product.condition}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline space-x-2">
          <span className="text-xl font-bold text-gray-800">Rp {product.price.toLocaleString()}</span>
          {product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through">Rp {product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Seller & Delivery */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{product.seller}</span>
          <span>{product.delivery}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags.map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart(product.id)}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default function Marketplace() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  const handleAddToCart = (productId: number) => {
    // Add to cart logic
    console.log('Added to cart:', productId);
  };

  const handleToggleWishlist = (productId: number) => {
    // Wishlist logic
    console.log('Toggled wishlist:', productId);
  };

  const handleSellItem = () => {
    router.push('/sell');
  };

  const filteredProducts = PRODUCTS.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-green-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-400/30 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div className="relative p-6 bg-white/10 rounded-full backdrop-blur-lg border border-white/20 inline-block">
              <Recycle className="w-16 h-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-teal-100 to-emerald-100 bg-clip-text text-transparent leading-tight">
            Eco Marketplace
          </h1>
          
          <p className="text-xl md:text-2xl text-teal-100 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Discover unique upcycled treasures, secondhand gems, and sustainable products. Shop consciously, live sustainably.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for upcycled furniture, vintage fashion, sustainable products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 focus:ring-2 focus:ring-teal-500 text-gray-800 placeholder-gray-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-teal-600 text-white px-6 py-2 rounded-xl hover:bg-teal-700 transition-colors">
                Search
              </button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSellItem}
              className="group bg-white text-teal-700 px-8 py-4 rounded-full font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Sell Your Items</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="group border-2 border-white text-white px-8 py-4 rounded-full font-semibold backdrop-blur-sm bg-white/10 hover:bg-white hover:text-teal-700 transition-all duration-300"
            >
              Browse Products
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {CATEGORIES.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === category.name
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  selectedCategory === category.name
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="eco-score">Eco Score</option>
              </select>
              
              <button className="bg-white border border-gray-300 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Recycle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Shop Eco?</h2>
            <p className="text-lg text-gray-600 font-light">Every purchase makes a difference</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Leaf className="w-12 h-12" />,
                title: 'Reduce Waste',
                description: 'Give pre-loved items a new life and keep them out of landfills'
              },
              {
                icon: <Recycle className="w-12 h-12" />,
                title: 'Support Circular Economy',
                description: 'Promote sustainable consumption and production patterns'
              },
              {
                icon: <Shield className="w-12 h-12" />,
                title: 'Quality Verified',
                description: 'All products are checked for quality and sustainability'
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="p-4 bg-teal-100 text-teal-600 rounded-2xl w-fit mx-auto mb-6">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}