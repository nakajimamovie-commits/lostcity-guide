export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, lang } = req.body;

  const prompts = {
    tw: '以下のHTMLを繁体字中国語（台湾）に翻訳してください。台湾で使われる用語・表現を使用してください。HTMLタグ・クラス名・属性値・絵文字・数字・記号はそのまま保持し、テキスト内容のみ翻訳してください。翻訳済みHTMLのみ返してください。',
    hk: '以下のHTMLを繁体字中国語（香港）に翻訳してください。香港で使われる広東語的な表現・用語を使用してください。HTMLタグ・クラス名・属性値・絵文字・数字・記号はそのまま保持し、テキスト内容のみ翻訳してください。翻訳済みHTMLのみ返してください。',
    tr: "Aşağıdaki HTML'i Türkçeye çevirin. HTML etiketleri, sınıf adları, özellik değerleri, emojiler, sayılar ve semboller olduğu gibi korunmalı, yalnızca metin içeriği çevrilmelidir. Yalnızca çevrilmiş HTML'i döndürün."
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompts[lang] + '\n\n' + html }]
    })
  });

  const data = await response.json();
  const translated = data.content?.[0]?.text || html;
  res.status(200).json({ translated });
}