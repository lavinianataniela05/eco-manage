'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Package,
  Truck,
  Recycle,
  Leaf,
  ArrowLeft,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  arrayUnion 
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config'
import { onAuthStateChanged, User } from 'firebase/auth';

type ProductForm = {
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: 'excellent' | 'good' | 'fair' | 'new';
  tags: string[];
  images: string[];
  delivery: string;
  stock: number;
};

const CATEGORIES = [
  'furniture',
  'fashion',
  'home',
  'kitchen',
  'electronics',
  'books',
  'sports',
  'toys',
  'art',
  'other'
];

const CONDITIONS = [
  { value: 'new', label: 'Brand New', description: 'Never used, with tags' },
  { value: 'excellent', label: 'Excellent', description: 'Like new, minimal signs of use' },
  { value: 'good', label: 'Good', description: 'Gentle use, minor wear' },
  { value: 'fair', label: 'Fair', description: 'Visible wear, fully functional' }
];

const DELIVERY_OPTIONS = [
  { value: 'Free', label: 'Free Delivery' },
  { value: 'Rp 10.000', label: 'Standard: Rp 10.000' },
  { value: 'Rp 15.000', label: 'Express: Rp 15.000' },
  { value: 'Rp 20.000', label: 'Same Day: Rp 20.000' },
  { value: 'Pickup', label: 'Pickup Only' }
];

export default function SellItemPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    condition: 'good',
    tags: [],
    images: [],
    delivery: 'Rp 10.000',
    stock: 1
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (!user) {
        router.push('/login?redirect=/sell');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Simulate image upload - in real app, upload to cloud storage
    const newImages = Array.from(files).map(file => 
      URL.createObjectURL(file)
    );

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 5) // Limit to 5 images
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const calculateEcoScore = (product: ProductForm): number => {
    let score = 50; // Base score

    // Condition scoring
    const conditionScores = {
      'new': 70,
      'excellent': 85,
      'good': 90,
      'fair': 95
    };
    score += conditionScores[product.condition] || 0;

    // Category scoring (higher for secondhand categories)
    const ecoCategories = ['fashion', 'furniture', 'home', 'books'];
    if (ecoCategories.includes(product.category)) {
      score += 20;
    }

    // Tag scoring
    const ecoTags = ['upcycled', 'recycled', 'vintage', 'sustainable', 'organic', 'handmade'];
    product.tags.forEach(tag => {
      if (ecoTags.includes(tag.toLowerCase())) {
        score += 5;
      }
    });

    return Math.min(100, score);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSubmitting(true);
    try {
      const ecoScore = calculateEcoScore(formData);

      const productData = {
        ...formData,
        seller: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        sellerId: currentUser.uid,
        rating: 0,
        reviewCount: 0,
        ecoScore,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Add product to Firestore
      const docRef = await addDoc(collection(db, 'products'), productData);

      // Update user's selling stats
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        itemsListed: arrayUnion(docRef.id)
      });

      // Show success message and redirect
      alert('Product listed successfully!');
      router.push('/marketplace');

    } catch (error) {
      console.error('Error listing product:', error);
      alert('Error listing product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.description.trim() && formData.category;
      case 2:
        return formData.price > 0 && formData.condition;
      case 3:
        return formData.images.length > 0;
      case 4:
        return formData.stock > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">Sell Your Item</h1>
            <p className="text-gray-600">List your pre-loved items and help the environment</p>
          </div>
          
          <div className="w-20"></div> {/* Spacer for balance */}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Product Details', 'Pricing', 'Photos', 'Delivery'].map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  currentStep > index + 1 ? 'text-green-600' :
                  currentStep === index + 1 ? 'text-teal-600 font-semibold' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                  currentStep > index + 1 ? 'bg-green-100 border-2 border-green-600' :
                  currentStep === index + 1 ? 'bg-teal-100 border-2 border-teal-600' :
                  'bg-gray-100 border-2 border-gray-300'
                }`}>
                  {currentStep > index + 1 ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className="text-xs">{step}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Product Details */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Vintage Denim Jacket, Wooden Coffee Table"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your item's features, condition, and why it's eco-friendly..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-teal-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tags like vintage, upcycled, handmade..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Popular tags: vintage, upcycled, recycled, sustainable, organic, handmade
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Pricing
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Pricing & Condition */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing & Condition</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price (Rp) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price (Rp)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.originalPrice || ''}
                        onChange={(e) => handleInputChange('originalPrice', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Show customers the great deal they're getting
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleInputChange('stock', Math.max(1, formData.stock - 1))}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl 
             text-gray-900 placeholder-gray-400 
             bg-white focus:bg-white 
             focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             font-medium text-center"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('stock', formData.stock + 1)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Condition *
                  </label>
                  <div className="space-y-3">
                    {CONDITIONS.map(condition => (
                      <label
                        key={condition.value}
                        className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.condition === condition.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={condition.value}
                          checked={formData.condition === condition.value}
                          onChange={(e) => handleInputChange('condition', e.target.value)}
                          className="mt-1 text-teal-600 focus:ring-teal-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-800">{condition.label}</div>
                          <div className="text-sm text-gray-600">{condition.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {formData.price > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-2">Price Preview</h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-800">
                      Rp {formData.price.toLocaleString()}
                    </span>
                    {formData.originalPrice > formData.price && (
                      <>
                        <span className="text-lg text-gray-500 line-through">
                          Rp {formData.originalPrice.toLocaleString()}
                        </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                          -{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Photos
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Product Photos</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Upload Photos *
                  </label>
                  
                  {/* Image Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-teal-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-semibold text-gray-700 mb-2">
                        Click to upload photos
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload up to 5 photos. Include different angles and any flaws.
                      </p>
                      <button
                        type="button"
                        className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Choose Files
                      </button>
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Uploaded Photos ({formData.images.length}/5)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {formData.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photo Tips */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Photo Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Use natural lighting for best results</li>
                    <li>• Show all angles of your item</li>
                    <li>• Include close-ups of any wear or damage</li>
                    <li>• Use a clean, uncluttered background</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Continue to Delivery
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Delivery */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Options</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Choose Delivery Method *
                  </label>
                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          formData.delivery === option.value
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          value={option.value}
                          checked={formData.delivery === option.value}
                          onChange={(e) => handleInputChange('delivery', e.target.value)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-800">{option.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Eco Impact Preview */}
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3">Eco Impact Preview</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Estimated Eco Score</span>
                      <span className="font-bold text-green-800">{calculateEcoScore(formData)}/100</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <Leaf className="w-4 h-4" />
                      <span>This listing helps reduce waste and promote circular economy</span>
                    </div>
                  </div>
                </div>

                {/* Final Preview */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-800 mb-4">Listing Summary</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Product Info</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Name:</strong> {formData.name}</p>
                        <p><strong>Category:</strong> {formData.category}</p>
                        <p><strong>Condition:</strong> {CONDITIONS.find(c => c.value === formData.condition)?.label}</p>
                        <p><strong>Tags:</strong> {formData.tags.join(', ') || 'None'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Pricing & Delivery</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p><strong>Price:</strong> Rp {formData.price.toLocaleString()}</p>
                        {formData.originalPrice > 0 && (
                          <p><strong>Original:</strong> Rp {formData.originalPrice.toLocaleString()}</p>
                        )}
                        <p><strong>Stock:</strong> {formData.stock}</p>
                        <p><strong>Delivery:</strong> {formData.delivery}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!isStepValid() || submitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Listing...</span>
                    </>
                  ) : (
                    <>
                      <Recycle className="w-4 h-4" />
                      <span>List Item</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </div>
    </div>
  );
}

// Motion component for animations
const motion = {
  div: ({ children, ...props }: any) => <div {...props}>{children}</div>
};