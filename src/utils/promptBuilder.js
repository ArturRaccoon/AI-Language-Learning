// src/utils/promptBuilder.js
export function buildPrompt(userMessage, userFlashcards) {
  const cardsSummary = userFlashcards
    .slice(0, 10) // Ultime 10 card dell'utente
    .map(c => `${c.parolaOriginale}: ${c.traduzione}`)
    .join('\n');
  
  return `Sei un tutor linguistico. L'utente sta imparando queste parole:
${cardsSummary}

User: ${userMessage}
Assistant:`;
}