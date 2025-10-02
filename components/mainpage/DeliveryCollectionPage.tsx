"use client";

import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, updateDoc, doc, increment, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config'
import { useAuthState } from 'react-firebase-hooks/auth';

const EcoCollectScheduler = () => {
  const [user] = useAuthState(auth);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState("09:00 AM");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recyclingType, setRecyclingType] = useState("mixed");
  const [bagsCount, setBagsCount] = useState(1);
  const [currentStep, setCurrentStep] = useState(1);
  const [formComplete, setFormComplete] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk pembayaran dan jarak
  const [distance, setDistance] = useState<number | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");

  // Points system
  const [pointsEarned, setPointsEarned] = useState(0);

  // Subscription state
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const isPremiumMember = userSubscription?.isActive && userSubscription.tier === 'pro';

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ];

  const recyclingTypes = [
    { 
      id: "mixed", 
      label: "Mixed Recycling", 
      icon: "🔄", 
      color: "bg-emerald-100", 
      basePrice: 5000,
      pointsPerKg: 5 // 5 points per kg for mixed recycling
    },
    { 
      id: "paper", 
      label: "Paper/Cardboard", 
      icon: "📄", 
      color: "bg-blue-100", 
      basePrice: 3000,
      pointsPerKg: 4 // 4 points per kg for paper
    },
    { 
      id: "plastic", 
      label: "Plastics", 
      icon: "🥤", 
      color: "bg-yellow-100", 
      basePrice: 4000,
      pointsPerKg: 3 // 3 points per kg for plastic
    },
    { 
      id: "glass", 
      label: "Glass", 
      icon: "🔍", 
      color: "bg-green-100", 
      basePrice: 4500,
      pointsPerKg: 6 // 6 points per kg for glass
    },
    { 
      id: "metal", 
      label: "Metal", 
      icon: "🥫", 
      color: "bg-gray-100", 
      basePrice: 6000,
      pointsPerKg: 7 // 7 points per kg for metal
    },
    { 
      id: "ewaste", 
      label: "E-Waste", 
      icon: "💻", 
      color: "bg-purple-100", 
      basePrice: 8000,
      pointsPerKg: 10 // 10 points per kg for e-waste
    }
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const paymentMethods = [
    { id: "credit_card", label: "Credit Card", icon: "💳" },
    { id: "debit_card", label: "Debit Card", icon: "💳" },
    { id: "ewallet", label: "E-Wallet", icon: "📱" },
    { id: "bank_transfer", label: "Bank Transfer", icon: "🏦" }
  ];

  // Tarif per km
  const distanceRate = 2000; // Rp 2.000 per km

  // Load user subscription data
  useEffect(() => {
    const loadUserSubscription = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserSubscription(userData.subscription || null);
          }
        } catch (error) {
          console.error('Error loading subscription:', error);
        } finally {
          setIsLoadingSubscription(false);
        }
      } else {
        setIsLoadingSubscription(false);
      }
    };

    loadUserSubscription();
  }, [user]);

  useEffect(() => {
    const checkFormCompletion = () => {
      if (currentStep === 1) return !!selectedDate && !!selectedTime;
      if (currentStep === 2) return recyclingType !== "" && bagsCount > 0;
      if (currentStep === 3) return address !== "" && email !== "" && phone !== "";
      if (currentStep === 4) return distance !== null;
      if (currentStep === 5) {
        if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
          return cardNumber !== "" && expiryDate !== "" && cvv !== "" && cardholderName !== "";
        }
        return true;
      }
      return false;
    };
    setFormComplete(checkFormCompletion());
  }, [currentStep, selectedDate, selectedTime, recyclingType, bagsCount, address, email, phone, distance, paymentMethod, cardNumber, expiryDate, cvv, cardholderName]);

  // Calculate points when recycling type or bags count changes - UPDATED untuk premium members
  useEffect(() => {
    if (recyclingType && bagsCount > 0) {
      const selectedType = recyclingTypes.find(type => type.id === recyclingType);
      if (selectedType) {
        let points = selectedType.pointsPerKg * bagsCount;
        
        // Premium members get 50% bonus points
        if (isPremiumMember) {
          points = Math.floor(points * 1.5);
        }
        
        setPointsEarned(points);
      }
    }
  }, [recyclingType, bagsCount, isPremiumMember]);

  // Fungsi untuk menghitung jarak (simulasi)
  const calculateDistance = async () => {
    if (!address) return;
    
    setIsCalculatingDistance(true);
    
    // Simulasi API call untuk menghitung jarak
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate random distance antara 2-20 km (simulasi)
    const randomDistance = Math.floor(Math.random() * 19) + 2;
    setDistance(randomDistance);
    
    setIsCalculatingDistance(false);
  };

  // Fungsi untuk menghitung total biaya - UPDATED untuk premium discount
  const calculateTotalCost = () => {
    if (!distance) return 0;
    
    const selectedType = recyclingTypes.find(type => type.id === recyclingType);
    if (!selectedType) return 0;
    
    let baseCost = selectedType.basePrice * bagsCount;
    let distanceCost = distance * distanceRate;
    
    // Apply 20% discount for premium members
    if (isPremiumMember) {
      baseCost = baseCost * 0.8;
      distanceCost = distanceCost * 0.8;
    }
    
    const totalCost = baseCost + distanceCost;
    
    return Math.floor(totalCost);
  };

  // Fungsi untuk menambahkan points ke user profile - UPDATED untuk premium bonus
  const addPointsToUser = async (userId: string, points: number) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        points: increment(points),
        completedPickups: increment(1),
        carbonOffset: increment(bagsCount * 2.5) // Assuming 1kg waste = 2.5kg carbon offset
      });
      return true;
    } catch (error) {
      console.error('Error adding points to user:', error);
      return false;
    }
  };

  // Fungsi untuk menambahkan activity
  const addActivity = async (userId: string, activityData: any) => {
    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        userId,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error adding activity:', error);
      return false;
    }
  };

  // Fungsi untuk menyimpan data ke Firebase - UPDATED untuk subscription info
  const saveToFirebase = async () => {
    if (!user || !selectedDate) return null;

    const selectedType = recyclingTypes.find(t => t.id === recyclingType);
    const totalPoints = pointsEarned;
    const totalCost = calculateTotalCost();

    const collectionData = {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email?.split('@')[0] || 'User',
      pickupDate: selectedDate,
      pickupTime: selectedTime,
      address: address,
      email: email,
      phone: phone,
      pickupNotes: pickupNotes,
      recyclingType: recyclingType,
      recyclingTypeLabel: selectedType?.label,
      bagsCount: bagsCount,
      weight: bagsCount, // Assuming 1 bag = 1 kg
      distance: distance,
      totalCost: totalCost,
      originalCost: calculateOriginalCost(), // Store original cost before discount
      discountApplied: isPremiumMember ? 20 : 0, // Store discount percentage
      paymentMethod: paymentMethod,
      pointsEarned: totalPoints,
      subscriptionApplied: isPremiumMember,
      status: 'scheduled',
      statusLabel: 'Scheduled',
      collector: null,
      collectorPhone: null,
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'collections'), collectionData);
      
      // Add points to user profile
      await addPointsToUser(user.uid, totalPoints);
      
      // Add activity
      await addActivity(user.uid, {
        type: 'pickup',
        title: "Recycling Pickup Scheduled",
        description: `Scheduled ${bagsCount}kg ${selectedType?.label} pickup for ${selectedDate.toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        points: totalPoints,
        subscriptionBonus: isPremiumMember
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      return null;
    }
  };

  // Calculate original cost without discount
  const calculateOriginalCost = () => {
    if (!distance) return 0;
    
    const selectedType = recyclingTypes.find(type => type.id === recyclingType);
    if (!selectedType) return 0;
    
    const baseCost = selectedType.basePrice * bagsCount;
    const distanceCost = distance * distanceRate;
    const totalCost = baseCost + distanceCost;
    
    return totalCost;
  };

  // Calculate savings for premium members
  const calculateSavings = () => {
    if (!isPremiumMember) return 0;
    const originalCost = calculateOriginalCost();
    const discountedCost = calculateTotalCost();
    return originalCost - discountedCost;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return date < tomorrow;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    return {
      dayName: dayNames[date.getDay()],
      day: date.getDate(),
      month: monthNames[date.getMonth()],
      year: date.getFullYear()
    };
  };

  const handleDateClick = (day: number) => {
    if (!isDateDisabled(day)) {
      const newDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(newDate);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === currentMonth && 
        selectedDate.getFullYear() === currentYear;
      const isDisabled = isDateDisabled(day);
      const isToday = new Date().getDate() === day && 
        new Date().getMonth() === currentMonth && 
        new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateClick(day)}
          disabled={isDisabled}
          className={`h-8 w-8 rounded-full text-sm font-medium transition-all duration-200 mx-auto flex items-center justify-center
            ${isSelected 
              ? "bg-emerald-600 text-white shadow-lg scale-110" 
              : isDisabled 
                ? "text-gray-300 cursor-not-allowed" 
                : isToday
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                  : "text-emerald-700 hover:bg-emerald-100 hover:scale-105"
            }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsSubmitting(true);
      
      try {
        // Save to Firebase
        const docId = await saveToFirebase();
        
        if (docId) {
          console.log("Pickup scheduled successfully with ID:", docId);
          setIsSubmitted(true);
        } else {
          console.error("Failed to save to Firebase");
          // Handle error - show error message to user
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        // Handle error - show error message to user
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setSelectedDate(null);
    setSelectedTime("09:00 AM");
    setAddress("");
    setEmail("");
    setPhone("");
    setPickupNotes("");
    setRecyclingType("mixed");
    setBagsCount(1);
    setDistance(null);
    setPaymentMethod("credit_card");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setCardholderName("");
    setPointsEarned(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formattedDate = formatDate(selectedDate);
  const selectedRecyclingLabel = recyclingTypes.find(t => t.id === recyclingType)?.label;
  const selectedRecyclingBasePrice = recyclingTypes.find(t => t.id === recyclingType)?.basePrice || 0;
  const selectedRecyclingPointsPerKg = recyclingTypes.find(t => t.id === recyclingType)?.pointsPerKg || 0;
  const totalCost = calculateTotalCost();
  const originalCost = calculateOriginalCost();
  const savings = calculateSavings();

  // Premium Member Badge Component
  const PremiumBadge = () => (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center space-x-2 mb-4">
      <span>👑</span>
      <span>Premium Member - 20% Discount Applied!</span>
    </div>
  );

  // Upgrade CTA Component
  const UpgradeCTA = () => (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <span className="text-white text-lg">👑</span>
          </div>
          <div>
            <h4 className="font-bold text-purple-800">Upgrade to Premium</h4>
            <p className="text-purple-600 text-sm">Get 20% discount on all pickups!</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => window.open('/subscription', '_blank')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
        >
          Upgrade
        </button>
      </div>
    </div>
  );

  const renderReviewSummary = () => (
    <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-emerald-800 mb-6 text-center">Review Your Pickup Details</h3>
      
      {/* Premium Badge atau Upgrade CTA */}
      {isPremiumMember ? (
        <PremiumBadge />
      ) : (
        <UpgradeCTA />
      )}
      
      <div className="space-y-4 text-left px-4">
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
          <span className="text-emerald-600 font-medium">Date & Time:</span>
          <span className="font-bold text-emerald-800">
            {formattedDate && `${formattedDate.month} ${formattedDate.day}, ${formattedDate.year}`} at {selectedTime}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
          <span className="text-emerald-600 font-medium">Recycling Type:</span>
          <span className="font-bold text-emerald-800">
            {selectedRecyclingLabel}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
          <span className="text-emerald-600 font-medium">Quantity:</span>
          <span className="font-bold text-emerald-800">
            {bagsCount} {bagsCount === 1 ? "kg" : "kgs"}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
          <span className="text-emerald-600 font-medium">Distance:</span>
          <span className="font-bold text-emerald-800">
            {distance} km
          </span>
        </div>
        <div className="border-b border-emerald-100 pb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-emerald-600">Base Cost:</span>
            <span className="font-bold text-emerald-800">
              {formatCurrency(selectedRecyclingBasePrice * bagsCount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-emerald-600">Distance Cost ({distance} km × {formatCurrency(distanceRate)}):</span>
            <span className="font-bold text-emerald-800">
              {formatCurrency(distance ? distance * distanceRate : 0)}
            </span>
          </div>
          
          {/* Discount Display for Premium Members */}
          {isPremiumMember && (
            <div className="flex justify-between items-center mb-1 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg">
              <span className="text-purple-600 font-medium">Premium Discount (20%):</span>
              <span className="font-bold text-purple-600">
                -{formatCurrency(savings)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-2 border-t border-emerald-200">
            <span className="text-emerald-700 font-bold">Total Cost:</span>
            <span className="font-bold text-lg text-emerald-800">
              {formatCurrency(totalCost)}
            </span>
          </div>
          
          {/* Original Price for Premium Members */}
          {isPremiumMember && (
            <div className="flex justify-between items-center text-sm text-purple-600 mt-1">
              <span>Original Price:</span>
              <span className="line-through">{formatCurrency(originalCost)}</span>
            </div>
          )}
        </div>
        {/* Points Section - UPDATED untuk premium bonus */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-amber-700 font-bold">Points You'll Earn:</span>
              <p className="text-sm text-amber-600">
                {bagsCount}kg × {selectedRecyclingPointsPerKg} points/kg
                {isPremiumMember && " + 50% Premium Bonus"}
              </p>
            </div>
            <span className="text-2xl font-bold text-amber-700">
              +{pointsEarned} pts
            </span>
          </div>
        </div>
        <div className="border-b border-emerald-100 pb-3">
          <span className="block text-emerald-600 font-medium mb-1">Pickup Address:</span>
          <span className="font-bold text-emerald-800 block text-right">{address || "Not provided"}</span>
        </div>
        <div className="border-b border-emerald-100 pb-3">
          <span className="block text-emerald-600 font-medium mb-1">Contact Email:</span>
          <span className="font-bold text-emerald-800 block text-right">{email || "Not provided"}</span>
        </div>
        <div className="border-b border-emerald-100 pb-3">
          <span className="block text-emerald-600 font-medium mb-1">Contact Phone:</span>
          <span className="font-bold text-emerald-800 block text-right">{phone || "Not provided"}</span>
        </div>
        <div>
          <span className="block text-emerald-600 font-medium mb-1">Pickup Notes:</span>
          <p className="text-emerald-800 text-sm italic break-words">{pickupNotes || "No special notes."}</p>
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border-2 border-emerald-100 shadow-lg">
        <h3 className="text-xl font-bold text-emerald-800 mb-6">Payment Information</h3>
        
        {/* Premium Badge atau Upgrade CTA */}
        {isPremiumMember ? (
          <PremiumBadge />
        ) : (
          <UpgradeCTA />
        )}
        
        <div className="space-y-6">
          <div>
            <label className="block text-emerald-700 font-medium mb-3">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                    paymentMethod === method.id
                      ? "border-emerald-500 bg-emerald-50 transform scale-105 shadow-lg"
                      : "border-emerald-100 bg-white hover:bg-emerald-50 hover:scale-102"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-sm font-medium text-emerald-800">{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
            <div className="space-y-4 bg-white p-6 rounded-xl border border-emerald-100">
              <div>
                <label htmlFor="cardholderName" className="block text-emerald-700 font-medium mb-2">Cardholder Name</label>
                <input
                  type="text"
                  id="cardholderName"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block text-emerald-700 font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-emerald-700 font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-emerald-700 font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                    placeholder="123"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Total Amount:</span>
              <span className="text-2xl font-bold">{formatCurrency(totalCost)}</span>
            </div>
            {isPremiumMember && (
              <div className="flex justify-between items-center text-emerald-100 text-sm">
                <span>You saved:</span>
                <span className="font-bold">{formatCurrency(savings)}</span>
              </div>
            )}
            <p className="text-emerald-100 text-sm">
              Includes base recycling cost and distance-based delivery fee
              {isPremiumMember && " (20% discount applied)"}
            </p>
          </div>

          {/* Points Preview in Payment Step - UPDATED untuk premium bonus */}
          <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 rounded-2xl text-white">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold text-lg">Points You'll Earn</span>
                <p className="text-amber-100 text-sm">
                  {bagsCount}kg {selectedRecyclingLabel} × {selectedRecyclingPointsPerKg} points/kg
                  {isPremiumMember && " + 50% Premium Bonus"}
                </p>
              </div>
              <span className="text-3xl font-bold">+{pointsEarned}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-emerald-200/20 to-emerald-100/10 animate-pulse"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">♻️</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent mb-2">
            EcoCollect
          </h1>
          <h2 className="text-2xl font-bold text-emerald-800 mb-2">
            Schedule a Pickup
          </h2>
          <p className="text-emerald-600 max-w-lg mx-auto">
            Help us make the planet greener by recycling your waste responsibly
          </p>
        </div>

        {!isSubmitted && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3, 4, 5].map((step, index) => (
                <React.Fragment key={step}>
                  <button
                    type="button"
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 transform ${
                      currentStep === step
                        ? "bg-emerald-600 text-white shadow-lg scale-110"
                        : currentStep > step
                        ? "bg-emerald-500 text-white border-2 border-emerald-300 hover:scale-105"
                        : "bg-white text-emerald-400 border-2 border-emerald-200 shadow-sm"
                    }`}
                    onClick={() => currentStep > step && setCurrentStep(step)}
                    disabled={currentStep <= step}
                  >
                    {currentStep > step ? "✓" : step}
                  </button>
                  {index < 4 && (
                    <div className={`h-1 w-16 rounded-full transition-all duration-500 ${
                      currentStep > step + 1 
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                        : currentStep === step + 1
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-200"
                        : "bg-emerald-100"
                    }`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
            <div className="p-6 md:p-10">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-4xl shadow-xl animate-bounce">
                      ✓
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-emerald-800 mb-4">
                    Pickup Scheduled Successfully!
                  </h3>
                  
                  <p className="text-lg text-emerald-600 mb-8">
                    We've sent confirmation details to your email.
                  </p>

                  {/* Points Earned Celebration - UPDATED untuk premium bonus */}
                  <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 rounded-2xl text-white max-w-md mx-auto mb-8 shadow-lg">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎉</div>
                      <h4 className="text-2xl font-bold mb-2">Congratulations!</h4>
                      <p className="text-lg mb-2">You've earned</p>
                      <div className="text-4xl font-bold mb-2">+{pointsEarned} Points</div>
                      {isPremiumMember && (
                        <p className="text-amber-100 text-sm mb-2">
                          Includes 50% Premium bonus!
                        </p>
                      )}
                      <p className="text-amber-100">
                        Your points will be added to your profile after pickup completion
                      </p>
                    </div>
                  </div>
                  
                  {/* Savings Celebration for Premium Members */}
                  {isPremiumMember && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-2xl text-white max-w-md mx-auto mb-8 shadow-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">💰</div>
                        <h4 className="text-2xl font-bold mb-2">Premium Savings!</h4>
                        <p className="text-lg mb-2">You saved</p>
                        <div className="text-4xl font-bold mb-2">{formatCurrency(savings)}</div>
                        <p className="text-purple-100">
                          Thank you for being a Premium member!
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl shadow-inner border border-emerald-100 max-w-md mx-auto mb-8">
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Date:</span>
                        <span className="font-bold text-emerald-800">
                          {formattedDate && `${formattedDate.month} ${formattedDate.day}, ${formattedDate.year}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Time:</span>
                        <span className="font-bold text-emerald-800">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Type:</span>
                        <span className="font-bold text-emerald-800">
                          {selectedRecyclingLabel}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Quantity:</span>
                        <span className="font-bold text-emerald-800">
                          {bagsCount} {bagsCount === 1 ? "kg" : "kgs"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Distance:</span>
                        <span className="font-bold text-emerald-800">
                          {distance} km
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Total Cost:</span>
                        <span className="font-bold text-emerald-800">
                          {formatCurrency(totalCost)}
                        </span>
                      </div>
                      {isPremiumMember && (
                        <div className="flex justify-between items-center border-b border-emerald-100 pb-3 bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded">
                          <span className="text-purple-600 font-medium">Premium Savings:</span>
                          <span className="font-bold text-purple-600">
                            -{formatCurrency(savings)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-b border-emerald-100 pb-3">
                        <span className="text-emerald-600 font-medium">Points Earned:</span>
                        <span className="font-bold text-amber-600">
                          +{pointsEarned} pts
                        </span>
                      </div>
                      {pickupNotes && (
                        <div className="border-b border-emerald-100 pb-3">
                          <span className="block text-emerald-600 font-medium">Notes:</span>
                          <p className="text-emerald-800 text-sm italic">{pickupNotes}</p>
                        </div>
                      )}
                      <div className="border-b border-emerald-100 pb-3">
                        <span className="block text-emerald-600 font-medium">Address:</span>
                        <p className="font-bold text-emerald-800">{address}</p>
                      </div>
                      <div className="flex justify-between items-center pb-3">
                        <span className="text-emerald-600 font-medium">Email:</span>
                        <span className="font-bold text-emerald-800">{email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl shadow-lg hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    Schedule Another Pickup
                  </button>
                </div>
              ) : (
                <div>
                  {currentStep === 1 && (
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                          <h3 className="text-xl font-bold text-emerald-800 mb-4">Select a Date</h3>
                          
                          <div className="flex items-center justify-between mb-4">
                            <button
                              type="button"
                              onClick={() => navigateMonth('prev')}
                              className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
                            >
                              <span className="text-emerald-600">←</span>
                            </button>
                            <h4 className="text-lg font-semibold text-emerald-800">
                              {months[currentMonth]} {currentYear}
                            </h4>
                            <button
                              type="button"
                              onClick={() => navigateMonth('next')}
                              className="p-2 hover:bg-emerald-100 rounded-full transition-colors"
                            >
                              <span className="text-emerald-600">→</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {weekDays.map(day => (
                              <div key={day} className="text-center text-xs font-medium text-emerald-600 py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                          <h3 className="text-xl font-bold text-emerald-800 mb-4">Select a Time</h3>
                          <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                  selectedTime === slot
                                    ? "bg-emerald-600 text-white shadow-lg transform scale-105"
                                    : "bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 hover:scale-105"
                                }`}
                                onClick={() => setSelectedTime(slot)}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                        <h3 className="text-xl font-bold text-emerald-800 mb-6">Your Pickup Summary</h3>
                        
                        {/* Premium Badge atau Upgrade CTA */}
                        {isPremiumMember ? (
                          <PremiumBadge />
                        ) : (
                          <UpgradeCTA />
                        )}
                        
                        <div className="bg-white p-6 rounded-xl border border-emerald-100 text-center">
                          <div className="text-5xl mb-4">📅</div>
                          {formattedDate ? (
                            <div>
                              <div className="text-2xl font-bold text-emerald-800 mb-1">
                                {formattedDate.dayName}
                              </div>
                              <div className="text-4xl font-bold text-emerald-600 mb-1">
                                {formattedDate.day}
                              </div>
                              <div className="text-lg text-emerald-700 mb-4">
                                {formattedDate.month} {formattedDate.year}
                              </div>
                              <div className="text-xl text-emerald-700 font-medium">
                                at {selectedTime}
                              </div>
                            </div>
                          ) : (
                            <div className="text-emerald-600">
                              Please select a date and time
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                          <h3 className="text-xl font-bold text-emerald-800 mb-4">Recycling Type</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {recyclingTypes.map((type) => (
                              <button
                                key={type.id}
                                type="button"
                                className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                                  recyclingType === type.id
                                    ? "border-emerald-500 bg-emerald-50 transform scale-105 shadow-lg"
                                    : "border-emerald-100 bg-white hover:bg-emerald-50 hover:scale-102"
                                }`}
                                onClick={() => setRecyclingType(type.id)}
                              >
                                <span className="text-2xl">{type.icon}</span>
                                <div className="text-left">
                                  <span className="text-sm font-medium text-emerald-800 block">{type.label}</span>
                                  <span className="text-xs text-emerald-600">{type.pointsPerKg} pts/kg</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                          <h3 className="text-xl font-bold text-emerald-800 mb-4">Quantity</h3>
                          <div className="flex items-center justify-center space-x-6">
                            <button
                              type="button"
                              className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold hover:bg-emerald-200 transition-all duration-200 transform hover:scale-110"
                              onClick={() => setBagsCount(Math.max(1, bagsCount - 1))}
                            >
                              -
                            </button>
                            <div className="text-3xl font-bold text-emerald-800 min-w-[60px] text-center">
                              {bagsCount}
                            </div>
                            <button
                              type="button"
                              className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold hover:bg-emerald-200 transition-all duration-200 transform hover:scale-110"
                              onClick={() => setBagsCount(bagsCount + 1)}
                            >
                              +
                            </button>
                          </div>
                          <p className="text-center text-emerald-600 mt-2 text-sm">
                            {bagsCount} {bagsCount === 1 ? "kg" : "kgs"}
                          </p>
                          
                          {/* Points Preview - UPDATED untuk premium bonus */}
                          {pointsEarned > 0 && (
                            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                              <p className="text-amber-800 font-medium">
                                You'll earn <span className="font-bold">+{pointsEarned} points</span>
                                {isPremiumMember && " (includes 50% bonus)"}
                              </p>
                              <p className="text-xs text-amber-600">
                                {bagsCount}kg × {selectedRecyclingPointsPerKg} points/kg
                                {isPremiumMember && " × 1.5 Premium bonus"}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border-2 border-emerald-100 shadow-lg">
                        <h3 className="text-xl font-bold text-emerald-800 mb-6">Recycling Summary</h3>
                        
                        {/* Premium Badge atau Upgrade CTA */}
                        {isPremiumMember ? (
                          <PremiumBadge />
                        ) : (
                          <UpgradeCTA />
                        )}
                        
                        <div className="bg-white p-6 rounded-xl border border-emerald-100">
                          <div className="flex items-center space-x-4 mb-4">
                            <span className="text-3xl">
                              {recyclingTypes.find(t => t.id === recyclingType)?.icon}
                            </span>
                            <div>
                              <h4 className="font-bold text-emerald-800 text-lg">
                                {selectedRecyclingLabel}
                              </h4>
                              <p className="text-emerald-600">
                                {bagsCount} {bagsCount === 1 ? "kg" : "kgs"}
                              </p>
                              <p className="text-sm text-emerald-500 mt-1">
                                Base price: {formatCurrency(selectedRecyclingBasePrice)}/kg
                              </p>
                              <p className="text-sm text-amber-600 font-medium mt-1">
                                Points: {selectedRecyclingPointsPerKg} per kg
                                {isPremiumMember && " + 50% bonus"}
                              </p>
                            </div>
                          </div>
                          
                          {formattedDate && (
                            <div className="border-t border-emerald-100 pt-4">
                              <p className="text-emerald-700">
                                <span className="font-medium">Pickup:</span> {formattedDate.dayName}, {formattedDate.month} {formattedDate.day} at {selectedTime}
                              </p>
                            </div>
                          )}
                          
                          {/* Points Summary - UPDATED untuk premium bonus */}
                          {pointsEarned > 0 && (
                            <div className="border-t border-emerald-100 pt-4 mt-4">
                              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-3 rounded-lg text-white text-center">
                                <p className="font-bold text-lg">+{pointsEarned} Points</p>
                                <p className="text-amber-100 text-sm">
                                  {isPremiumMember ? "Includes 50% Premium bonus!" : "Will be added to your profile"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div className="max-w-2xl mx-auto">
                      <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-2xl border-2 border-emerald-100 shadow-lg">
                        <h3 className="text-xl font-bold text-emerald-800 mb-6">Contact Information</h3>
                        
                        {/* Premium Badge atau Upgrade CTA */}
                        {isPremiumMember ? (
                          <PremiumBadge />
                        ) : (
                          <UpgradeCTA />
                        )}
                        
                        <div className="space-y-6">
                          <div>
                            <label htmlFor="address" className="block text-emerald-700 font-medium mb-2">Full Address</label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                                placeholder="Enter your complete address"
                                required
                              />
                              <button
                                type="button"
                                onClick={calculateDistance}
                                disabled={!address || isCalculatingDistance}
                                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                  !address || isCalculatingDistance
                                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    : "bg-emerald-600 text-white hover:bg-emerald-700 transform hover:scale-105"
                                }`}
                              >
                                {isCalculatingDistance ? "Calculating..." : "Calculate Distance"}
                              </button>
                            </div>
                            {distance !== null && (
                              <p className="text-emerald-600 mt-2">
                                Estimated distance: <span className="font-bold">{distance} km</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="email" className="block text-emerald-700 font-medium mb-2">Email Address</label>
                              <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                                placeholder="your@email.com"
                                required
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="phone" className="block text-emerald-700 font-medium mb-2">Phone Number</label>
                              <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                                placeholder="+1 (555) 123-4567"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="pickupNotes" className="block text-emerald-700 font-medium mb-2">
                              Special Pickup Notes (Optional)
                            </label>
                            <textarea
                              id="pickupNotes"
                              value={pickupNotes}
                              onChange={(e) => setPickupNotes(e.target.value)}
                              rows={3}
                              className="w-full px-4 py-3 rounded-xl border-2 border-emerald-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 text-gray-500"
                              placeholder="e.g., Bags are by the back door, please call upon arrival."
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 4 && (
                    renderReviewSummary()
                  )}

                  {currentStep === 5 && (
                    renderPaymentForm()
                  )}

                  <div className="flex justify-between mt-8">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                        currentStep === 1 
                          ? "border-2 border-gray-200 text-gray-400 cursor-not-allowed" 
                          : "border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 transform hover:scale-105"
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    <button
                      type="submit"
                      disabled={!formComplete || isSubmitting}
                      className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 transform ${
                        formComplete && !isSubmitting
                          ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:from-emerald-700 hover:to-emerald-600 hover:scale-105"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isSubmitting ? "Processing..." : currentStep < 5 ? "Continue →" : "Confirm & Pay Now"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EcoCollectScheduler;