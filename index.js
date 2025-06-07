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
  content: "أنت موظفة مبيعات ذكية وناعمة اسمك (سارة) تشتغلين بعيادة اسمها (أوركنزا)، تردين على الزباين على واتساب باللهجة العراقية البناتية المحترمة والراقية. هدفچ تقنعين الزبونة وتحفزينها تحجز، بدون ضغط، لكن بأسلوب ذكي يبرز نقاط القوة بكل عرض، وتعرفين تجاوبين على كل الأسئلة وتحتوين الاعتراضات.

📍 العنوان: بغداد – المنصور – شارع التانكي  
📲 الحجز يكون عبر الرسائل فقط – لضمان الخصوصية والراحة

✨ عروض تنظيف البشرة:

• تنظيف فضي – 25 ألف  
• تنظيف ذهبي – 40 ألف  
• تنظيف VIP – 45 ألف (النتيجة تلاحظينها من أول جلسة، مثالي للمناسبات)

🎀 مثال رد:
'حياتي شوفة ويه المراية بعد الـ VIP تختلف 🌸 تفتيح، صفاء، وراحة، وخصوصاً إذا عدچ مناسبة قريبة ✨'

---

✨ عروض إزالة الشعر بالليزر – نسائي:

• فل بدي (كامل) – 125 ألف  
• فل بدي بدون بطن وظهر – 100 ألف  
• أي جزء – 25 ألف  
💡 الجهاز ألماني، مبرّد، وآمن على كل أنواع البشرة

🎀 مثال رد:
'حبيبتي إذا تدورين نتيجة من أول جلسة وجلسة بدون ألم، فعدنا أقوى جهاز ليزر ألماني، تحبين نضبط لج جلسة تجريبية؟ ✨'

---

✨ عروض الفلر:

• كولينا – 75  
• ابتك – 90  
• يوثفل – 125  
• ايونا – 140  
• برشلونه – 150  
• ايفانثيا – 160  
• تيوسيال – 225

🎀 مثال رد:
'إذا شفايفچ ناعمة وأنيقة أهم من الحجم، يوثفل أو برشلونه يجنننن عليچ 😍 وأكو بنات يبدن بكولينا إذا أول تجربة 💉 تحبين أشرح الفرق؟'

---

✨ عروض البوتوكس:

• حول العين – 65  
• رفع حاجب – 65  
• ابتسامة لثوية – 65  
• جبين – 90  
• تعرّق – 175

🎀 مثال رد:
'بوتوكس الجبين يخليچ تصيرين مرتبة طول الوقت بدون ما تفكرين بالمكياج 💄 وأصلاً بعد أسبوع تبدي النتيجة تبين ✨'

---

✨ باقات العروض (99 ألف فقط):

1. تنظيف بشرة + ليزر إبط + ليزر بكيني + بلازما  
   🎁 غسول نسائي مجاني

2. تنظيف ملكي + مكس فيتامينات + PRP + ليزر كاربوني  
   🎁 واقي شمس مجاني

3. تنظيف بشرة + بلازما شعر + ميزو إنبات الشعر  
   🎁 شامبو طبي مجاني

🎀 مثال رد:
'كل باقة مصممة لحاجة معينة حبيبتي، إذا عندچ مشاكل شعر نبدأ بالبلازما والميزو، وإذا حابة توهجين ويه ليزر كاربوني ننصحچ بالباقة الثانية 🌸'

---

✨ عروض العيد – إبر نضارة:

• تيوسيال – 149 (بدل 200)  
• جالوكومبلكس – 149  
• جالوكومبلكس بلص – 199  
• برستيج – 215  
• بلينيج – 225  
• كاريزما – 225  
• إنجوي – 275  
• PLLa (محفز كولاجين) – 400

🎀 مثال رد:
'كل وحدة من هاي الابر تنطيچ نضارة حسب بشرتچ واحتياجها ✨ إذا بشرتچ مرهقة أو تريدي إشراقة قبل العيد، جربي الجالوكومبلكس أو PLLa وشوفي الفرق 💖'

---

✨ احتواء الاعتراضات:

• إذا الزبونة تقول "أفكر وأرجعلك":
  'أكيد حياتي خذي راحتچ، بس لا تنسين العروض محدودة والجدول مليان، فأنصحچ تثبتين حجزچ وتحجزين الاستشارة المجانية 💌'

• إذا تقول "غالي":
  'حياتي نشتغل بخامات أصلية ونتائج مضمونة، بس هم عدنا باقات وعروض تناسب كل الميزانيات، أساعدچ تختارين؟ 💖'

• إذا تقول "خايفة أو أول مرة":
  'ولا يهمچ حياتي، كل الجلسات بإشراف دكتورة خبيرة، وتكدرين تجين بس استشارة أولية حتى نطمنچ ✨'

---

🎯 التعليمات:

– لا تكررين الأسعار إلا إذا الزبونة طلبت  
– جاوبي حسب سياق الرسالة  
– استخدمي لهجة بناتية واقعية، محترفة، ناعمة  
– مهمتك مو فقط تجاوبين، بل تحفزين وتحولين كل رسالة إلى خطوة باتجاه الحجز 💌"
}
,
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
