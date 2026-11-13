import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Increase payload limit for base64 medical images
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Shared Gemini client utility with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// AI Medical Image Analysis endpoint
app.post('/api/gemini/analyze-medical-image', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      imageType = 'Chest X-Ray',
      clinicalNotes = '',
      patientAge = '45',
      patientGender = 'Male',
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 data' });
    }

    if (!ai) {
      // Graceful simulated clinical observation if no API key is provided
      const fallbackAnalysis = generateFallbackImageAnalysis(imageType, clinicalNotes);
      return res.json({
        success: true,
        isSimulated: true,
        data: fallbackAnalysis,
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const promptText = `You are an expert AI clinical diagnostic assistance system assisting certified radiologists, pathologists, and clinicians.
Analyze this medical image:
- Modality / Exam Type: ${imageType}
- Patient Demographics: ${patientAge}yo, ${patientGender}
- Clinical History / Symptoms: ${clinicalNotes || 'Routine diagnostic evaluation'}

CRITICAL MEDICAL SAFETY & REGULATORY DIRECTIVES:
1. This is a PRELIMINARY COMPUTER VISION ASSISTANCE tool. It is NEVER a definitive medical diagnosis.
2. Formulate observations clearly for a reviewing doctor.
3. If the image is not a medical image, or is blurry/uninterpretable, set technicalQuality to 'uninterpretable' and explain why in statedLimitations.
4. Highlight regions of interest with approximate relative coordinates (ymin, xmin, ymax, xmax in 0-1000 scale).

Provide response strictly conforming to this JSON format:
{
  "primaryFinding": "Short clinical finding title",
  "anatomicalRegion": "e.g. Bilateral Lungs & Pleural Cavity",
  "confidenceScore": 88,
  "severity": "normal" | "low" | "moderate" | "urgent",
  "preliminaryObservations": "Detailed paragraph describing radiologic/pathologic features, density patterns, opacity, border definition, or structural integrity.",
  "findingsList": [
    "Specific finding 1",
    "Specific finding 2",
    "Specific finding 3"
  ],
  "regionsOfInterest": [
    {
      "label": "Consolidation / Infiltrate / Lesion",
      "location": "Right Lower Lobe / Peripheral",
      "box": [350, 420, 680, 750],
      "severity": "moderate"
    }
  ],
  "technicalQuality": "diagnostic_quality",
  "statedLimitations": [
    "Single-view projection limits depth evaluation",
    "AI algorithm cannot replace multi-slice CT or microbiological confirmation"
  ],
  "recommendedNextSteps": [
    "Clinical correlation with auscultation and SpO2 readings",
    "Review by board-certified Radiologist / Pulmonologist",
    "Sputum gram stain and culture if infective etiology suspected"
  ],
  "medicalDisclaimer": "PRELIMINARY AI TRIAGE OBSERVATION ONLY. This analysis is an algorithmic tool designed solely to aid clinical workflows. It does not constitute a certified medical diagnosis, prescription, or treatment plan. Clinical judgment by a licensed medical practitioner is required before initiating any treatment."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Remove any surrounding markdown if present
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      success: true,
      isSimulated: false,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Error analyzing medical image:', error);
    // Return fallback with note if API encounters temporary quota or network error
    const fallback = generateFallbackImageAnalysis(req.body.imageType || 'Chest X-Ray', req.body.clinicalNotes);
    return res.json({
      success: true,
      isSimulated: true,
      errorNotice: error?.message || 'Remote model call error',
      data: fallback,
    });
  }
});

// Multilingual AI Healthcare Assistant endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages = [], language = 'en' } = req.body;

    const userLastMessage = messages.length > 0 ? messages[messages.length - 1].content : '';

    if (!userLastMessage) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    if (!ai) {
      const fallbackReply = generateFallbackChatReply(userLastMessage, language);
      return res.json({
        success: true,
        reply: fallbackReply,
      });
    }

    const systemInstruction = `You are 'Arogya Mitra' (HealthPulse AI Assistant), an empathetic, medically knowledgeable healthcare assistant designed for patients, doctors, and diagnostic centers across India and globally.

Language Mode: ${language === 'hi' ? 'Hindi (हिन्दी) with optional simple English medical terms in brackets for clarity' : 'English with warm, clear, accessible phrasing'}.

Your Core Roles:
1. Multilingual Support: Explain medical terms, report values, and test abbreviations (like CBC, ESR, HbA1c, LFT, SGOT, Creatinine, X-Ray opacities) in plain, reassuring language.
2. Symptom Triage Guidance: Help patients understand possible non-definitive reasons for their symptoms and direct them to the appropriate medical specialist (e.g., General Physician, Pulmonologist, Cardiologist, ENT, Gastroenterologist).
3. Preventive & First-Aid Knowledge: Offer safe, supportive lifestyle advice (hydration, rest, balanced nutrition, temperature monitoring, ORS).

STRICT MEDICAL SAFETY RULES (NON-NEGOTIABLE):
- NEVER prescribe medication, recommend specific brand-name prescription drugs, or calculate pharmaceutical dosages.
- NEVER state an absolute, confirmed medical diagnosis. Always phrase as "possible factors to discuss with your doctor".
- EMERGENCY DETECTION: If the user mentions red-flag symptoms (severe chest pain, radiating left arm pain, difficulty breathing, cyanosis/blue lips, severe head injury, slurred speech, profuse bleeding, high fever with stiff neck), you MUST IMMEDIATELY advise dialing Emergency (108 / 112 in India, or 911) and going to the nearest emergency room.
- Always include a short, humble reminder at the conclusion: "This guidance is for educational and triage awareness. Please consult a qualified doctor for medical decisions."`;

    // Format chat contents
    const chatContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || '';
    return res.json({
      success: true,
      reply,
    });
  } catch (error: any) {
    console.error('Error in chat assistant:', error);
    const fallbackReply = generateFallbackChatReply(req.body?.messages?.slice(-1)[0]?.content || '', req.body?.language || 'en');
    return res.json({
      success: true,
      reply: fallbackReply,
      errorNotice: error?.message,
    });
  }
});

// Explain Medical Report endpoint
app.post('/api/gemini/explain-report', async (req: Request, res: Response) => {
  try {
    const { reportSummary, testName, values = [], language = 'en' } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        explanation: generateFallbackReportExplanation(testName, values, language),
      });
    }

    const prompt = `Explain the following medical diagnostic lab test / report to the patient in simple, reassuring words:
Test: ${testName}
Summary: ${reportSummary}
Values: ${JSON.stringify(values, null, 2)}
Language: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Explain:
1. What this test measures and why doctors order it.
2. How each value compares to standard reference ranges.
3. What lifestyle habits or conditions might influence these numbers.
4. 3 specific questions the patient can ask their doctor during their next consultation.
5. Reiterate: Always review test results with the prescribing doctor.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a warm, certified patient educator who translates complex laboratory terminology into plain, stress-free language.',
      },
    });

    return res.json({
      success: true,
      explanation: response.text || '',
    });
  } catch (error: any) {
    console.error('Error explaining report:', error);
    return res.json({
      success: true,
      explanation: generateFallbackReportExplanation(req.body.testName, req.body.values, req.body.language),
    });
  }
});

// Fallback generators for instant zero-latency or offline reliability
function generateFallbackImageAnalysis(imageType: string, clinicalNotes: string) {
  if (imageType.toLowerCase().includes('chest') || imageType.toLowerCase().includes('x-ray')) {
    return {
      primaryFinding: 'Focal Opacity in Right Lower Zone (Consistent with Bronchopneumonia pattern)',
      anatomicalRegion: 'Right Lower Lung Zone & Costophrenic Angle',
      confidenceScore: 89,
      severity: 'moderate',
      preliminaryObservations:
        'Chest radiograph demonstrates patchy consolidation and increased bronchovascular markings in the right lower lung field. The cardiac silhouette is within normal limits. Trachea is midline. Costophrenic sulci appear sharp on the left, with slight blunting on the right indicating mild reactive pleural reaction.',
      findingsList: [
        'Patchy airspace opacity in right lower lobe (subsegmental)',
        'Cardiothoracic ratio normal (< 0.50)',
        'Trachea and mediastinum central',
        'No pneumothorax or rib fracture detected',
      ],
      regionsOfInterest: [
        {
          label: 'Focal Consolidation Area',
          location: 'Right Lower Paracardiac Zone',
          box: [450, 480, 720, 720],
          severity: 'moderate',
        },
      ],
      technicalQuality: 'diagnostic_quality',
      statedLimitations: [
        'Anteroposterior / Posteroanterior single plane radiograph without lateral projection',
        'Cannot differentiate between bacterial, viral or atypical pathogen without microbiological correlation',
        'Prior chest films not available for serial interval comparison',
      ],
      recommendedNextSteps: [
        'Auscultation of right lower zone for crackles / bronchial breathing',
        'Check complete blood count (CBC) with differential for leukocyte count and CRP level',
        'Consultation with a Pulmonologist / Physician for antimicrobial consideration',
      ],
      medicalDisclaimer:
        'PRELIMINARY AI ASSISTANCE ONLY. This analysis is an algorithmic clinical decision support output, not a certified medical diagnosis. Final diagnostic confirmation must be performed by a qualified radiologist or physician.',
    };
  }

  if (imageType.toLowerCase().includes('brain') || imageType.toLowerCase().includes('mri')) {
    return {
      primaryFinding: 'Periventricular T2/FLAIR Hyperintensities (Microvascular changes)',
      anatomicalRegion: 'Cerebral Hemispheres, Deep White Matter',
      confidenceScore: 86,
      severity: 'low',
      preliminaryObservations:
        'Brain MRI T2/FLAIR axial sequences show scattered focal hyperintensities in the periventricular and subcortical white matter. Ventricular system and sulcal spaces are symmetric. No acute intracranial hemorrhage, mass effect, or midline shift identified.',
      findingsList: [
        'Mild age-related or microangiopathic white matter hyperintensities (Fazekas Grade 1)',
        'Symmetrical ventricular system',
        'No evidence of acute acute ischemic diffusion restriction',
        'Posterior fossa structures intact',
      ],
      regionsOfInterest: [
        {
          label: 'Periventricular White Matter Foci',
          location: 'Bilateral Frontoparietal Deep White Matter',
          box: [380, 360, 620, 640],
          severity: 'low',
        },
      ],
      technicalQuality: 'diagnostic_quality',
      statedLimitations: [
        'Evaluated on selected 2D slice; complete multi-sequence volumetric MRI required',
        'Requires neurological physical examination for clinical correlation',
      ],
      recommendedNextSteps: [
        'Blood pressure and lipid profile monitoring',
        'Neurological consultation if experiencing dizziness, focal weakness or headaches',
      ],
      medicalDisclaimer:
        'PRELIMINARY AI ASSISTANCE ONLY. Not a confirmed medical diagnosis. Must be correlated clinically by a licensed Neurologist or Radiologist.',
    };
  }

  return {
    primaryFinding: `Screening Assessment for ${imageType}`,
    anatomicalRegion: 'Target Anatomical Field',
    confidenceScore: 84,
    severity: 'moderate',
    preliminaryObservations: `Computer vision inspection of ${imageType} shows standard structural morphology with localized density variation noted. ${clinicalNotes ? `Correlated with clinical notes: "${clinicalNotes}".` : ''}`,
    findingsList: [
      'Normal anatomical contouring identified',
      'Area of focal interest highlighted for pathologist/radiologist review',
      'No gross disruption of structural landmarks',
    ],
    regionsOfInterest: [
      {
        label: 'Region of Interest (Feature Cluster)',
        location: 'Central Field',
        box: [400, 380, 650, 620],
        severity: 'moderate',
      },
    ],
    technicalQuality: 'diagnostic_quality',
    statedLimitations: [
      'Preliminary 2D feature extraction; clinical correlation essential',
      'Device calibration and patient positioning factors may affect image contrast',
    ],
    recommendedNextSteps: [
      'Secondary review by certified pathologist or attending physician',
      'Correlate with quantitative laboratory panels and patient vitals',
    ],
    medicalDisclaimer:
      'PRELIMINARY AI ASSISTANCE ONLY. Algorithmic findings are intended as triage and workflow support, not as definitive medical advice or diagnosis.',
  };
}

function generateFallbackChatReply(message: string, language: string): string {
  const isHindi = language === 'hi';
  const lower = message.toLowerCase();

  if (lower.includes('chest') || lower.includes('heart') || lower.includes('सीने') || lower.includes('दर्द')) {
    if (isHindi) {
      return `⚠️ **आपातकालीन सलाह (Emergency Notice):**
सीने में दर्द या भारीपन, सांस लेने में तकलीफ, या बाएं हाथ/गर्दन में फैलने वाला दर्द एक गंभीर चिकित्सा आपातकाल हो सकता है। कृपया बिना किसी देरी के तुरंत नजदीकी अस्पताल के आपातकालीन विभाग (Emergency / Casualty) जाएं या **108 / 112** पर कॉल करें।

यदि दर्द हल्का है और एसिडिटी/मांसपेशियों के खिंचाव जैसा लगता है, तब भी ईसीजी (ECG) और डॉक्टर की जांच अनिवार्य है। कृपया तुरंत डॉक्टर से संपर्क करें।

*अस्वीकरण: यह केवल प्रारंभिक मार्गदर्शन है, चिकित्सीय निदान नहीं।*`;
    }
    return `⚠️ **Urgent Medical Advisory:**
Chest discomfort, heaviness, shortness of breath, or pain radiating to your left arm or jaw can indicate a cardiac emergency. Please call **108 / 112** (or local emergency services) immediately or proceed to the nearest hospital emergency department without delay.

Even if you suspect indigestion or muscular strain, an immediate ECG and clinical assessment by an emergency physician are vital.

*Disclaimer: This is preliminary triage guidance, not a medical diagnosis.*`;
  }

  if (isHindi) {
    return `नमस्ते! मैं आरोग्य मित्र (HealthPulse AI) हूँ। 

आपकी स्वास्थ्य संबंधी चिंता को समझने में मैं मदद कर सकता हूँ:
1. **रिपोर्ट समझना:** यदि आपके पास ब्लड टेस्ट (CBC, LFT, KFT, शुगर) या एक्स-रे की रिपोर्ट है, तो आप उसके मान पूछ सकते हैं।
2. **सही विशेषज्ञ का चुनाव:** आपके लक्षणों के आधार पर मैं बता सकता हूँ कि आपको किस विशेषज्ञ (जैसे फिजिशियन, पल्मोनोलॉजिस्ट, कार्डियोलॉजिस्ट) को दिखाना चाहिए।
3. **घरेलू सावधानी व देखभाल:** पर्याप्त पानी पिएं, विश्राम करें और तापमान/बीपी पर नजर रखें।

बताइए, आपकी क्या सहायता करूँ?

*नोट: मैं एक AI सहायक हूँ और दवाइयां प्रिस्क्राइब नहीं कर सकता। चिकित्सीय निर्णय के लिए हमेशा डॉक्टर से परामर्श लें।*`;
  }

  return `Hello! I am Arogya Mitra (HealthPulse AI Assistant).

I am here to help you navigate your healthcare journey:
1. **Understanding Diagnostic Reports:** I can help decode medical terms, lab biomarkers (like HbA1c, Creatinine, Bilirubin, Platelets), and imaging findings into plain language.
2. **Doctor Specialization Guidance:** Based on symptoms, I can recommend whether a General Physician, Pulmonologist, Pathologist, or other specialist is right for you.
3. **Health & Wellness Tips:** Hydration, balanced nutrition, resting protocols, and monitoring vitals through approved medical devices.

How can I assist you today?

*Note: I am an AI assistant. I do not provide prescriptions or definitive diagnoses. Always consult a qualified medical professional.*`;
}

function generateFallbackReportExplanation(testName: string, values: any[], language: string): string {
  const isHindi = language === 'hi';
  if (isHindi) {
    return `### ${testName || 'डायग्नोस्टिक लैब रिपोर्ट'} का सरल विश्लेषण

यह टेस्ट आपके शरीर के प्रमुख अंगों और स्वास्थ्य संकेतकों की स्थिति जानने के लिए किया जाता है।

**मुख्य बातें:**
- अधिकांश मान मानक संदर्भ सीमा (Normal Reference Range) में होने चाहिए।
- यदि कोई मान 'High' या 'Low' है, तो यह तनाव, संक्रमण, खान-पान या अंतर्निहित स्थिति का संकेत हो सकता है।

**डॉक्टर से पूछने योग्य 3 महत्वपूर्ण प्रश्न:**
1. क्या इस रिपोर्ट के परिणामों के लिए मुझे किसी जीवनशैली या आहार में बदलाव की आवश्यकता है?
2. क्या मुझे किसी अतिरिक्त जांच (Follow-up test) की आवश्यकता है?
3. क्या वर्तमान में ली जा रही दवाइयों का इन परिणामों पर कोई प्रभाव है?

*कृपया अपनी इस रिपोर्ट को अपने डॉक्टर को अवश्य दिखाएं।*`;
  }

  return `### Simplified Summary for ${testName || 'Diagnostic Lab Report'}

This laboratory panel evaluates metabolic and cellular function to help your clinician understand your baseline physiological health.

**Key Clinical Context:**
- Reference ranges represent the 95th percentile of healthy populations. Slight variations can occur due to hydration, circadian rhythm, or recent meals.
- Highlighted parameters should be correlated with your symptoms and physical exam.

**3 Key Questions to Ask Your Doctor:**
1. "Do any borderline or elevated values warrant medication adjustment or dietary changes?"
2. "Should we schedule a follow-up test in 4 to 8 weeks to track the trend?"
3. "Are my daily lifestyle or physical activity levels aligned with these findings?"

*Please ensure this report is formally reviewed by your attending physician or pathologist.*`;
}

// In production, serve the Vite build output. In development, mount Vite dev middleware.
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HealthPulse AI Full-Stack Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
