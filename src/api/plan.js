export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { days, hotel } = req.body

  res.status(200).json({
  days: [
    { day: 1, title: "Arrive & Settle In", narrative: "Check into Bambu Indah and spend the afternoon exploring the riverside gardens.", hotel: "Bambu Indah" },
    { day: 2, title: "Rice Terraces & Culture", narrative: "Morning walk through Tegalalang rice terraces, afternoon cooking class.", hotel: "Bambu Indah" }
  ]
})
}

/*

  const systemPrompt = `You are Sustivo's Bali travel planner. 
Build a ${days}-day itinerary for a sustainable traveler staying in Ubud, Bali.
The traveler is staying at: ${hotel.name} — ${hotel.description}
Rules:
- Write a title and 2-3 sentence narrative for each day
- Incorporate the hotel's sustainability ethos into the narrative
- Keep it inspiring but grounded and practical
- Return ONLY valid JSON in this exact format, no extra text:
{
  "days": [
    {
      "day": 1,
      "title": "Day title here",
      "narrative": "Narrative text here",
      "hotel": "${hotel.name}"
    }
  ]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: systemPrompt }]
      })
    })

    const result = await response.json()
    const text = result.content[0].text
    const parsed = JSON.parse(text)
    res.status(200).json(parsed)
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate itinerary' })
  }
}

*/