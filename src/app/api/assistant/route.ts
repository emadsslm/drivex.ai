import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'المفتاح السري OPENROUTER_API_KEY غير مضاف في إعدادات Vercel' }, { status: 500 });
    }

    // الاتصال المباشر بخادم OpenRouter بأمان كامل
    const response = await fetch('https://openrouter.ai', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct:free', // يمكنك تغيير الموديل حسب رغبتك
        messages: [
          { role: 'system', content: 'أنت مساعد قيادة ذكي ومحترف لتطبيق DriveX AI. يجب أن تتحدث وتجيب دائماً باللغة العربية الفصحى بشكل واضح ومختصر لتناسب السائق أثناء القيادة.' },
          { role: 'user', content: message }
        ],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'معذرة، لم أتمكن من معالجة الرد حالياً.';

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ في السيرفر أثناء معالجة الطلب.' }, { status: 500 });
  }
}

