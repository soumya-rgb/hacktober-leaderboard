async function loadLeaderboard() {
  try {
    const res = await fetch("/api/leaderboard");
    const data = await res.json();

    const tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3'>No data yet. Be the first to register!</td></tr>";
      return;
    }

    data.forEach((user, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>#${i + 1}</td>
        <td>${user.username}</td>
        <td>${user.prs}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

loadLeaderboard();
setInterval(loadLeaderboard, 30000); // refresh every 30s
