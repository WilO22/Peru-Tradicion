// src/server.ts

// --- 1. Imports de Angular SSR ---
import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

// --- 2. Imports para la IA ---
import 'dotenv/config';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type SafetySetting,
} from '@google/generative-ai';

// --- 3. Configuración de Gemini ---
const GEMINI_API_KEY = process.env['GEMINI_API_KEY'];
if (!GEMINI_API_KEY) {
  console.warn(
    'ADVERTENCIA: GEMINI_API_KEY no está definida...' // (Mensaje sin cambios)
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const generationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};
const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- 4. Bootstrap del Servidor ---
const browserDistFolder = join(import.meta.dirname, '../browser');
const app = express();
const angularApp = new AngularNodeAppEngine();

// --- 5. Middleware de JSON ---
app.use(express.json());

// --- 6. Endpoints de la API (Corregidos) ---

// Endpoint para Disfraces
app.post('/api/generateCostumeDescription', async (req, res) => {
  try {
    if (!genAI) {
      throw new Error('API Key de Gemini no configurada en el servidor.');
    }
    const { name, region } = req.body;
    if (!name || !region) {
      res.status(400).json({ error: 'Nombre y región son requeridos.' });
      return;
    }

    // --- ¡CORRECCIÓN DEL NOMBRE DEL MODELO! ---
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro', generationConfig, safetySettings });
    
    const prompt = `Genera una descripción de producto corta (2-3 frases) y atractiva para un traje típico peruano.
    Nombre: "${name}"
    Región: "${region}"
    No incluyas el nombre ni la región en la respuesta, solo la descripción.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text();
    
    res.json({ description });
    return;

  } catch (error) {
    console.error('Error en API de Gemini (Costume):', error);
    res.status(500).json({ error: 'Error al generar la descripción.' });
    return;
  }
});

// Endpoint para Banners
app.post('/api/generateBannerContent', async (req, res) => {
  try {
    if (!genAI) {
      throw new Error('API Key de Gemini no configurada en el servidor.');
    }
    const { festivity } = req.body;
    if (!festivity) {
      res.status(400).json({ error: 'La festividad es requerida.' });
      return;
    }

    // --- ¡CORRECCIÓN DEL NOMBRE DEL MODELO! ---
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro', generationConfig, safetySettings });

    const prompt = `Genera contenido para un banner publicitario de una tienda de disfraces típicos peruanos.
    Festividad: "${festivity}"
    Responde SOLO con un objeto JSON con las claves "title" (atractivo) y "subtitle" (complementario).`;

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text().replace(/```json/g, '').replace(/```/g, '');
    
    res.json(JSON.parse(jsonText));
    return;

  } catch (error) {
    console.error('Error en API de Gemini (Banner):', error);
    res.status(500).json({ error: 'Error al generar el contenido.' });
    return;
  }
});
// --- Fin de Endpoints ---


// --- 7. Servir Archivos Estáticos (Sin cambios) ---
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// --- 8. Manejador de Angular (Sin cambios) ---
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

// --- 9. Arranque del Servidor (Sin cambios) ---
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error?: Error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// --- 10. Exportación del Manejador (Sin cambios) ---
export const reqHandler = createNodeRequestHandler(app);