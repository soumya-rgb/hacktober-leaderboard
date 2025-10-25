const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Replace these with your GitHub OAuth app credentials:
const CLIENT_ID = "enter your client id";
const CLIENT_SECRET = "enter your client secret";

// Store leaderboard data in memory
let leaderboardData = [];

/**
 * Step 1: Redirect to GitHub OAuth
 */
app.get("/auth/github", (req, res) => {
  const redirect_uri = "http://localhost:3000/auth/github/callback";
  const authURL = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user&redirect_uri=${redirect_uri}`;
  res.redirect(authURL);
});

/**
 * Step 2: GitHub redirects back with a code
 */
app.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const access_token = tokenResponse.data.access_token;

    // Get user info
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const username = userResponse.data.login;

    // Fetch PR count for Hacktoberfest repos
    const prCount = await getHacktoberPRCount(username, access_token);

    // Add or update user in leaderboard
    const existing = leaderboardData.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existing) existing.prs = prCount;
    else leaderboardData.push({ username, prs: prCount });

    console.log(`✅ ${username} logged in with ${prCount} PRs`);

    // Redirect to leaderboard
    res.redirect(`/index.html?username=${username}`);
  } catch (err) {
    console.error("❌ OAuth error:", err.message);
    res.status(500).send("Authentication failed");
  }
});

/**
 * Fetch PR count for repos tagged 'hacktoberfest'
 */
async function getHacktoberPRCount(username, token) {
  try {
    const q = `type:pr+author:${username}+topic:hacktoberfest`;
    const response = await axios.get(`https://api.github.com/search/issues?q=${q}`, {
      headers: { Authorization: `token ${token}` },
    });
    return response.data.total_count || 0;
  } catch (err) {
    console.error("❌ Error fetching PRs:", err.message);
    return 0;
  }
}

/**
 * Public leaderboard API
 */
app.get("/api/leaderboard", (req, res) => {
  const sorted = leaderboardData.sort((a, b) => b.prs - a.prs);
  res.json(sorted);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
