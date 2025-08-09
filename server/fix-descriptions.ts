import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { products } from '../shared/schema';
import { eq, or, isNull } from 'drizzle-orm';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const defaultDescriptionTemplate = (productName: string, productType: string) => {
  let specificDescription = '';
  
  if (productType.includes('টি-শার্ট')) {
    specificDescription = 'কাস্টম টি-শার্ট ( প্রিমিয়াম কটন) একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে।';
  } else if (productType.includes('মগ')) {
    specificDescription = 'কাস্টম মগ একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে।';
  } else if (productType.includes('বোতল')) {
    specificDescription = 'থার্মোস্টিল বোতল একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে।';
  } else {
    specificDescription = `${productName} একটি উচ্চমানের পণ্য যা আপনার প্রত্যাশা পূরণ করবে।`;
  }

  return `পণ্যের বিবরণ:
${specificDescription} আমাদের সকল পণ্য যত্নসহকারে নির্বাচিত এবং মান নিয়ন্ত্রিত।

ডেলিভারি তথ্য:
• ঢাকায় ডেলিভারি চার্জ: ৮০ টাকা
• ঢাকার বাইরে: ৮০-১৩০ টাকা
• ডেলিভারি সময়: ২-৩ কার্যদিবস
• অগ্রিম পেমেন্ট প্রয়োজন`;
};

export async function fixProductDescriptions() {
  console.log('🔧 Starting to fix product descriptions...');
  
  try {
    // Get all products with null or empty descriptions
    const productsWithoutDescription = await db
      .select()
      .from(products)
      .where(
        or(
          isNull(products.description),
          eq(products.description, ''),
        )
      );

    console.log(`📝 Found ${productsWithoutDescription.length} products without descriptions`);

    // Update each product with proper description
    for (const product of productsWithoutDescription) {
      const newDescription = defaultDescriptionTemplate(product.name, product.name);
      
      await db
        .update(products)
        .set({ description: newDescription })
        .where(eq(products.id, product.id));
        
      console.log(`✅ Updated description for: ${product.name}`);
    }

    console.log('🎉 Successfully fixed all product descriptions');
    return { success: true, updated: productsWithoutDescription.length };
  } catch (error) {
    console.error('❌ Error fixing product descriptions:', error);
    throw error;
  }
}