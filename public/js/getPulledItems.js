const checkboxColumn = document.getElementById("checkboxColumn");

document.addEventListener("DOMContentLoaded", async () => {
    let searchQuery = "";

    fetchAndDisplayItems(searchQuery);

    const label = document.getElementById("label");
    const statusFilter = document.getElementById("statusFilter");
    
    const returnSelected = document.getElementById("returnItem");

    if (statusFilter) {
        statusFilter.addEventListener("change", () => {
            label.textContent = statusFilter.value === "IN_USE" ? "In Use Equipments" : "Returned Equipments"
            returnSelected.textContent = statusFilter.value === "IN_USE" ? "keyboard_return" : "delete"
            fetchAndDisplayItems();
        });
    }

    const backBtn = document.getElementById("backBtn");

    const tableContainer = document.querySelector(".table-container");
    const tableHead = document.querySelector(".table thead");

    const selectAllIcon = document.getElementById("selectAllItem");
    const selectItemIcon = document.getElementById("selectItem");
    const returnForm = document.getElementById("returnForm");
    const returnModal = new bootstrap.Modal(document.getElementById("returnModal"));
    const deleteReturnModal = new bootstrap.Modal(document.getElementById("deleteReturnModal"));
    const returnMultipleModal = new bootstrap.Modal(document.getElementById("returnMultipleModal"));
    const deleteReturnMultipleModal = new bootstrap.Modal(document.getElementById("deleteReturnMultipleModal"));

    const returnMultipleForm = document.getElementById("returnMultipleForm");

    const deleteReturnMultipleForm = document.getElementById("deleteReturnMultipleForm");
    const deleteReturnForm = document.getElementById("deleteReturnForm");

    let ifSelected = false;

    if (selectItemIcon) {
        selectItemIcon.addEventListener("click", () => {
            if (!ifSelected) {
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

        if (returnForm) {
            returnForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const returnId = document.getElementById("returnId").value.trim();

                try {
                    const response = await window.electronAPI.returnEquipment(returnId)

                    if (response.success) {
                        window.electronAPI.showToast(response.message, response.success)

                        returnModal.hide()
                        checkboxColumn.style.display = "none";
                        fetchAndDisplayItems(searchQuery)
                    } else {
                        window.electronAPI.showToast(response.message, response.success)
                    }
                    
                } catch (error) {
                    console.log(error)
                }
            })
        }

        if (returnSelected) {
            returnSelected.addEventListener("click", (event) => {
                const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
                const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));

                if (selectedIds.length === 0) {
                    window.electronAPI.showToast("No items selected.", false);
                    return;
                }
        
                statusFilter.value === "IN_USE" ? returnMultipleModal.show() : deleteReturnMultipleModal.show()
            });
        }
    
        if (returnMultipleForm) {
            returnMultipleForm.addEventListener("submit", async (event) => {
                event.preventDefault();
    
                const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
                const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));
    
                if (selectedIds.length === 0) {
                    window.electronAPI.showToast("No items selected.", false);
                    return;
                }
    
                const response = await window.electronAPI.returnMultipleEquipments( selectedIds );
    
                returnMultipleModal.hide()
                checkboxColumn.style.display = "none";
                fetchAndDisplayItems(searchQuery)
    
                window.electronAPI.showToast(response.message, response.success);
            });
        }
        if (deleteReturnForm) {
            deleteReturnForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const deleteId = document.getElementById("deleteId").value.trim();

                try {
                    const response = await window.electronAPI.deleteReturnEquipment(deleteId)

                    if (response.success) {
                        window.electronAPI.showToast(response.message, response.success)

                        deleteReturnModal.hide()
                        checkboxColumn.style.display = "none";
                        fetchAndDisplayItems(searchQuery)
                    } else {
                        window.electronAPI.showToast(response.message, response.success)
                    }
                    
                } catch (error) {
                    console.log(error)
                }
            })
        }
        if (deleteReturnMultipleForm) {
            deleteReturnMultipleForm.addEventListener("submit", async (event) => {
                event.preventDefault();
        
                const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
                const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));
        
                if (selectedIds.length === 0) {
                    window.electronAPI.showToast("No items selected.", false);
                    return;
                }
        
                const tableName = "equipmentLog";
                const response = await window.electronAPI.deleteSelectedItems(tableName, selectedIds);
                deleteReturnMultipleModal.hide();
                checkboxColumn.style.display = "none";
                window.electronAPI.showToast(response.message, response.success);
                fetchAndDisplayItems(searchQuery);
            });
        }
    };
});

let items = [];

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("return-item")) {
            const itemId = event.target.id.replace("return-", "");

            console.log("Available items:", items);

            const selectedItem = items.find((item) => item.id == itemId);
            
            console.log(selectedItem)
            
            if (selectedItem) {
                document.getElementById("returnId").value = selectedItem.id;
                document.getElementById("equipmentName").textContent = `(${selectedItem.equipment.equipmentName})`;
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-item")) {
            const itemId = event.target.id.replace("delete-", "");

            console.log("Available items:", items);

            const selectedItem = items.find((item) => item.id == itemId);
            
            console.log(selectedItem)
            
            if (selectedItem) {
                document.getElementById("deleteId").value = selectedItem.id;
                document.getElementById("dequipmentName").textContent = `(${selectedItem.equipment.equipmentName})`;
            }
        }
    });
});

document.getElementById("searchPulledItem").addEventListener("input", (event) => {
    searchQuery = event.target.value.trim();
    fetchAndDisplayItems(searchQuery);
});

async function fetchAndDisplayItems(searchQuery = "") {
    try {
        const statusFilter = document.getElementById("statusFilter").value.trim();
        const normalizedStatus = statusFilter.toUpperCase();

        items = await window.electronAPI.getEquipmentLog(normalizedStatus);

        const tableBody = document.getElementById("pulledTableBody");
        const tableHead = document.getElementById("pulledTableHead");
        const pulledTable = document.getElementById("pulledTable");

        tableBody.innerHTML = "";

        const filteredItems = items.filter(item => {
            const itemCodeMatch = item.equipment.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase());

            const itemDate = new Date(item.createdAt)
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
                <td colspan="9" class="text-center text-muted p-3 pt-4"><h6>No equipment found</h6></td>
                </tr>
            `;
            return;
        }

        tableHead.style.display = "table-header-group";

        filteredItems.forEach((item, index) => {
            const row = document.createElement("tr");

            const formattedDate = new Date(statusFilter === "IN_USE" ? item.createdAt : item.returnedAt)
                .toLocaleString("en-PH", {
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
                <td>${item.equipment.equipmentCode}</td>
                <td>${item.equipment.equipmentName}</td>
                <td>${item.quantity}</td>
                <td>${item.equipment.unit}</td>
                <td>${item.releasedBy}</td>
                <td>${item.fireFighter.name}</td>
                <td>${formattedDate}</td>
                <td>
                    <span data-bs-toggle="modal" data-bs-target="${statusFilter === "IN_USE" ? '#returnModal' : '#deleteReturnModal'}">
                        <i id="${statusFilter === "IN_USE" ? `return-${item.id}` : `delete-${item.id}`}" class="icon-btn icon material-icons ms-3 ${statusFilter === "IN_USE" ? `return-item` : `delete-item`}" data-bs-toggle="tooltip"
                            data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Return equipment" style="cursor: pointer;">${statusFilter === "IN_USE" ? 'keyboard_return' : 'delete'}</i>
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
