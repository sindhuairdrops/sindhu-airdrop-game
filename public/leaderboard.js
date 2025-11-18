const tg = window.Telegram.WebApp;
tg.expand();

fetch("/admin/leaderboard-json")
  .then(r => r.json())
  .then(rows => {
    const board = document.getElementById("board");
    board.innerHTML = "";

    rows.forEach((user, index) => {
      board.innerHTML += `
        <div class="card">
            <div class="rank">#${index + 1}</div>
            <div>User ID: ${user.id}</div>
            <div>Coins: ${user.coins} 🪙</div>
        </div>
      `;
    });
  })
  .catch(() => {
    document.getElementById("board").innerText = "Failed to load leaderboard";
  });
