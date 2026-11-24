// Supabase Edge Function: gera reflexões com Google Gemini (plano gratuito).
// Configure:  supabase secrets set GEMINI_API_KEY=xxxx
const KEY = Deno.env.get('GEMINI_API_KEY')!;
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

const ANGLES = ['identidade em Cristo', 'confiança em meio à ansiedade', 'perdão e graça', 'propósito no trabalho',
  'relacionamentos e família', 'gratidão', 'coragem diante dos desafios', 'esperança', 'santidade no dia a dia', 'servir ao próximo'];

function life(age: number, gender: string) {
  const g = gender === 'F' ? 'mulher' : 'homem';
  if (age < 18) return `um(a) adolescente (${g}) de ${age} anos`;
  if (age < 30) return `um(a) jovem ${g} de ${age} anos`;
  if (age < 60) return `um(a) ${g} adulto(a) de ${age} anos`;
  return `um(a) ${g} de ${age} anos, com longa caminhada de vida`;
}

async function gemini(prompt: string) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 900 } }),
  });
  const j = await r.json();
  return j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
}

const BASE = `Você é um pastor evangélico acolhedor, fiel às Escrituras, que escreve devocionais em português do Brasil.
Não invente versículos; cite apenas referências reais. Seja pessoal, caloroso e prático. Sem markdown, só texto corrido com parágrafos.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const b = await req.json();
    let prompt = '';
    if (b.action === 'reflect') {
      const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
      prompt = `${BASE}
Escreva um devocional para ${b.name}, ${life(b.age, b.gender)}.
Versículo(s) escolhido(s): ${b.ref} — "${b.verse}"
Contexto do capítulo: ${b.chapter}
${b.recentRefs?.length ? `Textos que ${b.name} meditou recentemente: ${b.recentRefs.join('; ')}.` : ''}
Se fizer sentido com o texto, toque no tema "${angle}".
Estrutura: 1) contexto breve do capítulo; 2) o que o versículo revela sobre Deus; 3) aplicação concreta para a vida de ${b.name} hoje;
4) uma pergunta para meditar; 5) uma oração curta em primeira pessoa. Máximo 300 palavras. Chame a pessoa pelo nome.`;
    } else if (b.action === 'respond') {
      prompt = `${BASE}
${b.name} (${life(b.age, b.gender)}) meditou em ${b.ref}.
Reflexão recebida: ${b.reflection}
O que ${b.name} registrou: "${b.note}"
Responda diretamente ao que a pessoa escreveu, reconhecendo o que ela percebeu, aprofundando com uma verdade bíblica (pode citar outra referência real)
e encorajando-a para o dia. Máximo 120 palavras.`;
    } else return new Response(JSON.stringify({ error: 'ação inválida' }), { status: 400, headers: cors });

    const text = await gemini(prompt);
    return new Response(JSON.stringify({ text }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: cors });
  }
});
