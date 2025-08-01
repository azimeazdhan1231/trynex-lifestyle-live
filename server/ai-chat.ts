import OpenAI from "openai";
import type { Product } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatRequest {
  message: string;
  businessData: any;
  products: Product[];
  chatHistory: any[];
}

// Enhanced AI chat with full business knowledge
export async function getAIChatResponse(req: ChatRequest): Promise<string> {
  const { message, businessData, products, chatHistory } = req;

  // Build comprehensive context for the AI
  const systemPrompt = `আপনি Trynex Lifestyle এর একজন অভিজ্ঞ ই-কমার্স সহায়ক এবং বাংলাদেশি সংস্কৃতি সম্পর্কে সম্পূর্ণ জ্ঞানী।

ব্যবসায়িক তথ্য:
- কোম্পানি: ${businessData.name}
- বিবরণ: ${businessData.description}
- বিশেষত্ব: ${businessData.features.join(', ')}
- যোগাযোগ: হোয়াটসঅ্যাপ ${businessData.contact.whatsapp}
- ডেলিভারি: ${businessData.contact.delivery}
- পেমেন্ট: ${businessData.policies.payment}
- রিটার্ন পলিসি: ${businessData.policies.return}

আপনার ভূমিকা:
1. গ্রাহকদের পণ্য খুঁজে দিতে এবং সুপারিশ করতে
2. অর্ডার প্রক্রিয়ায় সাহায্য করতে
3. বাংলাদেশের সংস্কৃতি, ঐতিহ্য, উৎসব সম্পর্কে আলোচনা করতে
4. গিফট নির্বাচনে পরামর্শ দিতে
5. যেকোনো সাধারণ প্রশ্নের উত্তর দিতে

নীতিমালা:
- সর্বদা বাংলায় উত্তর দিন
- বন্ধুত্বপূর্ণ এবং সহায়ক টোনে কথা বলুন
- পণ্যের সঠিক তথ্য দিন
- প্রয়োজনে হোয়াটসঅ্যাপে যোগাযোগের পরামর্শ দিন
- বাংলাদেশি সংস্কৃতির সাথে সামঞ্জস্যপূর্ণ পরামর্শ দিন

উপলব্ধ পণ্য (নমুনা):
${products.map(p => `- ${p.name}: ${p.price}৳ (ক্যাটেগরি: ${p.category})`).join('\n')}

গুরুত্বপূর্ণ: আপনি বাংলাদেশের একটি ই-কমার্স প্ল্যাটফর্মের প্রতিনিধি হিসেবে কাজ করছেন। গ্রাহকদের সন্তুষ্ট করা এবং বিক্রয় বাড়ানো আপনার মূল লক্ষ্য।`;

  const conversationContext = chatHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationContext,
        { role: "user", content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      response_format: { type: "text" }
    });

    return response.choices[0].message.content || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}

// Product recommendation system with AI
export async function getAIProductRecommendations(products: Product[], userQuery: string, userBehavior?: any): Promise<Product[]> {
  const systemPrompt = `আপনি একজন পণ্য সুপারিশ বিশেষজ্ঞ। গ্রাহকের প্রয়োজন বুঝে সবচেয়ে উপযুক্ত পণ্যগুলি সুপারিশ করুন।

উপলব্ধ পণ্য:
${products.map(p => `${p.id}: ${p.name} - ${p.price}৳ (${p.category}) - ${p.description || 'বিবরণ নেই'}`).join('\n')}

গ্রাহকের প্রয়োজন: ${userQuery}

কেবলমাত্র পণ্যের ID গুলি JSON array আকারে প্রদান করুন। উদাহরণ: ["id1", "id2", "id3"]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{"ids": []}');
    const recommendedIds = result.ids || result.products || [];
    
    return products.filter(p => recommendedIds.includes(p.id));
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    // Fallback to smart filtering
    return products
      .filter(p => 
        p.name.toLowerCase().includes(userQuery.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(userQuery.toLowerCase())
      )
      .slice(0, 6);
  }
}