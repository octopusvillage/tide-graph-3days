export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { pc, hc, yr, mn, dy, rg } = req.query;

  if (!pc || !hc || !yr || !mn || !dy) {
    return res.status(400).json({ error: "必須パラメータが不足しています (pc, hc, yr, mn, dy)" });
  }

  const params = new URLSearchParams({ pc, hc, yr, mn, dy, rg: rg || "day" });
  const apiUrl = `https://api.tide736.net/get_tide.php?${params}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `upstream: ${response.status} ${response.statusText}` });
    }
    const data = await response.json();
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: `プロキシエラー: ${err.message}` });
  }
}
