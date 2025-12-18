// src/services/aiService.js
const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_KEY;
const MODEL = "meta-llama/Llama-3.2-3B-Instruct";

export async function generateChatResponse(userMessage, flashcardsContext) {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: buildPrompt(userMessage, flashcardsContext),
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.9
        }
      })
    }
  );
  
  const data = await response.json();
  return data[0].generated_text;
}

function buildPrompt(userMessage, flashcardsContext) {
  const contextStr = flashcardsContext 
    ? `\nContext (Flashcards): ${JSON.stringify(flashcardsContext)}`
    : '';
    
  return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a helpful language tutor assistant named LinguaCoon.
Your goal is to help the user learn their target language.
${contextStr}
<|eot_id|><|start_header_id|>user<|end_header_id|>
${userMessage}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>`;
}