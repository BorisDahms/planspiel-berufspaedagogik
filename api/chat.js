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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Schnelles und günstiges Modell
        messages: messages,
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
