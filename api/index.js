const fetch = require("node-fetch");

module.exports = async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: "Lütfen ?username=parametresini ekleyin." });
  }

  let userId;
  try {
    const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] }),
    });
    if (!userRes.ok) {
      return res.status(502).json({ error: `Roblox Users API’ye erişilemiyor: ${userRes.status}` });
    }
    const userJson = await userRes.json();
    if (!userJson.data || userJson.data.length === 0) {
      return res.status(404).json({ error: "Belirtilen kullanıcı adıyla eşleşen hesap bulunamadı." });
    }
    userId = userJson.data[0].id;
  } catch (e) {
    return res.status(500).json({ error: `Roblox Users API beklenmeyen çıktı döndü.`, detail: e.message });
  }

  let groups;
  try {
    const grpRes = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
    if (!grpRes.ok) {
      return res.status(502).json({ error: `Roblox Groups API’ye erişilemiyor: ${grpRes.status}` });
    }
    const grpJson = await grpRes.json();
    groups = (grpJson.data || []).map((g) => ({
      groupName: g.group.name,
      userRole: g.role.name,
    }));
  } catch (e) {
    return res.status(500).json({ error: `Gruplar alınırken hata oluştu.`, detail: e.message });
  }

  return res.status(200).json({ username, userId, groups });
};
