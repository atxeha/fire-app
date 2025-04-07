document.addEventListener("DOMContentLoaded", async () => {
    let searchQuery = "";

    fetchAndDisplayItems(searchQuery);

    const backBtn = document.getElementById("backBtn");

    const tableContainer = document.querySelector(".table-container");
    const tableHead = document.querySelector(".table thead");
    const deleteItemForm = document.getElementById("deleteItemForm");
    const deleteItemModal = new bootstrap.Modal(document.getElementById("deleteItemModal"));

    const exportButton = document.getElementById("exportItem");
    const selectAllIcon = document.getElementById("selectAllItem");
    const selectItemIcon = document.getElementById("selectItem");
    const deleteSelectedBtn = document.getElementById("deleteSelected")

    if (exportButton) {
        exportButton.addEventListener("click", async () => {
            const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
            const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));

            if (selectedIds.length === 0) {
                window.electronAPI.showToast("No items selected.", false);
                return;
            }
            const tableName = "pulledItem";
            const response = await window.electronAPI.exportItems({ tableName, selectedIds });

            window.electronAPI.showToast(response.message, response.success);
        });
    }

    let ifSelected = false;

    if (selectItemIcon) {
        selectItemIcon.addEventListener("click", () => {
            if (!ifSelected) {
                const checkboxColumn = document.getElementById("checkboxColumn");
                const checkboxCells = document.querySelectorAll(".checkboxCell input");

                if (checkboxCells.length > 0) {
                    const isCurrentlyHidden = checkboxColumn.style.display === "none";

                    checkboxColumn.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    checkboxColumn.style.opacity = 0

                    checkboxCells.forEach((checkbox, index) => {
                        checkbox.parentElement.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    });
                }
            }
        })
    }

    if (selectAllIcon) {
        selectAllIcon.addEventListener("click", () => {
            const checkboxColumn = document.getElementById("checkboxColumn");
            const checkboxCells = document.querySelectorAll(".checkboxCell input");
            const rows = document.querySelectorAll("#pulledTableBody tr");

            if (checkboxCells.length > 0) {
                const isCurrentlyHidden = checkboxColumn.style.display === "none";

                checkboxColumn.style.display = isCurrentlyHidden ? "table-cell" : "none";
                checkboxColumn.style.opacity = 0

                checkboxCells.forEach((checkbox, index) => {
                    checkbox.parentElement.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    checkbox.checked = isCurrentlyHidden;

                    if (isCurrentlyHidden) {
                        rows[index].classList.add("selected-row");
                        ifSelected = true;
                    } else {
                        rows[index].classList.remove("selected-row");
                        ifSelected = false;
                    }
                });
            }
        });
    }

    document.addEventListener("change", (event) => {
        if (event.target.classList.contains("rowCheckbox")) {
            const row = event.target.closest("tr");
            if (event.target.checked) {
                row.classList.add("selected-row");
            } else {
                row.classList.remove("selected-row");
            }
        }
    });

    if (tableContainer && tableHead) {
        tableContainer.addEventListener("scroll", function () {

            tableContainer.classList.add("scrolling");

            clearTimeout(tableContainer.scrollTimeout);
            tableContainer.scrollTimeout = setTimeout(() => {
                tableContainer.classList.remove("scrolling");
            }, 400);

            if (tableContainer.scrollTop > 0) {
                tableHead.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.1)";
            } else {
                tableHead.style.boxShadow = "none";
            }
        });
    }

    if (window.electronAPI) {
        if (backBtn) {
            backBtn.addEventListener("click", (event) => {
                event.preventDefault();
                window.electronAPI.navigate("mainStock.html");
            });
        }

        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener("click", (event) => {
                const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
                const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));
        
                if (selectedIds.length === 0) {
                    window.electronAPI.showToast("No items selected.", false);
                    return;
                }
        
                deleteItemModal.show();
            });
        }

        if (deleteItemForm) {
            deleteItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();
        
                const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
                const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));
        
                if (selectedIds.length === 0) {
                    window.electronAPI.showToast("No items selected.", false);
                    return;
                }
        
                const tableName = "pulledItem";
                const response = await window.electronAPI.deleteSelectedItems(tableName, selectedIds);
        
                document.getElementById("checkboxColumn").style.display = "none";
        
                window.electronAPI.showToast(response.message, response.success);
                fetchAndDisplayItems(searchQuery);
                deleteItemModal.hide();
            });
        } 
    };
});

let items = [];

document.getElementById("searchPulledItem").addEventListener("input", (event) => {
    searchQuery = event.target.value.trim();
    fetchAndDisplayItems(searchQuery);
});

async function fetchAndDisplayItems(searchQuery = "") {
    try {
        items = await window.electronAPI.getPullItems();

        const tableBody = document.getElementById("pulledTableBody");
        const tableHead = document.getElementById("pulledTableHead");
        const pulledTable = document.getElementById("pulledTable");

        tableBody.innerHTML = "";

        const filteredItems = items.filter(item => {
            const itemCodeMatch = item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.releasedDate)
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

            const dateMatch = itemDate.includes(searchQuery);
            return itemCodeMatch || dateMatch;
        });

        if (filteredItems.length === 0) {
            pulledTable.classList.remove("table-hover");
            tableHead.style.display = "none";
            tableBody.innerHTML = `
                <tr>
                <td colspan="9" class="text-center text-muted p-3 pt-4"><h6>No item found</h6></td>
                </tr>
            `;
            return;
        }

        filteredItems.forEach((item, index) => {
            const row = document.createElement("tr");

            const formattedDate = new Date(item.releasedDate)
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
                <td class="checkboxCell" style="display: none;">
                    <input id="checkbox" type="checkbox" class="rowCheckbox" data-id="${item.id}">
                </td>
                <td>${index + 1}</td>
                <td>${item.itemCode}</td>
                <td>${item.itemName}</td>
                <td>${item.releasedQuantity}</td>
                <td>${item.unit}</td>
                <td>${item.releasedBy}</td>
                <td>${item.receivedBy}</td>
                <td>${formattedDate}</td>
                <td>
                    <i class="edit-icon icon-btn icon material-icons ms-3" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                </td>
            `;
            tableBody.appendChild(row);
        });
        var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.map(
            (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
        );
    } catch (error) {
        console.error("Error fetching items:", error);
    }
};
