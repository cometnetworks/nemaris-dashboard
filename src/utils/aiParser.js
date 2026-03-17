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
 * Parse prospects from text using Groq API
 */
export async function parseProspectsWithAI(text, reportDate = null) {
  const dateStr = reportDate || new Date().toISOString().split('T')[0];
  
  // Try Groq first, then fallback to OpenRouter
  let result = await tryGroq(text, dateStr);
  if (!result) {
    result = await tryOpenRouter(text, dateStr);
  }
  
  if (!result) {
    throw new Error('No se pudo conectar a ninguna API de IA. Verifica tus API keys.');
  }
  
  return result;
}

async function tryGroq(text, dateStr) {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) return null;
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
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
    
    if (!response.ok) {
      console.warn('Groq API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    return processAIResponse(content, dateStr, 'Groq');
  } catch (e) {
    console.warn('Groq API failed:', e);
    return null;
  }
}

async function tryOpenRouter(text, dateStr) {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) return null;
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Nemaris Dashboard',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: EXTRACTION_PROMPT },
          { role: 'user', content: `Fecha del reporte: ${dateStr}\n\nTexto del informe:\n${text.substring(0, 28000)}` }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });
    
    if (!response.ok) {
      console.warn('OpenRouter API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    return processAIResponse(content, dateStr, 'OpenRouter');
  } catch (e) {
    console.warn('OpenRouter API failed:', e);
    return null;
  }
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
