import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, COMPANY_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
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

// Business data for the AI
const BUSINESS_DATA = {
  name: "Trynex Lifestyle",
  description: "আধুনিক লাইফস্টাইল পণ্যের প্রিমিয়াম অনলাইন শপ",
  categories: ["ফ্যাশন", "ইলেকট্রনিক্স", "গিফট আইটেম", "হোম ডেকোর", "বিউটি পণ্য"],
  features: [
    "দ্রুত ডেলিভারি (ঢাকায় ২৪ ঘন্টা)",
    "নগদে পেমেন্ট",
    "বিনামূল্যে রিটার্ন পলিসি",
    "১০০% অরিজিনাল পণ্য",
    "কাস্টমাইজেশন সুবিধা"
  ],
  contact: {
    whatsapp: WHATSAPP_NUMBER,
    support: "২৪/৭ কাস্টমার সাপোর্ট",
    delivery: "ঢাকা: ৮০ টাকা, ঢাকার বাইরে: ৮০-১২০ টাকা"
  },
  policies: {
    return: "৭ দিনের মধ্যে রিটার্ন",
    warranty: "১ বছর ওয়ারেন্টি",
    payment: "বিকাশ, নগদ, ক্যাশ অন ডেলিভারি"
  }
};

export default function EnhancedAIChatbot({ onProductSelect }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `আসসালামু আলাইকুম! 🌟 আমি ${BUSINESS_DATA.name} এর AI সহায়ক। 

আমি আপনাকে সাহায্য করতে পারি:
• পণ্য খুঁজে দিতে এবং সুপারিশ করতে
• অর্ডার প্রক্রিয়ায় গাইড করতে
• ডেলিভারি ও পেমেন্ট সম্পর্কে তথ্য দিতে
• কাস্টমাইজেশন সহায়তা করতে
• গিফট আইটেম নির্বাচনে সাহায্য করতে
• বাংলাদেশের যেকোনো বিষয়ে আলোচনা করতে

কী খুঁজছেন? 🛍️`,
      timestamp: new Date().toLocaleTimeString('bn-BD')
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Get products for search functionality
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    staleTime: 1000 * 60 * 5,
  });

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'bn-BD';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.8;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          businessData: BUSINESS_DATA,
          products: products.slice(0, 20), // Send sample products
          chatHistory: messages.slice(-6)
        })
      });

      if (!response.ok) throw new Error('AI response failed');
      
      const data = await response.json();
      return data.reply || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না। অনুগ্রহ করে আবার চেষ্টা করুন।";
    } catch (error) {
      console.error('AI Chat Error:', error);
      return generateFallbackResponse(userMessage);
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('পণ্য') || message.includes('product') || message.includes('আইটেম')) {
      const randomProducts = products.slice(0, 3);
      return `আমাদের জনপ্রিয় পণ্য:\n${randomProducts.map(p => `• ${p.name} - ${formatPrice(Number(p.price))}`).join('\n')}\n\nআরো দেখতে "সব পণ্য" বলুন।`;
    }
    
    if (message.includes('ডেলিভারি') || message.includes('delivery')) {
      return `📦 ডেলিভারি তথ্য:\n• ঢাকায়: ৮০ টাকা (২৪ ঘন্টা)\n• ঢাকার বাইরে: ৮০-১২০ টাকা (২-৩ দিন)\n• বিনামূল্যে রিটার্ন ৭ দিনের মধ্যে`;
    }
    
    if (message.includes('পেমেন্ট') || message.includes('payment')) {
      return `💳 পেমেন্ট পদ্ধতি:\n• বিকাশ/নগদ\n• ক্যাশ অন ডেলিভারি\n• অনলাইন পেমেন্ট\n\nসবগুলো নিরাপদ ও সুবিধাজনক!`;
    }
    
    if (message.includes('যোগাযোগ') || message.includes('contact')) {
      return `📞 যোগাযোগ:\n• হোয়াটসঅ্যাপ: ${WHATSAPP_NUMBER}\n• ২৪/৭ কাস্টমার সাপোর্ট\n• তাৎক্ষণিক সহায়তার জন্য কল করুন`;
    }
    
    return `ধন্যবাদ! আমি ${BUSINESS_DATA.name} এর AI সহায়ক। আপনি চাইলে:\n\n• "পণ্য দেখান" - সব পণ্য দেখতে\n• "ডেলিভারি" - ডেলিভারি তথ্য\n• "পেমেন্ট" - পেমেন্ট পদ্ধতি\n• "যোগাযোগ" - কাস্টমার সাপোর্ট\n\nবলুন, আর আমি সাহায্য করব! 😊`;
  };

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
      const aiReply = await getAIResponse(inputMessage);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date().toLocaleTimeString('bn-BD')
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Auto-speak response if not too long
      if (aiReply.length < 200) {
        setTimeout(() => speakMessage(aiReply), 500);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'দুঃখিত, কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
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

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 shadow-xl animate-pulse"
        size="lg"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-6 right-6 z-50 w-80 md:w-96 bg-white shadow-2xl border-0 transition-all duration-300 ${
      isMinimized ? 'h-16' : 'h-96'
    }`}>
      <CardHeader className="p-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <CardTitle className="text-sm font-semibold">Trynex AI সহায়ক</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="p-0 flex flex-col h-80">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="আপনার প্রশ্ন লিখুন..."
                  className="pr-20"
                  disabled={isLoading}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isListening ? stopListening : startListening}
                    className="p-1 h-auto text-gray-500 hover:text-primary"
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isSpeaking ? stopSpeaking : () => {}}
                    className="p-1 h-auto text-gray-500 hover:text-primary"
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}