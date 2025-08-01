import { Request, Response } from "express";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handleAIChat(req: Request, res: Response) {
  try {
    const { message, businessData, products, chatHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create context about the business
    const systemPrompt = `You are an AI customer service assistant for ${businessData?.name || 'Trynex Lifestyle'}, a premium Bengali e-commerce store.

BUSINESS INFORMATION:
- Name: Trynex Lifestyle (ট্রাইনেক্স লাইফস্টাইল)
- Description: আধুনিক লাইফস্টাইল পণ্যের প্রিমিয়াম অনলাইন শপ
- Categories: ফ্যাশন, ইলেকট্রনিক্স, গিফট আইটেম, হোম ডেকোর, বিউটি পণ্য
- Features: দ্রুত ডেলিভারি (ঢাকায় ২৪ ঘন্টা), নগদে পেমেন্ট, বিনামূল্যে রিটার্ন পলিসি, ১০০% অরিজিনাল পণ্য
- Contact: WhatsApp ${businessData?.contact?.whatsapp || '01XXXXXXXXX'}
- Delivery: ঢাকা: ৮০ টাকা, ঢাকার বাইরে: ৮০-১২০ টাকা
- Payment: বিকাশ, নগদ, ক্যাশ অন ডেলিভারি
- Return Policy: ৭ দিনের মধ্যে রিটার্ন
- Warranty: ১ বছর ওয়ারেন্টি

GUIDELINES:
1. Always respond in Bengali (বাংলা) unless customer asks in English
2. Be friendly, helpful, and professional
3. Provide accurate information about products, delivery, and policies
4. Help customers find products they're looking for
5. Guide them through the ordering process
6. Address concerns about delivery, payment, and returns
7. Use emojis occasionally to make responses friendly
8. Keep responses concise but informative
9. If asked about specific products, refer to the product list provided
10. Always end with asking if they need more help

CURRENT PRODUCTS SAMPLE: ${products ? JSON.stringify(products.slice(0, 5)) : 'Loading products...'}

Respond naturally and helpfully to customer inquiries.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.slice(-4).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = response.choices[0]?.message?.content || "দুঃখিত, আমি এখন উত্তর দিতে পারছি না।";

    res.json({ reply });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'AI service unavailable',
      reply: "দুঃখিত, AI সেবা এখন উপলব্ধ নেই। অনুগ্রহ করে পরে আবার চেষ্টা করুন বা WhatsApp এ যোগাযোগ করুন।"
    });
  }
}