document.addEventListener("DOMContentLoaded", async () => {

    let searchQuery = "";

    fetchAndDisplayItems(searchQuery);

    const backBtn = document.getElementById("backBtn");
    const tableContainer = document.querySelector(".table-container");
    const tableHead = document.querySelector(".table thead");
    const deleteItemForm = document.getElementById("deleteItemForm");
    const deleteItemModal = new bootstrap.Modal(document.getElementById("deleteItemModal"));
    const selectAllIcon = document.getElementById("selectAllItem");
    const selectItemIcon = document.getElementById("selectItem");
    const deleteSelectedBtn = document.getElementById("deleteSelected")

    let ifSelected = false;

    if (selectItemIcon) {
        selectItemIcon.addEventListener("click", () => {
            if (!ifSelected) {
                const checkboxColumn = document.getElementById("checkboxColumn");
                const checkboxCells = document.querySelectorAll(".checkboxCell input");
                const rows = document.querySelectorAll("#fighterTableBody tr");

                if (checkboxCells.length > 0) {
                    const isCurrentlyHidden = checkboxColumn.style.display === "none";

                    checkboxColumn.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    checkboxColumn.style.opacity = 0

                    checkboxCells.forEach((checkbox, index) => {
                        checkbox.parentElement.style.display = isCurrentlyHidden ? "table-cell" : "none";

                        if (!isCurrentlyHidden) {
                            rows[index].classList.remove("selected-row");
                            checkbox.checked = isCurrentlyHidden;
                        }
                    });
                }
            }
        })
    }

    if (selectAllIcon) {
        selectAllIcon.addEventListener("click", () => {
            const checkboxColumn = document.getElementById("checkboxColumn");
            const checkboxCells = document.querySelectorAll(".checkboxCell input");
            const rows = document.querySelectorAll("#fighterTableBody tr");

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
        
                const tableName = "firefighter";
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
        items = await window.electronAPI.getFirefighterList();

        const addedItemTable = document.getElementById("fighterTable");
        const tableHead = document.getElementById("fighterTableHead");
        const tableBody = document.getElementById("fighterTableBody");

        if (!tableBody) {
            console.error("Error: Table body element not found!");
            return;
        }
        tableBody.innerHTML = "";

        const filteredItems = items.filter(item => {
            const itemCodeMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return itemCodeMatch;
        });

        if (filteredItems.length === 0) {
            addedItemTable.classList.remove("table-hover");
            tableHead.style.display = "none";
            tableBody.innerHTML = `
                <tr>
                <td colspan="9" class="text-center text-muted p-3 pt-4"><h6>No firefighter found</h6></td>
                </tr>
            `;
            return;
        }

        filteredItems.forEach((item, index) => {

            function itemStatus(status) {
                const colorMap = {
                    ACTIVE: "#5ac072",
                    INACTIVE: "#db5a67", 
                    RETIRED: "#6c757d",
                    ON_LEAVE: "#ff9e4e",
                };
                return `background-color: ${colorMap[status] || "#000"}; color:#ffffff;`;
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td class="checkboxCell" style="display: none;">
                        <input id="checkbox" type="checkbox" class="rowCheckbox" data-id="${item.id}">
                </td>
                <td>${index + 1}</td>
                <td>${item.employeeId}</td>
                <td>${item.rank}</td>
                <td>${item.name}</td>
                <td>${item.gender}</td>
                <td>${item.email}</td>
                <td>${item.contactNumber}</td>
                <td><span class="badge d-flex justify-content-center" style="${itemStatus(item.status)}">${item.status}</span></td>
                <td>
                    <span data-bs-toggle="modal" data-bs-target="#editFirefighterModal">
                        <i class="edit-icon icon-btn icon material-icons ms-3" data-bs-toggle="tooltip"
                            data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                    </span>
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
