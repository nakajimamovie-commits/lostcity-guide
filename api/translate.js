module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { html, lang } = req.body;

    const langMap = {
      tw: 'ZH',
      hk: 'ZH',
      tr: 'TR'
    };

    const targetLang = langMap[lang];

    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: [html],
        target_lang: targetLang,
        tag_handling: 'html'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('DeepL error:', errText);
      return res.status(500).json({ error: errText, translated: html });
    }

    const data = await response.json();
    const translated = data.translations?.[0]?.text || html;
    res.status(200).json({ translated });

  } catch (err) {
    console.error('Handler error:', err.message);
    res.status(500).json({ error: err.message, translated: '' });
  }
}
