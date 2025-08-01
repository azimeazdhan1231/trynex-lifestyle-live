import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/constants";
import type { Product } from "@shared/schema";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  products?: Product[];
}

interface AIChatbotProps {
  onProductSelect?: (product: Product) => void;
}

export default function AIChatbot({ onProductSelect }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'আসসালামু আলাইকুম! আমি ট্রাইনেক্স এআই। আপনার কী প্রয়োজন? পণ্য খুঁজে দিতে, অর্ডার করতে বা যেকোনো প্রশ্নের উত্তর দিতে পারি।',
      timestamp: new Date().toLocaleTimeString('bn-BD')
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get products for search functionality
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('bn-BD')
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          chatHistory: messages.slice(-6)
        })
      });

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString('bn-BD'),
        products: data.searchResults
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।',
        timestamp: new Date().toLocaleTimeString('bn-BD')
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "নতুন পণ্য দেখাও",
    "গিফট আইটেম আছে?",
    "ডেলিভারি চার্জ কত?",
    "পেমেন্ট পদ্ধতি কী?",
    "অর্ডার করতে চাই"
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 shadow-2xl animate-bounce"
        >
          <Bot className="w-6 h-6" />
        </Button>
        <div className="absolute -top-12 right-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-90">
          AI সহায়ক
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    }`}>
      <Card className="h-full flex flex-col shadow-2xl border-2 border-primary/20">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-6 h-6" />
              <div>
                <CardTitle className="text-lg">ট্রাইনেক্স এআই</CardTitle>
                <p className="text-xs opacity-90">অনলাইন • সর্বদা সহায়তায়</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white hover:bg-white/20 p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-white' 
                      : 'bg-white border border-gray-200'
                  } rounded-lg p-3 shadow-sm`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.role === 'assistant' ? <Bot className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Product results */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.products.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => onProductSelect?.(product)}
                            className="bg-gray-50 border rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                                  <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-xs">
                                    স্টক: {product.stock}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-primary animate-pulse" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Questions */}
            <div className="p-3 border-t bg-white">
              <div className="flex flex-wrap gap-1 mb-3">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(question)}
                    className="text-xs h-7 rounded-full"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}