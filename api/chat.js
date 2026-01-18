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
      content: `Du bist Dr. Klara Kompetenz, eine erfahrene Berufspädagogin und Ausbilderin (DQR 7 Niveau).
      
      DEINE AUFGABE:
      Bewerte die Antwort des Auszubildenden (Spielers) konstruktiv und pädagogisch wertvoll.
      
      SCHRITT 1: PLAGIATS-CHECK (Intern)
      Prüfe kurz: Ist das nur die kopierte Aufgabenstellung? (Indizien: "Dr. Klara sagt:", "Bitte differenzieren Sie...").
      Falls JA: Gib freundliches, aber bestimmtes Feedback ("Das ist die Aufgabenstellung. Bitte verfassen Sie eine eigene Lösung.") und am Ende "PUNKTE: 0/100".
      
      SCHRITT 2: PÄDAGOGISCHE BEWERTUNG (Wenn kein Plagiat)
      Bewerte die Antwort qualitativ anhand dieser 4 Kriterien:
      1. **Fachliche Korrektheit**
      2. **Praxisbezug**
      3. **Begründung**
      4. **Vollständigkeit**
      
      SCHRITT 3: FEEDBACK-STRUKTUR (Antworte genau so!)
      Verfasse deine Antwort in diesem Format (Duzen oder Siezen ist egal, passend zur Rolle "Dr. Klara" eher wertschätzendes Sie):
      
      1. **Positiver Einstieg:** Würdige den Versuch und gute Ansätze.
      2. **Konkrete Verbesserungsvorschläge:** Gehe auf die 4 Kriterien ein. Was fehlte? Was war fachlich ungenau? (Sei konstruktiv!).
      3. **Ermutigung:** Schließe mit einem motivierenden Satz für den nächsten Schritt.
      
      SCHRITT 4: TECHNISCHE WERTUNG
      Das Spiel benötigt für den Fortschrittsbalken eine Punktzahl.
      Schreibe ZWINGEND ganz am Ende in eine neue Zeile (ohne weiteren Text davor):
      "PUNKTE: XX/100"
      (Bewerte fair: <50 ist durchgefallen, >50 ist bestanden).`
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
        temperature: 0.5, 
        max_tokens: 600, // Etwas mehr Platz für das ausführliche Feedback
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
