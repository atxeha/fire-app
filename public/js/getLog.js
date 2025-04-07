document.addEventListener("DOMContentLoaded", () => {
    const logBtn = document.getElementById("log")

    if (logBtn) {
        logBtn.addEventListener("click", async (event) => {
            event.preventDefault();

            displayLogs("");
        })
    }
});

async function displayLogs(searchQuery = "") {
    try {
        const logs = await window.electronAPI.getLog();
        const tableBody = document.getElementById("logTableBody");
        const tableHead = document.getElementById("thead");

        tableBody.innerHTML = "";

        const filteredLogs = logs.filter(log => {
            const logCodeMatch = log.user.toLowerCase().includes(searchQuery.toLowerCase());

            const logDate = new Date(log.createdAt)
                .toLocaleString("en-US", {
                timeZone: "Asia/Manila",
                year: "2-digit",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hourCycle: "h12",
            })
            .replace("AM", "am")
            .replace("PM", "pm")
            .replace("/", "-")
            .replace("/", "-")
            .replace(",", " --");

            const dateMatch = logDate.includes(searchQuery);

            return logCodeMatch || dateMatch;
        });

        const dltIcon = document.getElementById("dltIcon");

        if (filteredLogs.length === 0) {
            tableHead.innerHTML = "";
            tableBody.innerHTML = `
                <tr>
                <td colspan="3" class="text-center text-muted p-3">No history log</td>
                </tr>
            `;
            dltIcon.style.display = "none";
            return;
        } else {
            dltIcon.style.display = "inline-block";
        }

        filteredLogs.forEach((log, index) => {
            const row = document.createElement("tr");

            // Convert ISO Date to local time format (MM-DD-YYYY HH:mm A)
            const formattedDate = new Date(log.createdAt)
                .toLocaleString("en-US", {
                    timeZone: "Asia/Manila",
                    year: "2-digit",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hourCycle: "h12",
                })
                .replace("AM", "am")
                .replace("PM", "pm")
                .replace("/", "-")
                .replace("/", "-")
                .replace(",", " --");

            row.innerHTML = `
                <td>@${log.user}</td>
                <td>${log.log} <span class="log-item">(${log.item.item_code} ${log.item.item_name})</span></td>
                <td style="width: 10rem;">${formattedDate}</td>
            `;
            tableBody.appendChild(row);
        });

        // Reinitialize Bootstrap tooltips after adding new elements
        var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(
            (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
        );

        console.log("Logs loaded successfully!");
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
};