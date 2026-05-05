module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body;

    const systemPrompt = `あなたはパズル＆コンクエストのロストシティイベントの専門アシスタントです。
プレイヤーからの質問に日本語で答えてください。
以下の知識をもとに回答してください：
- ロストシティは国内トップクランが合体して勢力を作り、専用マップで拠点を取り合うイベント
- 温暖値：毎時6減少（8日目以降は9減少）、08:30〜09:00は3倍速で減少、09:00時点で1以上で生存
- 石炭：自分の温暖値を回復、1日100個まで。薪：仲間に送る専用、1日50個まで
- 飛行船：ロストシティマップでは必須。HR/R/HN/Nのレア度あり。艤装システムあり
- 拠点攻略：外壁NPC撃破→外壁占領→内城攻撃（飛行船の攻城値でダメージ）
- 採集はロストシティマップ内で行う必要あり
- 英霊殿：負傷兵を復活の結晶で回復。毎週金曜09:00に20%無料回復
- 大事記：日数ごとに勢力が目標達成で報酬・効果あり
- ロストシティ技術：失われた工程書で研究。防寒I〜IIIで温暖値減少を軽減
わからないことは「情報がないので確認してください」と答えてください。`;

    const contents = [
      ...history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini error:', errText);
      return res.status(500).json({ error: errText });
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '回答できませんでした。';
    res.status(200).json({ reply });

  } catch (err) {
    console.error('Handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
}
