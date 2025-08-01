import OpenAI from "openai";
import type { Product } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  message: string;
  products?: Product[];
  searchResults?: Product[];
  action?: 'search' | 'recommend' | 'info' | 'order_help';
}

export class AIChatbot {
  private systemPrompt = `আপনি Trynex Lifestyle এর AI সহায়ক। আপনার নাম "ট্রাইনেক্স এআই"। আপনি একটি বাংলা ই-কমার্স ওয়েবসাইটের গ্রাহক সেবা প্রতিনিধি।

আপনার কাজ:
1. গ্রাহকদের পণ্য খুঁজে দিতে সাহায্য করা
2. পণ্যের বিস্তারিত তথ্য দেওয়া
3. অর্ডার প্রক্রিয়া সম্পর্কে সাহায্য করা
4. ডেলিভারি ও পেমেন্ট সম্পর্কে তথ্য দেওয়া
5. পণ্যের সুপারিশ করা

গুরুত্বপূর্ণ তথ্য:
- কোম্পানি: Trynex Lifestyle
- ডেলিভারি চার্জ: ঢাকায় ৮০ টাকা, ঢাকার বাইরে ৮০-১২০ টাকা
- পেমেন্ট: bKash, Nagad, ক্যাশ অন ডেলিভারি
- হোয়াটসঅ্যাপ: +8801648534981
- ডেলিভারি সময়: ঢাকায় ১-২ দিন, বাইরে ২-৩ দিন

সবসময় বাংলায় উত্তর দিন। বিনয়ী এবং সহায়ক হন। পণ্য খোঁজার জন্য অনুরোধ করলে JSON ফরম্যাটে response দিন।`;

  async generateResponse(
    message: string, 
    products: Product[] = [], 
    chatHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    try {
      // Detect if user is searching for products
      const isProductSearch = this.detectProductSearch(message);
      
      if (isProductSearch) {
        const searchResults = this.searchProducts(message, products);
        const response = await this.generateSearchResponse(message, searchResults);
        
        return {
          message: response,
          searchResults,
          action: 'search'
        };
      }

      // Regular conversation
      const conversation = [
        { role: 'system' as const, content: this.systemPrompt },
        ...chatHistory.slice(-6), // Keep last 6 messages for context
        { role: 'user' as const, content: message }
      ];

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: conversation,
        max_tokens: 500,
        temperature: 0.7,
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"message": "দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।"}');
      
      return {
        message: result.message || "কীভাবে সাহায্য করতে পারি?",
        action: result.action || 'info'
      };

    } catch (error) {
      console.error('AI Chatbot Error:', error);
      return {
        message: "দুঃখিত, একটি সমস্যা হয়েছে। আবার চেষ্টা করুন বা হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।",
        action: 'info'
      };
    }
  }

  private detectProductSearch(message: string): boolean {
    const searchKeywords = [
      'খুঁজছি', 'চাই', 'দেখাও', 'আছে কি', 'পণ্য', 'প্রোডাক্ট',
      'গিফট', 'উপহার', 'কিনতে', 'search', 'find', 'show', 'product'
    ];
    
    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private searchProducts(query: string, products: Product[]): Product[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return products.filter(product => {
      const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    }).slice(0, 5); // Return top 5 results
  }

  private async generateSearchResponse(query: string, products: Product[]): Promise<string> {
    if (products.length === 0) {
      return "দুঃখিত, আপনার খোঁজা পণ্য খুঁজে পাইনি। অন্য কোনো কীওয়ার্ড দিয়ে চেষ্টা করুন বা হোয়াটসঅ্যাপে (+8801648534981) যোগাযোগ করুন।";
    }

    const productList = products.map(p => `• ${p.name} - ${p.price}৳`).join('\n');
    
    return `আপনার জন্য ${products.length}টি পণ্য পেয়েছি:\n\n${productList}\n\nবিস্তারিত দেখতে পণ্যের উপর ক্লিক করুন বা আরো জানতে চাইলে জিজ্ঞাসা করুন।`;
  }

  async getSmartRecommendations(userInterests: string[], products: Product[]): Promise<Product[]> {
    try {
      const prompt = `Based on these user interests: ${userInterests.join(', ')}, recommend the best products from this list. Return product IDs only as JSON array.`;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: 'system', content: 'You are a product recommendation AI. Analyze user interests and recommend relevant products.' },
          { role: 'user', content: prompt + '\n\nProducts: ' + JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category }))) }
        ],
        max_tokens: 200,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content || '{"recommendations": []}');
      const recommendedIds = result.recommendations || [];
      
      return products.filter(p => recommendedIds.includes(p.id)).slice(0, 4);
    } catch (error) {
      console.error('Smart Recommendations Error:', error);
      return products.slice(0, 4); // Fallback to first 4 products
    }
  }
}