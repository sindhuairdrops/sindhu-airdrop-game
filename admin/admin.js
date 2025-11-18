// Load Stats
fetch("/admin/api/stats")
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalUsers").innerText = data.users || 0;
        document.getElementById("totalEarnings").innerText = (data.tokens || 0) + " 🪙";
        document.getElementById("totalRefs").innerText = data.referrals || 0;
    });

// Load Users
fetch("/admin/users")
    .then(res => res.json())
    .then(users => {
        const tbody = document.querySelector("#userTable tbody");
        tbody.innerHTML = "";

        users.forEach(u => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${u.id}</td>
                <td>${u.wallet || '-'}</td>
                <td>${u.coins}</td>
                <td>${u.total_referrals}</td>
                <td>${u.joined_date}</td>
            `;

            tbody.appendChild(row);
        });
    });

// Search Filter
function filterUsers() {
    const input = document.getElementById("searchBox").value.toLowerCase();
    const rows = document.querySelectorAll("#userTable tbody tr");

    rows.forEach(r => {
        const rowText = r.innerText.toLowerCase();
        r.style.display = rowText.includes(input) ? "" : "none";
    });
}

// Save Scrolling Message
function saveMsg() {
    const msg = document.getElementById("scrollMsg").value;

    fetch("/admin/message", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "message=" + encodeURIComponent(msg)
    }).then(() => alert("Message Saved!"));
}

// Download CSV
function downloadCSV() {
    window.location.href = "/admin/report";
}

// Send message to ALL users
function sendBroadcast() {
    const msg = document.getElementById("broadcastBox").value.trim();
    const status = document.getElementById("broadcastStatus");

    if (!msg) {
        alert("Message cannot be empty!");
        return;
    }

    status.innerText = "Sending...";

    fetch("/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    })
    .then(res => res.text())
    .then(response => {
        status.innerText = response;
    })
    .catch(() => {
        status.innerText = "❌ Error sending messages.";
    });
}
