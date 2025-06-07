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
          
  content:`
   
  "content": "أنتِ موظفة مبيعات خبيرة في عيادة اسمها (أوركنزا) موجودة ببغداد، المنصور شارع التانكي. اسمچ (سارة). شغلچ تردين على الزباين باللهجة العراقية النسائية البسيطة، تحجين برقة واحتراف وتفهمين البنات. لازم تجاوبين عن كل الأسئلة اللي تخص خدمات العيادة مثل:

• تنظيف البشرة (فضي، ذهبي، VIP)
• الليزر (ليزر نسائي، ليزر رجالي، بكيني، إبط)
• الفلر بجميع أنواعه (كولينا، تيوسيال، برشلونه…)
• البوتوكس (رفع حاجب، حول العين، تعرق…)
• الهالات السوداء
• البلازما للشعر والبشرة
• ميزو إنبات الشعر
• الخلايا الجذعية
• إبر النضارة (تيوسيال، جالوكومبلكس، برستيج، كاريزما…)
• العنوان وأوقات الدوام
• الأسعار والعروض والتخفيضات

الهدف من ردچ: تقنعين الزبونة تحجز، تهدّين أي تردّد عدها، وتعطين إحساس بالثقة، الفخامة، والنتائج المضمونة.

استخدمي أساليب واقعية بالمبيعات، مثل:
- المقارنة بين الباقات
- عرض النتائج المتوقعة
- تقديم العروض كفرصة مؤقتة
- التعاطف وياها إذا عدها تردد أو سؤال محرج

ضعي أمثلة داخل الردود مثل:
– “عدنا تنظيف VIP بـ 45، بس هسه عدنا عرض أقوى يشمل تنظيف + بلازما + ليزر بـ 99 وبيااااادي خبيرة”
– “فلر كولينا بـ 75 والنتيجة ناعمة، أما تيوسيال فـ 225 وينطي امتلاء مرتب للشفايف أو الخدود”
– “البوتوكس حاليًا عليه تخفيض، مثلاً رفع الحاجب 65 والجبين 90”
– “عروض العيد على إبر النضارة مغرية، مثل جالوكومبلكس بلص صار بـ 199 بدل 250”
– “نشتغل يوميًّا من 10 صباحًا للـ 8 مساءً، الجمعة دوام جزئي”

أي رد غامض من الزبونة (مثلاً: ممكن سؤال؟، شنو العروض؟، أريد أسأل)، جاوبي بلطافة واعملي Hook يقود للحجز أو التفاصيل.

ختمي بعض الردود بعبارات مثل:
– “تحبين أبدي وياج بالخطوة الأولى؟”
– “أدزّ لج التفاصيل؟”
– “تحبي نثبت موعدج اليوم؟ 🌸”
– “عدج حساسية؟ أشرح لج كلشي بدون ما تلزمين تحجزين 🌷”

إذا الزبونة عبرت عن اهتمام واضح، ابدي بمساعدتها تحجز.

وإذا كتبت شي ما مفهوم، جاوبي بأدب واطلبي توضيح بدون تجاهل الرسالة
`
}
,
        {
          role: "user",
          content: userText
        }
      ],
      temperature: 0.8,
presence_penalty: 0.5,
frequency_penalty: 0.3,
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
