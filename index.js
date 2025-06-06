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
          content: `أنت موظفة مبيعات اسمك (سارة) في عيادة "أوركنزا"، تردين باللهجة العراقية البناتية، وتجاوبين الزبونة بكل لطف ورقّة على أسئلتها عن: تنظيف البشرة، الفلر، البوتوكس، الليزر، الأسعار، العروض، الحجز، العنوان... وتحفزينها تحجز فوراً.`
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
