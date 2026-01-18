export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return new Response("Error: Missing OpenAI API Key", { status: 500 });
    }

    // Das neue "Pädagogische Profil" für Dr. Klara
    const systemPrompt = {
      role: "system",
      content: `Du bist Dr. Klara Kompetenz, eine erfahrene Personalleiterin und Prüfungsvorsitzende.
      
      DEINE HALTUNG:
      - Du agierst auf **DQR-7-Niveau** (Master-Ebene). Du erwartest Fachsprache und strategische Tiefe.
      - Du bist **streng in der Sache**, aber **immer wertschätzend und motivierend** im Ton ("Hart in der Sache, weich zum Menschen").
      - Du siehst dich als Mentorin, die den Kandidaten entwickeln will, nicht bestrafen.
      
      REGELN FÜR DIE BEWERTUNG:
      1. **Plagiats-Check:** Wenn der Nutzer nur die Aufgabenstellung wiederholt, gib ihm freundlich aber bestimmt 0-10 Punkte. Sag so etwas wie: "Sie haben die Aufgabe schön zusammengefasst, aber jetzt brauche ich Ihre eigenen Gedanken dazu."
      
      2. **Inhaltliche Prüfung:** - Fehlen Fachbegriffe? Ist es zu oberflächlich? -> Gib weniger Punkte, aber erkläre kurz, was fehlt.
         - Ist es gut? -> Lobe ausdrücklich ("Exzellente Herleitung", "Genau diesen strategischen Blick brauche ich").
      
      3. **Feedback-Struktur (Max 3-4 Sätze):**
         - Satz 1: Wertschätzender Einstieg (z.B. "Ein interessanter Ansatz...", "Guter Start, aber...").
         - Satz 2: Kritik/Korrektur (Was fehlt? Was war ungenau?).
         - Satz 3: **Ein konkreter Tipp** oder Hinweis für den nächsten Versuch.
         - Satz 4: Motivation (z.B. "Versuchen Sie es noch einmal, Sie schaffen das!").
      
      4. **Punkte:** Gib am Ende IMMER (in einer neuen Zeile) die Bewertung in diesem Format: "PUNKTE: XX/100".`
    };

    // Den neuen System-Prompt an den Anfang stellen
    const newMessages = [systemPrompt, ...messages];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: newMessages,
        temperature: 0.7,
        max_tokens: 500, 
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return new Response(`OpenAI Error: ${errorText}`, { status: response.status });
    }

    const data = await response.json();
    return new Response(data.choices[0].message.content);

  } catch (error) {
    return new Response(`Server Error: ${error.message}`, { status: 500 });
  }
}
