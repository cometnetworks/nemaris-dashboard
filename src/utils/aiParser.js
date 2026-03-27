const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const EXTRACTION_PROMPT = `Eres un extractor de datos de informes de prospección SAP para la empresa Nemaris. 
Analiza el siguiente texto de un informe y extrae TODOS los prospectos mencionados.

Para cada prospecto, devuelve un objeto JSON con EXACTAMENTE estos campos:
- company (string): Nombre de la empresa
- sector (string): Sector/industria
- location (string): País y ciudad
- priority (string): "Alta", "Media-Alta", "Media", o "Baja" — basado en la urgencia del trigger y score
- score (number): De 0 a 100, estimado según la oportunidad. Si no viene explícito, asigna: Alta=88-95, Media-Alta=80-87, Media=70-79, Baja=60-69
- trigger (string): El detonador/disparador detectado
- needs (array de strings): Posibles necesidades/problemas SAP
- projectStatus (string): Estado estimado del proyecto
- deciders (string): Roles de tomadores de decisión
- linkedinLinks (array de objetos {role, url}): Links de LinkedIn de decisores si los hay
- emailSubject (string): Asunto del email sugerido
- emailBody (string): Cuerpo del email de contacto
- followUpEmail (string): Email de follow-up sugerido
- ctaSugerido (string): CTA sugerido para el primer contacto
- discoveryNote (string): Nota para la discovery call

IMPORTANTE:
- Extrae TODOS los prospectos del texto, no solo los primeros
- Si el texto menciona emails de contacto reales, inclúyelos 
- Genera IDs únicos usando slug de la empresa + fecha del reporte
- Devuelve SOLO un array JSON válido, sin texto adicional ni markdown
- Si no puedes extraer un campo, usa un valor razonable por defecto

Responde ÚNICAMENTE con el array JSON, sin ningún otro texto.`;

/**
 * Parse prospects from text using Groq API with OpenRouter fallback
 */
export async function parseProspectsWithAI(text, reportDate = null) {
  const dateStr = reportDate || new Date().toISOString().split('T')[0];
  const errors = [];
  
  // Try Groq first (with retry on 429), then fallback to OpenRouter
  let result = await tryGroq(text, dateStr, errors);
  if (!result) {
    console.log('Groq failed or unavailable, trying OpenRouter...');
    result = await tryOpenRouter(text, dateStr, errors);
  }
  
  if (!result) {
    const errorDetail = errors.length > 0 ? errors.join(' | ') : 'Sin API keys configuradas';
    console.error('All AI APIs failed:', errorDetail);
    throw new Error(`Error de IA: ${errorDetail}`);
  }
  
  return result;
}

/**
 * Delay helper
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tryGroq(text, dateStr, errors) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    errors.push('Groq: sin API key');
    return null;
  }

  const maxRetries = 2;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: `Fecha del reporte: ${dateStr}\n\nTexto del informe:\n${text.substring(0, 28000)}` }
          ],
          temperature: 0.1,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        }),
      });
      clearTimeout(timeout);
      
      if (response.status === 429) {
        const waitSecs = (attempt + 1) * 10;
        console.warn(`Groq rate limited (429). Attempt ${attempt + 1}/${maxRetries}. Waiting ${waitSecs}s...`);
        if (attempt < maxRetries - 1) {
          await delay(waitSecs * 1000);
          continue;
        }
        console.warn('Groq rate limit exceeded, falling back to OpenRouter');
        errors.push('Groq: rate limit 429');
        return null;
      }

      if (!response.ok) {
        console.warn('Groq API error:', response.status);
        errors.push(`Groq: HTTP ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      const content = data.choices[0].message.content;
      return processAIResponse(content, dateStr, 'Groq');
    } catch (e) {
      const errMsg = e.name === 'AbortError' ? 'Groq: timeout 60s' : `Groq: ${e.message}`;
      console.warn(`Groq API attempt ${attempt + 1} failed:`, errMsg);
      errors.push(errMsg);
      if (attempt === maxRetries - 1) return null;
      await delay(5000);
    }
  }
  return null;
}

async function tryOpenRouter(text, dateStr, errors) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) {
    errors.push('OpenRouter: sin API key');
    return null;
  }

  // Try multiple models in case one fails
  const models = [
    'meta-llama/llama-3.3-70b-instruct',
    'meta-llama/llama-3.1-70b-instruct',
    'google/gemini-2.0-flash-001',
  ];

  for (const model of models) {
    try {
      console.log(`Trying OpenRouter with model: ${model}`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 90000); // 90s timeout
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Nemaris Dashboard',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: EXTRACTION_PROMPT },
            { role: 'user', content: `Fecha del reporte: ${dateStr}\n\nTexto del informe:\n${text.substring(0, 28000)}` }
          ],
          temperature: 0.1,
          max_tokens: 8000,
        }),
      });
      clearTimeout(timeout);
      
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`OpenRouter error (${model}):`, response.status, errText);
        errors.push(`OpenRouter ${model}: HTTP ${response.status}`);
        continue; // Try next model
      }
      
      const data = await response.json();
      if (!data.choices?.[0]?.message?.content) {
        console.warn(`OpenRouter empty response (${model})`);
        errors.push(`OpenRouter ${model}: respuesta vacía`);
        continue;
      }
      console.log(`OpenRouter success with model: ${model}`);
      const content = data.choices[0].message.content;
      return processAIResponse(content, dateStr, 'OpenRouter');
    } catch (e) {
      const errMsg = e.name === 'AbortError' ? `OpenRouter ${model}: timeout 90s` : `OpenRouter ${model}: ${e.message}`;
      console.warn(errMsg);
      errors.push(errMsg);
      continue;
    }
  }
  return null;
}

function processAIResponse(content, dateStr, source) {
  try {
    // Try to parse the response - it might be wrapped in an object
    let parsed = JSON.parse(content);
    
    // If wrapped in an object like {prospects: [...]} or {data: [...]}
    if (!Array.isArray(parsed)) {
      const keys = Object.keys(parsed);
      for (const key of keys) {
        if (Array.isArray(parsed[key])) {
          parsed = parsed[key];
          break;
        }
      }
    }
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    
    // Normalize and add metadata
    return parsed.map((p, idx) => ({
      id: p.id || generateId(p.company, dateStr, idx),
      company: p.company || 'Desconocido',
      sector: p.sector || 'No especificado',
      location: p.location || 'No especificado',
      priority: normalizePriority(p.priority || p.score),
      score: typeof p.score === 'number' ? p.score : 75,
      trigger: p.trigger || '',
      needs: Array.isArray(p.needs) ? p.needs : [],
      projectStatus: p.projectStatus || p.project_status || '',
      deciders: p.deciders || '',
      linkedinLinks: Array.isArray(p.linkedinLinks || p.linkedin_links) ? (p.linkedinLinks || p.linkedin_links) : [],
      emailSubject: p.emailSubject || p.email_subject || '',
      emailBody: p.emailBody || p.email_body || '',
      followUpEmail: p.followUpEmail || p.follow_up_email || '',
      ctaSugerido: p.ctaSugerido || p.cta_sugerido || p.cta || '',
      discoveryNote: p.discoveryNote || p.discovery_note || '',
      reportDate: dateStr,
      reportSource: source,
    }));
  } catch (e) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return processAIResponse(jsonMatch[1].trim(), dateStr, source);
    }
    
    // Try to find array in the content
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return processAIResponse(arrayMatch[0], dateStr, source);
    }
    
    console.error('Failed to parse AI response:', e, content.substring(0, 500));
    throw new Error('Error al procesar la respuesta de la IA');
  }
}

function generateId(company, dateStr, idx) {
  const slug = (company || 'prospect').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const date = dateStr.replace(/-/g, '');
  return `${slug}-${date}-${idx}`;
}

function normalizePriority(val) {
  if (typeof val === 'number') {
    if (val >= 88) return 'Alta';
    if (val >= 80) return 'Media-Alta';
    if (val >= 70) return 'Media';
    return 'Baja';
  }
  const str = (val || '').toLowerCase();
  if (str.includes('alta') && !str.includes('media')) return 'Alta';
  if (str.includes('media-alta') || str.includes('media alta')) return 'Media-Alta';
  if (str.includes('media')) return 'Media';
  return 'Baja';
}
