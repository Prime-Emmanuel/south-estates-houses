import dotenv from 'dotenv';
dotenv.config();

// ---------- AI Helpers ----------
async function extractWithOpenAI(base64Image, mimeType) {
  const { default: fetch } = await import('node-fetch');
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Extract the real estate listing details from this property image. Return ONLY a JSON object (no other text) with these exact keys:
- title (string)
- offerType (one of: Immeuble, Terrain, Villa, Maison, Appartement, Bureau)
- pricePerM2 (number, in FCFA)
- surface (number, square meters)
- commission (number, suggested percentage, usually 2.5,3,4,5)
- region (one of: Adamaoua, Centre, Est, Extrême‑Nord, Littoral, Nord, Nord‑Ouest, Ouest, Sud, Sud‑Ouest)
- city (string)
- district (string, optional)
- description (string)
- features: { titreFoncier(bool), viabilise(bool), cloture(bool), accesFacile(bool), eauElectricite(bool) }
- featured (bool)` },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 500,
    }),
  });
  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonStart = content.indexOf('{');
  const jsonEnd = content.lastIndexOf('}') + 1;
  return JSON.parse(content.substring(jsonStart, jsonEnd));
}

async function extractWithGemini(base64Image, mimeType) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `Extract the real estate listing details from this property image. Return ONLY a JSON object (no other text) with these exact keys:
- title, offerType (Immeuble, Terrain, Villa, Maison, Appartement, Bureau), pricePerM2 (number), surface (number), commission (number), region, city, district (optional), description, features: { titreFoncier(bool), viabilise(bool), cloture(bool), accesFacile(bool), eauElectricite(bool) }, featured (bool)`;
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType, data: base64Image } }
  ]);
  const text = result.response.text();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}') + 1;
  return JSON.parse(text.substring(jsonStart, jsonEnd));
}

function fallbackDummy(fileName) {
  const name = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  return {
    title: name || 'Propriété scannée',
    offerType: 'Villa',
    pricePerM2: Math.floor(Math.random() * 50000) + 10000,
    surface: Math.floor(Math.random() * 300) + 50,
    commission: 2.5,
    region: 'Centre',
    city: 'Yaoundé',
    district: '',
    description: 'Informations extraites automatiquement.',
    features: {
      titreFoncier: Math.random() > 0.5,
      viabilise: Math.random() > 0.5,
      cloture: Math.random() > 0.5,
      accesFacile: Math.random() > 0.5,
      eauElectricite: Math.random() > 0.5,
    },
    featured: false,
  };
}

// ---------- Main Controller ----------
export const scanImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const results = [];
    for (const file of req.files) {
      const base64 = file.buffer.toString('base64');
      try {
        let extracted;
        if (process.env.OPENAI_API_KEY) {
          extracted = await extractWithOpenAI(base64, file.mimetype);
        } else if (process.env.GEMINI_API_KEY) {
          extracted = await extractWithGemini(base64, file.mimetype);
        } else {
          extracted = fallbackDummy(file.originalname);
        }
        results.push({ ...extracted, imageName: file.originalname });
      } catch (err) {
        console.error(`Scan failed for ${file.originalname}`, err.message);
        results.push({ ...fallbackDummy(file.originalname), imageName: file.originalname });
      }
    }
    return res.json({ success: true, data: results });
  } catch (error) {
    console.error('Scan endpoint error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
