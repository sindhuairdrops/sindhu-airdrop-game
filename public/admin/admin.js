// Load stats
async function loadStats() {
    const res = await fetch("/admin/api/stats");
    const s = await res.json();

    document.getElementById("statUsers").textContent = s.users || 0;
    document.getElementById("statCoins").textContent = s.tokens || 0;
    document.getElementById("statRefs").textContent = s.referrals || 0;
}

// Load users
async function loadUsers() {
    const res = await fetch("/admin/users");
    const users = await res.json();
    const table = document.querySelector("#usersTable tbody");

    table.innerHTML = "";

    users.forEach(u => {
        let row = `
            <tr>
                <td>${u.id}</td>
                <td>${u.wallet || "-"}</td>
                <td>${u.coins}</td>
                <td>${u.total_referrals}</td>
                <td>${u.joined_date}</td>
            </tr>
        `;
        table.innerHTML += row;
    });
}

// Load scrolling message
async function loadScrollMessage() {
    const res = await fetch("/admin/message");
    document.getElementById("scrollMsg").value = await res.text();
}

// Save scrolling message
document.getElementById("saveScroll").onclick = async () => {
    const message = document.getElementById("scrollMsg").value;
    await fetch("/admin/message", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `message=${encodeURIComponent(message)}`
    });
    alert("Saved!");
};

// CSV Export
document.getElementById("csvBtn").onclick = () => {
    window.location.href = "/admin/report";
};

// Broadcast
document.getElementById("sendBroadcast").onclick = async () => {
    const text = document.getElementById("broadcast").value;
    if (!text) return alert("Enter message!");

    const res = await fetch("/admin/broadcast", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ message: text })
    });

    const reply = await res.text();
    document.getElementById("broadcastStatus").innerText = reply;
};

// Init
loadStats();
loadUsers();
loadScrollMessage();
