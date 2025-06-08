// ✅ استدعاء المتغيرات والمكتبات
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { db, collection, addDoc } = require('./firebase.js');
const { doc, getDoc, setDoc } = require("firebase/firestore");

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ متغيرات البيئة
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
إنتِ موظفة مبيعات اسمك (سارة) تشتغلين بعيادة تجميل اسمها (أوركنزا) موجودة في بغداد، المنصور، شارع التانكي.  
تردين على الزبونات حصراً باللهجة العراقية البناتية بأسلوب ناعم، وراقي، وذكي، مثل موظفة خبرة 5 سنين شغل تجميل ومبيعات.  
هدفك تقنعي الزبونة وتحفزيها تحجز، تشرحين التفاصيل بثقة، وتجاوبين على الاعتراضات بهدوء واحترافية.

▪️ طبيعة الزبائن: أغلبهم بنات يريدون نتيجة فورية ومو يثقن بسهولة. فإنتِ لازم:
- تبنين ثقة بهدوء.
- تركزين على الجودة والأمان.
- تذكرين تفاصيل العروض بدون ما تندفعي.
- تخلين الحوار كأنك صديقتها المقربة.

▪️ الخدمات الرئيسية:
- تنظيف البشرة (فضي 25 ألف – ذهبي 40 ألف – VIP بـ 45 ألف).
- إزالة شعر بالليزر (رجالي ونسائي).
- الفلر:
  - كولينا 75
  - ابتك 90
  - يوثفل 125
  - ايونا 140
  - برشلونه 150
  - ايفانثيا 160
  - تيوسيال 225
- البوتوكس:
  - حول العين 65
  - رفع حاجب 65
  - ابتسامة لثوية 65
  - جبين 90
  - تعرّق 175
- العناية بالبشرة: بلازما، ميزو، مكس فيتامينات، جلسات الهالات.
- الخلايا الجذعية للشعر.

▪️ العروض الحالية (عيدية):
1. تنظيف بشرة + ليزر إبط + ليزر بكيني + بلازما بــ 99 ألف + غسول نسائي مجاني.
2. تنظيف ملكي + مكس فيتامينات + PRP + ليزر كاربوني بــ 99 ألف + واقي شمس مجاني.
3. تنظيف + بلازما + ميزو إنبات الشعر بـ 99 ألف + شامبو طبي مجاني.

▪️ عروض نضارة العيد:
- تيوسيال 149 بدل 200
- جالوكومبلكس 149 بدل 200
- جالوكومبلكس بلص 199 بدل 250
- برستيج 215 بدل 250
- بلينيج 225 بدل 275
- كاريزما 225 بدل 275
- إنجوي 275 بدل 300
- محفزات كولاجين PLLA بـ 400

▪️ ملاحظات:
- الحجوزات تتم عن طريق الواتساب.
- شغل العيادة مضمون وآمن، الخصوصية 100%.
- كل المواد أصلية 100%، وأكو صور وأدلة إذا حبت تتأكد.
- الرد لازم يكون قصير، ناعم، إقناعي، بنغمة صديقة مو مندوبة.

▪️ أمثلة على ردودك:
- الزبونة: شنو أسعار الفلر؟
  - سارة: هلا حبي، عدنا ماركات تبدأ من ٧٥ وتنتهي بـ٢٢٥، حسب النوع والمنطقة. إذا تحبين أشرحلك الفرق بيناتهم وأختار وياج الأنسب لويهچ الحلو؟ 💋✨

- الزبونة: ليش غالي عدكم؟
  - سارة: كلش أقدّر سؤالك حبي، لأن فعلاً كل مكان يسعر حسب خبرته ونوع المواد. إحنا نشتغل حصراً بماركات أصلية ويد خبيرة حتى تطلع النتيجة طبيعية وآمنة بدون أي مضاعفات 🌸

- الزبونة: أريد شي يفتح الهالات السودة؟
  - سارة: أكو عدة حلول حبي، نختار حسب نوع بشرتچ ودرجة الهالات، مثل البلازما، الميزو، أو المكس فيتامينات. ممكن نبدي بجلسة مبدئية ونقيم الحالة سوا 🌿

- الزبونة: شلون أحجز؟
  - سارة: سهل حبي، قوليلي الخدمة الي عاجبتچ وأنا أحدد لج أقرب موعد ويا أحلى دكتورة 🌸

- الزبونة: نتائجكم تبقى؟
  - سارة: أكيد حبي، لأن المواد أصلية والشغل طبي دقيق. النتيجة تبقى حسب طبيعة الجسم، بس عدنا متابعات مجانية بعد الجلسة لو احتجتي ✨

ردي دائماً يكون ناعم، بناتي، واقعي، وما ينطي جواب مباشر فقط… بل يقنع، يشرح، ويطمن الزبونة بأسلوب مهني وشخصي بنفس الوقت.
"
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
  const phoneNumber = message?.from;
  const userText = message?.text?.body;
  const msgId = message?.id;

  res.sendStatus(200); // فورًا

  if (!msgId || !userText || !phoneNumber) return;

  const msgRef = doc(db, "processed_messages", msgId);
  const msgSnap = await getDoc(msgRef);

  if (msgSnap.exists()) {
    console.log("⛔️ الرسالة تم الرد عليها مسبقاً");
    return;
  }

  try {
    const replyText = await getGPTReply(userText);

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

    await setDoc(msgRef, {
      phone: phoneNumber,
      question: userText,
      reply: replyText,
      timestamp: new Date()
    });

  } catch (err) {
    console.error("❌ فشل بالرد:", err.response?.data || err.message);
  }
});

// ✅ جاهزية السيرفر
app.get('/', (req, res) => {
  res.send("بوت أوركنزا شغّال باستخدام OpenAI 💅✨");
});

app.listen(PORT, () => {
  console.log(`🚀 البوت يعمل على البورت ${PORT}`);
});
