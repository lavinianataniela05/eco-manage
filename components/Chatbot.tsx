'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type: 'text' | 'options' | 'products' | 'support' | 'pricing';
  options?: string[];
  quickReplies?: string[];
}

interface ProductCategory {
  id: string;
  name: string;
  description: string;
  features: string[];
  priceRange?: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Data produk dan layanan EcoMarket
  const productCategories: ProductCategory[] = [
    {
      id: 'furniture',
      name: 'Furniture & Dekorasi',
      description: 'Furniture bekas berkualitas dengan kondisi excellent, cocok untuk rumah dan kantor',
      features: ['Sofa & Kursi', 'Meja & Lemari', 'Dekorasi Rumah', 'Furniture Kantor'],
      priceRange: 'Rp 200rb - 5 juta'
    },
    {
      id: 'fashion',
      name: 'Fashion & Pakaian',
      description: 'Pakaian pre-loved berkualitas dengan berbagai merek dan style terkini',
      features: ['Pakaian Pria', 'Pakaian Wanita', 'Aksesoris', 'Sepatu & Tas'],
      priceRange: 'Rp 50rb - 1 juta'
    },
    {
      id: 'electronics',
      name: 'Elektronik & Gadget',
      description: 'Elektronik bekas dengan garansi dan kualitas terjamin',
      features: ['Smartphone', 'Laptop', 'Audio Equipment', 'Kamera'],
      priceRange: 'Rp 500rb - 10 juta'
    },
    {
      id: 'kitchen',
      name: 'Dapur & Perlengkapan',
      description: 'Perlengkapan dapur dan rumah tangga dalam kondisi baik',
      features: ['Peralatan Masak', 'Penyimpanan', 'Peralatan Makan', 'Elektronik Dapur'],
      priceRange: 'Rp 100rb - 2 juta'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        text: 'Halo! 👋 Saya EcoAssistant. Ada yang bisa saya bantu hari ini?',
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Lihat Produk', 'Cara Berbelanja', 'Status Pesanan', 'Bantuan Lainnya']
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleQuickReply = (reply: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    processBotResponse(reply);
  };

  const processBotResponse = async (userMessage: string) => {
    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let botResponse: Message;
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('produk') || lowerMessage.includes('barang') || lowerMessage.includes('belanja') || lowerMessage.includes('item')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Kategori produk yang tersedia di EcoMarket:',
        isUser: false,
        timestamp: new Date(),
        type: 'products',
        quickReplies: ['Furniture', 'Fashion', 'Elektronik', 'Dapur', 'Kembali ke Menu Utama']
      };
    }
    else if (lowerMessage.includes('harga') || lowerMessage.includes('biaya') || lowerMessage.includes('tarif') || lowerMessage.includes('berapa')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Harga produk di EcoMarket bervariasi tergantung kondisi dan merek. Berikut perkiraan range harga per kategori:',
        isUser: false,
        timestamp: new Date(),
        type: 'pricing',
        quickReplies: ['Furniture', 'Fashion', 'Elektronik', 'Premium Member', 'Kembali ke Menu Utama']
      };
    }
    else if (lowerMessage.includes('cara') || lowerMessage.includes('belanja') || lowerMessage.includes('tutorial') || lowerMessage.includes('panduan')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: '**Cara Berbelanja di EcoMarket:**\n\n🛒 **Langkah-langkah:**\n1. Browse produk atau gunakan search\n2. Filter berdasarkan kategori & harga\n3. Baca detail produk dan kondisi\n4. Tambah ke keranjang\n5. Checkout dan pilih pembayaran\n6. Track pesanan Anda\n\n⭐ **Tips:** Gunakan filter "Eco Score" untuk produk ramah lingkungan!',
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Lihat Produk', 'Cara Bayar', 'Pengiriman', 'Kembali ke Menu Utama']
      };
    }
    else if (lowerMessage.includes('status') || lowerMessage.includes('pesanan') || lowerMessage.includes('order') || lowerMessage.includes('track')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: '**Cek Status Pesanan:**\n\n📦 **Status yang tersedia:**\n• Pending - Menunggu pembayaran\n• Paid - Pembayaran diterima\n• Shipped - Sedang dikirim\n• Delivered - Sudah diterima\n\n🔍 **Cara cek:**\n1. Buka halaman Profile\n2. Pilih "Order History"\n3. Lihat status pesanan Anda',
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Order History', 'Bantuan Pesanan', 'Hubungi Seller', 'Kembali ke Menu Utama']
      };
    }
    else if (lowerMessage.includes('premium') || lowerMessage.includes('member') || lowerMessage.includes('langganan')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: '**Keuntungan Member Premium:**\n\n👑 **Benefit Eksklusif:**\n• Diskon 20% semua produk\n• Free delivery unlimited\n• Bonus poin 50% lebih banyak\n• Priority customer support\n• Early access to sales\n\n💰 **Hanya Rp 99rb/bulan**\n💎 **Free trial 7 hari**',
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Upgrade Sekarang', 'Lihat Detail', 'Bandigkan Paket', 'Kembali ke Menu Utama']
      };
    }
    else if (lowerMessage.includes('furniture')) {
      const category = productCategories.find(c => c.id === 'furniture');
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: `**${category?.name}**\n\n${category?.description}\n\n**Kategori:**\n${category?.features.map(f => `• ${f}`).join('\n')}\n\n**Kisaran Harga:** ${category?.priceRange}\n\n🪑 Semua furniture melalui quality check!`,
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Lihat Sofa', 'Lihat Meja', 'Dekorasi', 'Kembali ke Kategori']
      };
    }
    else if (lowerMessage.includes('fashion') || lowerMessage.includes('pakaian')) {
      const category = productCategories.find(c => c.id === 'fashion');
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: `**${category?.name}**\n\n${category?.description}\n\n**Kategori:**\n${category?.features.map(f => `• ${f}`).join('\n')}\n\n**Kisaran Harga:** ${category?.priceRange}\n\n👗 Kondisi: Excellent - Like New`,
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Pakaian Pria', 'Pakaian Wanita', 'Aksesoris', 'Kembali ke Kategori']
      };
    }
    else if (lowerMessage.includes('elektronik') || lowerMessage.includes('gadget')) {
      const category = productCategories.find(c => c.id === 'electronics');
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: `**${category?.name}**\n\n${category?.description}\n\n**Kategori:**\n${category?.features.map(f => `• ${f}`).join('\n')}\n\n**Kisaran Harga:** ${category?.priceRange}\n\n🔌 Garansi 30 hari untuk elektronik!`,
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Smartphone', 'Laptop', 'Audio', 'Kembali ke Kategori']
      };
    }
    else if (lowerMessage.includes('kembali') || lowerMessage.includes('menu') || lowerMessage.includes('utama')) {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: 'Baik, kembali ke menu utama. Ada yang bisa saya bantu?',
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Lihat Produk', 'Cara Berbelanja', 'Status Pesanan', 'Bantuan Lainnya']
      };
    }
    else {
      botResponse = {
        id: (Date.now() + 1).toString(),
        text: `Saya mengerti Anda bertanya tentang "${userMessage}". Sebagai asisten EcoMarket, saya bisa membantu Anda dengan:\n\n• Informasi produk dan kategori\n• Panduan berbelanja\n• Status pesanan\n• Keuntungan member premium\n• Bantuan lainnya\n\nPilih salah satu opsi di bawah atau tanyakan langsung ya!`,
        isUser: false,
        timestamp: new Date(),
        type: 'options',
        options: ['Lihat Produk', 'Cara Berbelanja', 'Status Pesanan', 'Bantuan Lainnya']
      };
    }

    setMessages(prev => [...prev, botResponse]);
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    await processBotResponse(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleOptionSelect = (option: string) => {
    handleQuickReply(option);
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'options':
        return (
          <div className="space-y-3">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
            <div className="grid grid-cols-2 gap-2">
              {message.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs py-2 px-3 rounded-lg transition-all duration-200 text-center font-medium shadow-sm"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
            <div className="grid grid-cols-1 gap-3">
              {productCategories.map(category => (
                <div key={category.id} className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-3">
                  <h4 className="font-semibold text-teal-800 text-sm">{category.name}</h4>
                  <p className="text-xs text-teal-600 mt-1">{category.description}</p>
                  <button
                    onClick={() => handleQuickReply(category.name)}
                    className="mt-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs py-1 px-3 rounded transition-all duration-200 shadow-sm"
                  >
                    Lihat Produk
                  </button>
                </div>
              ))}
            </div>
            {message.quickReplies && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs py-1 px-3 rounded-full transition-all duration-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
            <div className="space-y-3">
              {productCategories.map(category => (
                <div key={category.id} className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-teal-800 text-sm">{category.name}</h4>
                      <p className="text-xs text-teal-600 mt-1">{category.priceRange}</p>
                    </div>
                    <button
                      onClick={() => handleQuickReply(category.name)}
                      className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white text-xs py-1 px-2 rounded transition-all duration-200 shadow-sm"
                    >
                      Lihat
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {message.quickReplies && (
              <div className="flex flex-wrap gap-2 mt-3">
                {message.quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs py-1 px-3 rounded-full transition-all duration-200"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        );
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
          aria-label="Buka Chatbot"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-[500px] md:w-96 md:h-[550px] bg-white rounded-xl shadow-xl flex flex-col z-50 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-emerald-600 text-white p-4 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm">EcoAssistant</h3>
                  <p className="text-teal-100 text-xs">Online • Siap Membantu</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-teal-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {renderMessage(message)}
                    <p className={`text-xs mt-2 ${message.isUser ? 'text-teal-200' : 'text-gray-500'}`}>
                      {message.timestamp.toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none p-3 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">EcoAssistant sedang mengetik...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pertanyaan Anda..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-all duration-200 flex items-center justify-center disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['Produk?', 'Cara Belanja?', 'Status Order?', 'Premium?'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleQuickReply(suggestion)}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs py-1 px-3 rounded-full transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}