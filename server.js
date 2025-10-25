// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Optional: use your own GitHub Personal Access Token (public_repo scope)
const GITHUB_TOKEN = "ghp_your_personal_token_here"; // Replace this

let leaderboardData = [];

/**
 * 🔹 Fetch total Hacktoberfest PRs for a GitHub user
 */
async function getHacktoberPRCount(username) {
  try {
    const q = `type:pr+author:${username}+topic:hacktoberfest`;
    const response = await axios.get(`https://api.github.com/search/issues?q=${q}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    return response.data.total_count || 0;
  } catch (err) {
    console.error("❌ Error fetching Hacktober PRs:", err.response?.data || err.message);
    return 0;
  }
}

/**
 * 🔹 Register user (redirect from Hacktoberfest website)
 * Example redirect: /register?username=SoumyaSethi
 */
app.get("/register", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Missing username" });

  const prCount = await getHacktoberPRCount(username);

  const existing = leaderboardData.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) existing.prs = prCount;
  else leaderboardData.push({ username, prs: prCount });

  console.log(`✅ ${username}: ${prCount} PRs`);

  // Redirect to leaderboard page
  res.redirect(`/index.html?username=${username}`);
});

/**
 * 🔹 API endpoint to fetch sorted leaderboard
 */
app.get("/api/leaderboard", (req, res) => {
  const sorted = leaderboardData.sort((a, b) => b.prs - a.prs);
  res.json(sorted);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
