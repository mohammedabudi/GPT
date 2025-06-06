require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

// متغيرات البيئة
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(bodyParser.json());

// ✅ Webhook Verification (تحقق فيسبوك)
app.get('/webhook', (req, res) => {
  const verify_token = "clinic2025";
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verify_token) {
    console.log("✅ Webhook تم التحقق منه");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ توليد الرد من GPT بصيغة موظفة مبيعات ناعمة
async function getGPTReply(userText) {
  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `أنت موظفة استقبال وخدمة زبائن اسمك "سارة" في عيادة أوركنزا، عيادة تجميل فاخرة في الجادرية. 
تتحدثين باللهجة العراقية البناتية بأسلوب ناعم، أنيق، مقنع وودود، بدون مبالغة. 

مهمتك الأساسية:
1. الرد على استفسارات الزبونة بكل حب وصبر.
2. شرح الخدمات بطريقة مبسطة ومغرية.
3. تسهيل الحجز وإقناع الزبونة إن تجرب الخدمة لأنها راح ترتاح وتنبهر.

أهدافك:
- تخلي الزبونة تحس بالثقة والاهتمام.
- تبرزين فخامة الشغل وتفاصيل النتيجة.
- تستخدمين جمل واقعية وقريبة من قلب البنات.

لو الزبونة:
- سألت عن السعر → جاوبي ويّاه قيمة الخدمة.
- سألت عن الحجز → اسأليها اسمها ورقمها وجدولها، وثبتي الموعد.
- سألت عن النتائج → قولي شنو تبين من أول جلسة، وشوكت يكتمل التحسّن.
- طلبت مقارنة أو عندها تردد → طمنّيها باحتراف واثبتي جودة شغلك.

ابتعدي عن الردود الميكانيكية. خلي ردچ واقعي، دافي، فيه لمسة أنوثة.

لا تنهي أي محادثة بدون ما تسألي:  
"تحبين أحجز لج موعد حبي؟ 💌"
`
        },
        {
          role: "user",
          content: userText
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ خطأ من OpenAI:", error.response?.data || error.message);
    return "آسفة حبي 🌸 صار خلل مؤقت، جربي ترسلين سؤالك مرة ثانية بعد شوي 💌";
  }
}

// ✅ استقبال الرسائل من واتساب والرد عليها
app.post('/webhook', async (req, res) => {
  const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (message && message.text && message.from) {
    const userText = message.text.body;
    const phoneNumber = message.from;

    const replyText = await getGPTReply(userText);

    try {
      await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
        messaging_product: "whatsapp",
        to: phoneNumber,
        text: { body: replyText }
      }, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      res.sendStatus(200);
    } catch (err) {
      console.error("❌ فشل بالإرسال إلى واتساب:", err.response?.data || err.message);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

// ✅ فحص جاهزية البوت
app.get('/', (req, res) => {
  res.send("بوت أوركنزا شغّال باستخدام OpenAI 💅✨");
});

// ✅ تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`🚀 البوت يعمل على البورت ${PORT}`);
});
