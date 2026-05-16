import { resolveLang } from "./resolve-lang";

export interface MockAnalysisPack {
  categories: {
    medicine: string;
    supplement: string;
    food: string;
    health: string;
  };
  summary: (productName: string) => string;
  simplified: (categoryLabel: string) => string;
  ingredients: Array<{
    name: string;
    amount: string;
    purpose: string;
    riskLevel: "low" | "medium" | "high";
  }>;
  benefits: string[];
  sideEffects: string[];
  avoidIf: string[];
  drugInteractions: string[];
  allergyRisks: string[];
  longTermRisks: string[];
  safeDosageMedicine: string;
  useCases: string[];
  conditions: Array<{ condition: string; suitable: boolean; note: string }>;
  alternatives: string[];
  recommendations: string[];
}

const enPack: MockAnalysisPack = {
  categories: {
    medicine: "Medicine",
    supplement: "Supplement",
    food: "Packaged Food",
    health: "Health Product",
  },
  summary: (name) =>
    `Sentinox AI analyzed "${name}" and identified key compounds, nutritional profile, and safety considerations.`,
  simplified: (cat) =>
    `This product is mainly used for ${cat.toLowerCase()} support. It has helpful ingredients but also some additives that certain people should avoid. Talk to your doctor if you take other medicines or have allergies.`,
  ingredients: [
    { name: "Active Compound A", amount: "250mg", purpose: "Primary therapeutic agent", riskLevel: "low" },
    { name: "Stabilizer B", amount: "50mg", purpose: "Preservation and shelf stability", riskLevel: "low" },
    { name: "Artificial Sweetener X", amount: "15mg", purpose: "Flavor enhancement", riskLevel: "medium" },
    { name: "Color Additive Y", amount: "5mg", purpose: "Visual appearance", riskLevel: "medium" },
  ],
  benefits: [
    "Supports targeted symptom relief when used as directed",
    "Contains bioavailable forms of key nutrients",
    "May improve adherence through palatable formulation",
  ],
  sideEffects: [
    "Mild gastrointestinal discomfort in sensitive individuals",
    "Possible drowsiness at higher doses",
    "Rare skin reactions reported with additive Y",
  ],
  avoidIf: [
    "Pregnant or breastfeeding without medical supervision",
    "Known hypersensitivity to listed excipients",
    "Severe liver or kidney impairment",
    "Children under 12 unless prescribed",
  ],
  drugInteractions: [
    "May potentiate effects of blood thinners — consult physician",
    "Caution with MAO inhibitors and certain antidepressants",
    "Alcohol may increase sedative side effects",
  ],
  allergyRisks: [
    "Contains soy-derived lecithin",
    "Processed in facility handling tree nuts and gluten",
  ],
  longTermRisks: [
    "Chronic use of artificial sweeteners under ongoing research",
    "Regular high-dose use may affect liver enzyme levels — monitor annually",
  ],
  safeDosageMedicine: "Adults: 1-2 units every 8 hours. Max 6 units/24h. Take with food.",
  useCases: [
    "Acute symptom management",
    "Supplemental nutritional support",
    "Post-procedure recovery aid (with approval)",
  ],
  conditions: [
    { condition: "Diabetes", suitable: false, note: "Contains sweeteners affecting glycemic response" },
    { condition: "Hypertension", suitable: true, note: "No sodium-raising agents detected" },
    { condition: "Autoimmune", suitable: false, note: "Consult rheumatologist before use" },
  ],
  alternatives: [
    "Plant-based formulation without artificial additives",
    "Lower-dose pediatric-safe variant",
    "Organic certified equivalent with similar active profile",
  ],
  recommendations: [
    "Log this scan in your health timeline for trend tracking",
    "Enable interaction alerts for medications in your profile",
    "Re-scan after formulation changes on packaging",
  ],
};

const hiPack: MockAnalysisPack = {
  categories: {
    medicine: "दवा",
    supplement: "सप्लीमेंट",
    food: "पैक किया भोजन",
    health: "स्वास्थ्य उत्पाद",
  },
  summary: (name) =>
    `सेंटिनॉक्स AI ने "${name}" का विश्लेषण किया और मुख्य यौगिक, पोषण प्रोफ़ाइल तथा सुरक्षा संबंधी बिंदु पहचाने।`,
  simplified: (cat) =>
    `यह उत्पाद मुख्यतः ${cat} समर्थन के लिए है। इसमें उपयोगी सामग्री है, लेकिन कुछ अतिरिक्त पदार्थ कुछ लोगों के लिए टालने योग्य हो सकते हैं। अन्य दवाएँ या एलर्जी हो तो डॉक्टर से बात करें।`,
  ingredients: [
    { name: "सक्रिय यौगिक A", amount: "250mg", purpose: "मुख्य चिकित्सीय घटक", riskLevel: "low" },
    { name: "स्थिरक B", amount: "50mg", purpose: "संरक्षण और शेल्फ स्थिरता", riskLevel: "low" },
    { name: "कृत्रिम मिठास X", amount: "15mg", purpose: "स्वाद सुधार", riskLevel: "medium" },
    { name: "रंग योजक Y", amount: "5mg", purpose: "दिखावट", riskLevel: "medium" },
  ],
  benefits: [
    "निर्देशानुसार लक्षित लक्षणों में राहत में सहायक",
    "मुख्य पोषक तत्वों के जैव-उपलब्ध रूप",
    "स्वादिष्ट फॉर्म्युलेशन से अनुपालन बेहतर हो सकता है",
  ],
  sideEffects: [
    "संवेदनशील व्यक्तियों में हल्की पाचन असुविधा",
    "अधिक मात्रा पर नींद आना",
    "योजक Y से दुर्लभ त्वचा प्रतिक्रिया",
  ],
  avoidIf: [
    "गर्भवती/स्तनपान बिना चिकित्सक की देखरेख के न लें",
    "सूचीबद्ध सहायक पदार्थों से एलर्जी",
    "गंभीर यकृत या गुर्दे की कमज़ोरी",
    "12 वर्ष से कम बच्चे — केवल प्रिस्क्रिप्शन पर",
  ],
  drugInteractions: [
    "रक्त पतला करने वाली दवाओं के प्रभाव को बढ़ा सकता है — चिकित्सक से पूछें",
    "MAO अवरोधकों और कुछ एंटीडिप्रेसेंट के साथ सावधानी",
    "शराब निद्राजनक दुष्प्रभाव बढ़ा सकती है",
  ],
  allergyRisks: [
    "सोया-व्युत्पन्न लेसिथिन शामिल",
    "ट्री नट और ग्लूटेन वाली सुविधा में प्रसंस्कृत",
  ],
  longTermRisks: [
    "कृत्रिम मिठास के दीर्घकालिक उपयोग पर शोध जारी",
    "नियमित अधिक खुराक यकृत एंजाइम प्रभावित कर सकती है — वार्षिक जाँच",
  ],
  safeDosageMedicine: "वयस्क: हर 8 घंटे 1-2 इकाई। अधिकतम 6/24 घंटे। भोजन के साथ लें।",
  useCases: [
    "तीव्र लक्षण प्रबंधन",
    "पोषक पूरक समर्थन",
    "प्रक्रिया के बाद सहायता (अनुमति के साथ)",
  ],
  conditions: [
    { condition: "मधुमेह", suitable: false, note: "ग्लाइसेमिक प्रभाव वाले मिठास" },
    { condition: "उच्च रक्तचाप", suitable: true, note: "सोडियम बढ़ाने वाले घटक नहीं मिले" },
    { condition: "ऑटोइम्यून", suitable: false, note: "उपयोग से पहले रुमेटोलॉजिस्ट से सलाह" },
  ],
  alternatives: [
    "कृत्रिम योजक रहित प्लांट-आधारित फॉर्म्युलेशन",
    "कम खुराक बाल-सुरक्षित विकल्प",
    "समान सक्रिय प्रोफ़ाइल वाला ऑर्गेनिक विकल्प",
  ],
  recommendations: [
    "ट्रेंड ट्रैकिंग के लिए इस स्कैन को स्वास्थ्य टाइमलाइन में सहेजें",
    "प्रोफ़ाइल की दवाओं के लिए इंटरैक्शन अलर्ट चालू करें",
    "पैकेजिंग बदलने पर दोबारा स्कैन करें",
  ],
};

const PACKS: Record<string, MockAnalysisPack> = {
  en: enPack,
  hi: hiPack,
  bn: { ...hiPack, categories: { ...hiPack.categories, medicine: "ওষুধ", food: "প্যাকেটজাত খাবার" }, summary: (n) => `Sentinox AI "${n}" বিশ্লেষণ করেছে এবং মূল যৌগ ও নিরাপত্তা চিহ্নিত করেছে।` },
  ta: { ...hiPack, categories: { medicine: "மருந்து", supplement: "சத்து மாத்திரை", food: "பொதிந்த உணவு", health: "சுகாதார பொருள்" }, summary: (n) => `Sentinox AI "${n}" பகுப்பாய்வு செய்து முக்கிய கூறுகளை கண்டறிந்தது.` },
  te: { ...hiPack, categories: { medicine: "మందు", supplement: "సప్లిమెంట్", food: "ప్యాక్ చేసిన ఆహారం", health: "ఆరోగ్య ఉత్పత్తి" }, summary: (n) => `Sentinox AI "${n}" విశ్లేషించి ముఖ్య సంయుక్తాలను గుర్తించింది.` },
  mr: { ...hiPack, categories: { medicine: "औषध", supplement: "पूरक", food: "पॅक केलेले अन्न", health: "आरोग्य उत्पादन" } },
  gu: { ...hiPack, categories: { medicine: "દવા", supplement: "સપ્લિમેન્ટ", food: "પેક ખોરાક", health: "આરોગ્ય ઉત્પાદન" } },
  kn: { ...hiPack, categories: { medicine: "ಔಷಧಿ", supplement: "ಪೂರಕ", food: "ಪ್ಯಾಕ್ ಆಹಾರ", health: "ಆರೋಗ್ಯ ಉತ್ಪನ್ನ" } },
  ml: { ...hiPack, categories: { medicine: "മരുന്ന്", supplement: "സപ്ലിമെന്റ്", food: "പാക്ക് ഭക്ഷണം", health: "ആരോഗ്യ ഉൽപ്പന്നം" } },
  pa: { ...hiPack, categories: { medicine: "ਦਵਾਈ", supplement: "ਸਪਲੀਮੈਂਟ", food: "ਪੈਕ ਭੋਜਨ", health: "ਸਿਹਤ ਉਤਪਾਦ" } },
  or: { ...hiPack, categories: { medicine: "ଔଷଧ", supplement: "ସପ୍ଲିମେଣ୍ଟ", food: "ପ୍ୟାକ୍ ଖାଦ୍ୟ", health: "ସ୍ୱାସ୍ଥ୍ୟ ଉତ୍ପାଦ" } },
  as: { ...hiPack, categories: { medicine: "ঔষধ", supplement: "সপ্লিমেন্ট", food: "পেকেজ খাদ্য", health: "স্বাস্থ্য সামগ্ৰী" } },
  ur: { ...hiPack, categories: { medicine: "دوا", supplement: "سپلیمنٹ", food: "پیک شدہ غذا", health: "صحت کی مصنوعات" } },
  es: {
    ...enPack,
    categories: { medicine: "Medicamento", supplement: "Suplemento", food: "Alimento envasado", health: "Producto de salud" },
    summary: (n) => `Sentinox AI analizó "${n}" e identificó compuestos clave y consideraciones de seguridad.`,
    simplified: (c) => `Este producto se usa principalmente para apoyo de ${c.toLowerCase()}. Consulte a su médico si toma otros medicamentos.`,
    benefits: ["Alivia síntomas cuando se usa según indicación", "Nutrientes biodisponibles", "Formulación palatable"],
    sideEffects: ["Molestias digestivas leves", "Posible somnolencia en dosis altas"],
    avoidIf: ["Embarazo o lactancia sin supervisión médica", "Hipersensibilidad a excipientes"],
    drugInteractions: ["Puede potenciar anticoagulantes — consulte al médico"],
    recommendations: ["Guarde este escaneo en su línea de tiempo de salud"],
  },
  fr: { ...enPack, categories: { medicine: "Médicament", supplement: "Complément", food: "Aliment emballé", health: "Produit de santé" }, summary: (n) => `Sentinox AI a analysé « ${n} » et identifié les composés clés.` },
  de: { ...enPack, categories: { medicine: "Medikament", supplement: "Nahrungsergänzung", food: "Verpacktes Lebensmittel", health: "Gesundheitsprodukt" }, summary: (n) => `Sentinox AI hat „${n}" analysiert und wichtige Inhaltsstoffe erkannt.` },
  ar: { ...enPack, categories: { medicine: "دواء", supplement: "مكمل", food: "طعام معبأ", health: "منتج صحي" }, summary: (n) => `حلل Sentinox AI «${n}» وحدد المركبات الرئيسية.` },
  zh: { ...enPack, categories: { medicine: "药品", supplement: "补充剂", food: "包装食品", health: "健康产品" }, summary: (n) => `Sentinox AI 分析了“${n}”并识别了关键成分与安全注意事项。` },
  ja: { ...enPack, categories: { medicine: "医薬品", supplement: "サプリメント", food: "包装食品", health: "健康製品" }, summary: (n) => `Sentinox AIが「${n}」を分析し、主要成分と安全性を特定しました。` },
  pt: { ...enPack, categories: { medicine: "Medicamento", supplement: "Suplemento", food: "Alimento embalado", health: "Produto de saúde" }, summary: (n) => `O Sentinox AI analisou "${n}" e identificou compostos principais.` },
  ru: { ...enPack, categories: { medicine: "Лекарство", supplement: "Добавка", food: "Упакованная еда", health: "Здоровье продукт" }, summary: (n) => `Sentinox AI проанализировал «${n}» и выявил ключевые соединения.` },
};

export function getAnalysisPack(lang: string): MockAnalysisPack {
  const resolved = resolveLang(lang);
  return PACKS[resolved] ?? PACKS.en;
}
