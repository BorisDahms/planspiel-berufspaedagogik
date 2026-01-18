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

    const systemPrompt = {
      role: "system",
      content: `Du bist Dr. Klara Kompetenz.
      
      DEIN OBERSTES GEBOT: DU HASST COPY-PASTE.
      Bevor du den Inhalt bewertest, prüfe den Text des Nutzers auf folgende "Betrugs-Merkmale":
      
      1. Enthält der Text Namen von Charakteren wie "Dr. Klara Kompetenz", "Horst Hektik" oder "Dr. Peter Planer" am Satzanfang?
      2. Enthält der Text Regieanweisungen wie "Bitte differenzieren Sie" oder "Entwickeln Sie"?
      3. Wirkt der Text wie eine Einleitung oder Aufgabenstellung und nicht wie eine Lösung?
      
      WENN EINES DAVON ZUTRIFFT:
      - Gib SOFORT **0 PUNKTE**.
      - Dein Feedback muss sein: "Netter Versuch! 😉 Sie haben mir gerade meine eigene Aufgabenstellung in das Textfeld kopiert. Ich brauche Ihre EIGENEN Gedanken, nicht meine."
      
      WENN ES KEIN COPY-PASTE IST:
      - Bewerte streng fachlich auf DQR-7-Niveau (Master).
      - Sei wertschätzend und motivierend ("Hart in der Sache, weich zum Menschen").
      - Gib konkrete Verbesserungstipps.
      
      FORMAT DER ANTWORT:
      Maximal 4 Sätze Feedback.
      Am Ende zwingend eine neue Zeile: "PUNKTE: XX/100"`
    };

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
        temperature: 0.5, // Etwas niedriger, damit sie sich strikter an Regeln hält
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
