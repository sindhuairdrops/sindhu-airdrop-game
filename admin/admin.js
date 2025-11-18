// Load Stats
fetch("/admin/api/stats")
    .then(res => res.json())
    .then(data => {
        document.getElementById("totalUsers").innerText = data.users;
        document.getElementById("totalEarnings").innerText = data.tokens + " 🪙";
        document.getElementById("totalRefs").innerText = data.referrals;
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
    let input = document.getElementById("searchBox").value.toLowerCase();
    const rows = document.querySelectorAll("#userTable tbody tr");

    rows.forEach(r => {
        let rowText = r.innerText.toLowerCase();
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
    window.location = "/admin/report";
}
