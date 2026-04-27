module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, lang } = req.body;

    const langMap = {
      tw: 'zh-TW',
      hk: 'zh-HK',
      tr: 'tr'
    };

    const targetLang = langMap[lang];
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: html,
          source: 'ja',
          target: targetLang,
          format: 'html'
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Google Translate error:', errText);
      return res.status(500).json({ error: errText, translated: html });
    }

    const data = await response.json();
    const translated = data.data?.translations?.[0]?.translatedText || html;
    res.status(200).json({ translated });

  } catch (err) {
    console.error('Handler error:', err.message);
    res.status(500).json({ error: err.message, translated: '' });
  }
}
