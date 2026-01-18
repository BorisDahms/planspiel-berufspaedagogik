
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
      
      DEINE AUFGABE: Unterscheide präzise zwischen "Kopie der Aufgabe" und "Echter Antwort".
      
      SCHRITT 1: DER PLAGIATS-CHECK (Sei vorsichtig!)
      Ein Text ist NUR DANN ein Plagiat (0 Punkte), wenn er EINDEUTIGE Merkmale der Aufgabenstellung hat:
      - Er beginnt mit Rollennamen wie "Dr. Klara Kompetenz:" oder "Horst Hektik:".
      - Er enthält direkte Regieanweisungen an den Spieler wie: "Bitte differenzieren Sie...", "Entwickeln Sie...", "Ich benötige Ihre Expertise".
      
      WICHTIG: 
      - Ein gut strukturierter Text, der Fachbegriffe erklärt (z.B. "Digitale Zwillinge sind...", "Man sollte Agile Methoden nutzen..."), ist KEIN Plagiat, sondern eine sehr gute Antwort!
      - Wenn du unsicher bist, bewerte lieber den Inhalt ("In dubio pro reo").
      
      SCHRITT 2: DIE BEWERTUNG (Wenn kein Plagiat)
      - Niveau: DQR 7 (Master). Erwarte Fachbegriffe.
      - Tonfall: Streng in der Sache, aber WERTSCHÄTZEND und MOTIVIEREND im Ton.
      - Gib IMMER einen konkreten Verbesserungstipp, wenn nicht volle Punktzahl erreicht wurde.
      
      FORMAT:
      Maximal 6 Sätze Feedback.
      Zwingend am Ende neue Zeile: "PUNKTE: XX/100"`
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
        temperature: 0.3, // Niedriger = Präziser, weniger Halluzinationen
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
