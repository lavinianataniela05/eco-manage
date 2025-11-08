'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Bot, Send, X, Minimize2, Maximize2, Trash2 } from 'lucide-react';

// Types untuk Chatbot
type ChatMessage = {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

type QuickAction = {
  label: string;
  question: string;
  icon: string;
};

// Komponen Chatbot
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick actions untuk pertanyaan umum
  const quickActions: QuickAction[] = [
    { label: 'Cara Belanja', question: 'Bagaimana cara berbelanja di sini?', icon: '🛒' },
    { label: 'Status Order', question: 'Bagaimana cara mengecek status pesanan saya?', icon: '📦' },
    { label: 'Pengembalian', question: 'Bagaimana kebijakan pengembalian barang?', icon: '🔄' },
    { label: 'Premium', question: 'Apa keuntungan menjadi member premium?', icon: '👑' },
    { label: 'Poin', question: 'Bagaimana sistem poin rewards bekerja?', icon: '⭐' },
    { label: 'Jual Barang', question: 'Bagaimana cara menjual barang di marketplace ini?', icon: '💰' }
  ];

  // Scroll ke bawah otomatis
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Inisialisasi chat pertama kali
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'bot',
        content: 'Halo! 👋 Saya EcoAssistant, asisten virtual Anda. Saya siap membantu dengan pertanyaan tentang belanja, penjualan, rewards, atau hal lainnya. Apa yang bisa saya bantu?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  // Simulasi AI response
  const generateBotResponse = (userMessage: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('belanja') || lowerMessage.includes('cara beli')) {
          resolve('Untuk berbelanja:\n\n1. **Browse produk** - Jelajahi kategori atau gunakan search\n2. **Add to cart** - Klik tombol "Add to Cart" pada produk\n3. **Checkout** - Buka cart dan lanjutkan ke pembayaran\n4. **Pembayaran** - Pilih metode pembayaran yang tersedia\n5. **Konfirmasi** - Anda akan mendapat notifikasi order confirmation\n\nButuh bantuan lebih lanjut?');
        } 
        else if (lowerMessage.includes('status') || lowerMessage.includes('pesanan') || lowerMessage.includes('order')) {
          resolve('Untuk cek status pesanan:\n\n1. Buka **Profile** di pojok kanan atas\n2. Pilih **Order History**\n3. Lihat status terkini pesanan Anda\n\nStatus yang tersedia: Pending, Paid, Shipped, Delivered\n\nAda pesanan spesifik yang ingin dicek?');
        }
        else if (lowerMessage.includes('premium') || lowerMessage.includes('member')) {
          resolve('**Keuntungan Member Premium:** 👑\n\n• Diskon 20% untuk semua pembelian\n• Bonus poin 50% lebih banyak\n• Free delivery untuk semua order\n• Priority customer support\n• Akses early sale\n\nHanya Rp 99,000/bulan. Mau upgrade?');
        }
        else if (lowerMessage.includes('poin') || lowerMessage.includes('reward')) {
          resolve('**Sistem Poin Rewards:** ⭐\n\n• Dapatkan 1 poin setiap Rp 10,000 pembelian\n• Member premium dapat 1.5x lebih banyak poin\n• Poin bisa ditukar dengan voucher diskon\n• 100 poin = Rp 10,000 voucher\n• Cek poin Anda di halaman Profile\n\nPoin tidak pernah kadaluarsa!');
        }
        else if (lowerMessage.includes('jual') || lowerMessage.includes('seller')) {
          resolve('**Cara Menjual Barang:** 💰\n\n1. Klik tombol **"Sell Item"** di header\n2. Isi detail produk (foto, nama, deskripsi, harga)\n3. Set kategori dan kondisi barang\n4. Submit untuk review tim kami\n5. Produk live dalam 1-2 jam kerja\n\nKami hanya mengambil komisi 5% dari penjualan berhasil.');
        }
        else if (lowerMessage.includes('pengembalian') || lowerMessage.includes('return')) {
          resolve('**Kebijakan Pengembalian:** 🔄\n\n• Bisa return dalam 7 hari setelah penerimaan\n• Barang harus dalam kondisi original\n• Biaya return gratis untuk member premium\n• Dana kembali dalam 3-5 hari kerja\n• Hubungi CS untuk proses return\n\nAda barang spesifik yang ingin diretur?');
        }
        else if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
          resolve('Sama-sama! 😊 Senang bisa membantu. Jika ada pertanyaan lain, jangan ragu untuk bertanya!');
        }
        else {
          resolve('Saya mengerti pertanyaan Anda tentang: "' + userMessage + '". Untuk informasi lebih detail, Anda bisa:\n\n• Cek FAQ di halaman Help Center\n• Hubungi customer service email: support@ecomarket.com\n• Lihat panduan di halaman Profile\n\nAda hal spesifik lain yang bisa saya bantu?');
        }
      }, 1000 + Math.random() * 1000);
    });
  };

  // Handle kirim pesan
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Generate bot response
    try {
      const botResponse = await generateBotResponse(inputMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action
  const handleQuickAction = (question: string) => {
    setInputMessage(question);
    // Trigger send after a small delay to allow input update
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Clear chat history
  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: 'Halo! 👋 Percakapan telah dibersihkan. Ada yang bisa saya bantu?',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // Format waktu
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Open Chatbot"
      >
        <MessageCircle className="w-6 h-6" />
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">💬</span>
        </div>
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isMinimized 
            ? 'bottom-6 right-6 w-80 h-14' 
            : 'bottom-6 right-6 w-80 h-[500px] md:w-96 md:h-[600px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-2xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">EcoAssistant</h3>
                <p className="text-xs opacity-80">Online • Siap membantu</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="bg-white h-[calc(100%-140px)] overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.type === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-teal-200' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-none p-3 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 2 && (
                <div className="bg-gray-50 border-t p-3">
                  <p className="text-xs text-gray-600 mb-2 font-medium">Pertanyaan Cepat:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.slice(0, 4).map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.question)}
                        className="bg-white border border-gray-200 rounded-lg p-2 text-xs hover:bg-teal-50 hover:border-teal-200 transition-colors text-left"
                      >
                        <span className="mr-1">{action.icon}</span>
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="bg-white border-t p-3">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ketik pertanyaan Anda..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;