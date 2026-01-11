import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de MineralTax Suisse. Ton ton est professionnel, précis et helvétique. Ta mission : Aider les patrons de PME à comprendre le remboursement de l'impôt sur les huiles minérales.

Infos clés :
- Taux de remboursement : 34.05 cts / litre (0.3405 CHF/L)
- Éligibilité : Véhicules et machines utilisés hors route (chantiers, agriculture, génie civil)
- Non-éligibilité : Véhicules roulant sur route (camions de transport, voitures)
- Procédure : MineralTax génère les rapports conformes pour le portail Taxas de l'OFDF
- Prix : 250 CHF / an pour un accès complet
- Essai : 10 jours gratuits

Si la question est trop complexe ou sort de tes compétences, demande à l'utilisateur d'écrire à support@mineraltax.ch.

Réponds toujours en français sauf si l'utilisateur écrit dans une autre langue (allemand, italien, anglais), auquel cas tu réponds dans sa langue.`;

export async function getChatResponse(userMessage: string, conversationHistory: { role: "user" | "assistant"; content: string }[]): Promise<string> {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_completion_tokens: 1024,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "Je suis désolé, je n'ai pas pu générer une réponse. Veuillez réessayer.";
}

export async function streamChatResponse(
  userMessage: string, 
  conversationHistory: { role: "user" | "assistant"; content: string }[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage },
  ];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_completion_tokens: 1024,
    temperature: 0.7,
    stream: true,
  });

  let fullResponse = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      fullResponse += content;
      onChunk(content);
    }
  }

  return fullResponse;
}
