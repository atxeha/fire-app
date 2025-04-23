const checkboxColumn = document.getElementById("checkboxColumn");
const user = JSON.parse(localStorage.getItem("activeUser"));

document.addEventListener("DOMContentLoaded", async () => {

    if (!user) {
        window.electronAPI.navigate("login.html");
        return;
    }

    const loginMessage = localStorage.getItem("loginMessage");

    if (loginMessage) {
        
        window.electronAPI.showToast(loginMessage, true);

        localStorage.removeItem("loginMessage");
    }

    let searchQuery = "";

    let isAdmin = !user.isStaff

    getFirefighterList()
    fetchAndDisplayItems(searchQuery);

    const updateAccountForm = document.getElementById("updateAccountForm");
    const addItemForm = document.getElementById("addItemForm");
    const addFirefighterForm = document.getElementById("addFirefighterForm")
    const viewPulledItem = document.getElementById("viewPulledItem");
    const pullItemForm = document.getElementById("pullItemForm");
    const newQuantityItemForm = document.getElementById("newQuantityItemForm");
    const deleteItemForm = document.getElementById("deleteItemForm");
    const editItemForm = document.getElementById("editItemForm");
    const viewFirefighter = document.getElementById("viewFirefighter");
    const deleteItemModal = new bootstrap.Modal(document.getElementById("deleteItemModal"));
    const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));
    const pullItemModal = new bootstrap.Modal(document.getElementById("pullItemModal"));
    const updateItemQuantityModal = new bootstrap.Modal(document.getElementById("updateItemQuantityModal"));
    const editItemModal = new bootstrap.Modal(document.getElementById("editItemModal"));
    const deleteAllLogModal = new bootstrap.Modal(document.getElementById("deleteAllLogModal"));
    const addFirefighterModal = new bootstrap.Modal(document.getElementById("addFirefighterModal"));

    const deleteAllLog = document.getElementById("deleteAllLogForm");

    const tableContainer = document.querySelector(".table-container");
    const logModal = document.querySelector(".log-modal")
    const logTableHead = document.querySelector(".thead")
    const tableHead = document.querySelector(".table thead");

    const selectAllIcon = document.getElementById("selectAllItem");

    const selectItemIcon = document.getElementById("selectItem");

    const exportButton = document.getElementById("exportItem");
    const deleteSelectedBtn = document.getElementById("deleteSelected")

    const select = document.getElementById("pullfireFighterId");

    const firefighterList = document.getElementById("firefighterList");
    const addStaffAccountForm = document.getElementById("addStaffAccountForm");
    const addStaffAccountModal = new bootstrap.Modal(document.getElementById("addStaffAccountModal"));

    async function getFirefighterList() {
        const response = await window.electronAPI.getFirefighters();
        if (response.success) {
            response.data.forEach((firefighter) => {
            const option = document.createElement("option");
            option.value = firefighter.id;
            option.textContent = `${firefighter.name} (${firefighter.status})`;
            select.appendChild(option);
            });
        } else {
            console.error("Failed to load firefighters:", response.message);
        }
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {

            localStorage.setItem("logoutMessage", "logout successful.");
            localStorage.removeItem("activeUser");
            localStorage.removeItem("loginMessage");

            await window.electronAPI.navigate("login.html")
        })
    }

    if (exportButton) {
        exportButton.addEventListener("click", async () => {
            const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
            const selectedIds = Array.from(checkboxes).map(checkbox => String(checkbox.dataset.id));

            if (selectedIds.length === 0) {
                window.electronAPI.showToast("No items selected.", false);
                return;
            }
            const tableName = "equipment"; // Change dynamically based on your UI
            const response = await window.electronAPI.exportItems({ tableName, selectedIds });

            window.electronAPI.showToast(response.message, response.success);
        });
    }

    document.getElementById("searchItem").addEventListener("input", (event) => {
        searchQuery = event.target.value.trim();
        fetchAndDisplayItems(searchQuery);
    });

    let ifSelected = false;

    if (selectItemIcon) {
        selectItemIcon.addEventListener("click", () => {
            if (!ifSelected) {
                const checkboxCells = document.querySelectorAll(".checkboxCell input");
                const rows = document.querySelectorAll("#itemsTableBody tr");

                if (checkboxCells.length > 0) {
                    const isCurrentlyHidden = checkboxColumn.style.display === "none";

                    // Toggle visibility of checkboxes
                    checkboxColumn.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    checkboxColumn.style.opacity = 0

                    checkboxCells.forEach((checkbox, index) => {
                        checkbox.parentElement.style.display = isCurrentlyHidden ? "table-cell" : "none";

                        // Highlight rows if checkboxes are checked
                    if (!isCurrentlyHidden) {
                        rows[index].classList.remove("selected-row");
                        checkbox.checked = isCurrentlyHidden;
                    };
                    });
                };
            };
            console.log("one", ifSelected)
        });
    };
    
    if (selectAllIcon) {
        selectAllIcon.addEventListener("click", () => {
            if (ifSelected && selectItemIcon) {
                selectItemIcon.click();
            }

            const checkboxCells = document.querySelectorAll(".checkboxCell input");
            const rows = document.querySelectorAll("#itemsTableBody tr");

            if (checkboxCells.length > 0) {
                const isCurrentlyHidden = checkboxColumn.style.display === "none";

                // Toggle visibility of checkboxes
                checkboxColumn.style.display = isCurrentlyHidden ? "table-cell" : "none";
                checkboxColumn.style.opacity = 0

                checkboxCells.forEach((checkbox, index) => {
                    checkbox.parentElement.style.display = isCurrentlyHidden ? "table-cell" : "none";
                    checkbox.checked = isCurrentlyHidden; // Check all when showing, uncheck when hiding

                    // Highlight rows if checkboxes are checked
                    if (isCurrentlyHidden) {
                        rows[index].classList.add("selected-row");
                        ifSelected = true;
                    } else {
                        rows[index].classList.remove("selected-row");
                        ifSelected = false;
                    };
                });
            };
            console.log("all", ifSelected)
        });
    };

    // Handle individual row selection
    document.addEventListener("change", (event) => {
        if (event.target.classList.contains("rowCheckbox")) {
            const row = event.target.closest("tr");
            if (event.target.checked) {
                row.classList.add("selected-row");
            } else {
                row.classList.remove("selected-row");
            };
        };
    });

    if (tableContainer && tableHead) {
        tableContainer.addEventListener("scroll", function () {

            tableContainer.classList.add("scrolling");

            // Remove the class after 1 second if no more scrolling
            clearTimeout(tableContainer.scrollTimeout);
            tableContainer.scrollTimeout = setTimeout(() => {
                tableContainer.classList.remove("scrolling");
            }, 400);

            if (tableContainer.scrollTop > 0) {
                tableHead.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.1)";
            } else {
                tableHead.style.boxShadow = "none";
            };
        });
    };
    if (logModal) {
        logModal.addEventListener("scroll", function () {

            logModal.classList.add("scrolling");

            // Remove the class after 1 second if no more scrolling
            clearTimeout(logModal.scrollTimeout);
            logModal.scrollTimeout = setTimeout(() => {
                logModal.classList.remove("scrolling");
            }, 400);

            if (logModal.scrollTop > 0) {
                logTableHead.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.1)";
            } else {
                logTableHead.style.boxShadow = "none";
            };
        });
    };

    function capitalizeWords(str) {
        return str
            .toLowerCase() // Convert entire string to lowercase first
            .split(" ") // Split into words
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
            .join(" "); // Join words back into a string
    }

    // Check if API exists before calling
    if (window.electronAPI) {
        console.log("Electron API Loaded!");
        if (viewPulledItem) {
            viewPulledItem.addEventListener("click", (event) => {
                event.preventDefault();
                window.electronAPI.navigate("pulledItem.html");
            });
        } 
        
        if (viewFirefighter) {
            viewFirefighter.addEventListener("click", (event) => {
                event.preventDefault();
                window.electronAPI.navigate("firefighter.html")
            })
        }

        if (firefighterList) {
            firefighterList.addEventListener("click", (event) => {
                event.preventDefault();
                window.electronAPI.navigate("firefighter.html")
            })
        }

        if (addItemForm) {
            addItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const equipmentCode = document.getElementById("equipmentCode").value.trim().toUpperCase();
                const equipmentName = capitalizeWords(document.getElementById("equipmentName").value.trim());
                const quantity = parseInt(
                document.getElementById("quantity").value.trim() || "0",
                10
                );
                const unit = capitalizeWords(document.getElementById("unit").value.trim());
                // const date = document.getElementById("addDate").value.trim();
                const activeUser = user.id;

                if (!equipmentCode || !equipmentName || !quantity || !unit) {
                    window.electronAPI.showToast("All fields are required.", false);
                    return;
                }

                const equipmentData = {
                    equipmentCode: equipmentCode,
                    equipmentName: equipmentName,
                    quantity: quantity,
                    unit: unit,
                    userId: activeUser,
                };

                console.log("Sending item data:", equipmentData);

                const response = await window.electronAPI.addEquipment(equipmentData);

                // Show success or error toast based on response
                if (response.success) {
                    window.electronAPI.showToast(response.message, true);
                    addItemModal.hide();
                    checkboxColumn.style.display = "none";
                    ifSelected = false;
                    fetchAndDisplayItems(searchQuery);

                    const logData = {
                        userId: user.id,
                        log: `Added new equipment: ${quantity} new ${quantity < 2 ? `${unit.toLowerCase()}` : `${unit.toLowerCase()}s`} of (${equipmentName}).`
                    }

                    try {
                        window.electronAPI.addLog(logData);
                    } catch (error) {
                        console.log(error)
                    }

                } else {
                    window.electronAPI.showToast(response.message, false);
                }
            });
        }

        if (addFirefighterForm) {
            addFirefighterForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const employeeId = parseInt(document.getElementById("employeeId").value.trim() || "0", 10);
                const name = capitalizeWords(document.getElementById("name").value.trim());
                const gender = document.getElementById("gender").value.trim().toUpperCase();
                const rank = document.getElementById("rank").value.trim().toUpperCase();
                const contactNumber = parseInt(document.getElementById("contactNumber").value.trim() || "0", 10);
                const email = document.getElementById("email").value.trim();
                const address = capitalizeWords(document.getElementById("address").value.trim());
                const status = document.getElementById("status").value.trim().toUpperCase();

                if (!employeeId || !name || !gender || !rank || !contactNumber || !address || !status) {
                    window.electronAPI.showToast("All fields are required.", false);
                    return;
                }

                const data = {
                    employeeId,
                    name,
                    gender,
                    rank,
                    contactNumber,
                    email,
                    address,
                    status
                }

                const response = await window.electronAPI.addFirefighter(data);
                if (response.success) {
                    window.electronAPI.showToast(response.message, true);
                    addFirefighterModal.hide()
                    select.innerHTML = ``;
                    getFirefighterList()

                    const logData = {
                        userId: user.id,
                        log: `Added new firefighter: (${response.newFirefighter.rank}. ${response.newFirefighter.name}).`
                    }

                    try {
                        window.electronAPI.addLog(logData);
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    window.electronAPI.showToast(response.message, false);
                }
            })
        }

        if (pullItemForm) {
            pullItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const equipmentId = document.getElementById("pullEquipmentId").value.trim();
                const fireFighterId = document.getElementById("pullfireFighterId").value.trim();
                const releasedBy = capitalizeWords(document.getElementById("pullReleasedBy").value.trim());
                const quantity = parseInt(document.getElementById("pullQuantity").value.trim() || "0", 10);

                console.log(equipmentId, releasedBy, quantity, fireFighterId)

                if (!equipmentId || !releasedBy || !quantity || !fireFighterId) {
                    window.electronAPI.showToast("All fields are required.", false);
                    return;
                }

                const pullData = {
                    equipmentId: equipmentId,
                    fireFighterId: fireFighterId,
                    releasedBy: releasedBy,
                    quantity: quantity,
                };

                try {
                    const response = await window.electronAPI.pullEquipment(pullData);
                    console.log(response)

                if (response.success) {
                    window.electronAPI.showToast(response.message, true);
                    pullItemModal.hide();
                    checkboxColumn.style.display = "none";
                    ifSelected = false;
                    fetchAndDisplayItems(searchQuery);

                    const logData = {
                        userId: user.id,
                        log: `Pulled an equipment: ${quantity} ${quantity > 1 ? `${response.item.item.unit}s` : `${response.item.item.unit}`} of (${response.item.item.equipmentName})`
                    }
                    try {
                        window.electronAPI.addLog(logData);
                    } catch (error) {
                        console.log(error)
                    }
                } else {
                    window.electronAPI.showToast(response.message.message, false);
                }
                } catch (error) {
                    window.electronAPI.showToast(error.message, false);
                }
            });
        }
        if (newQuantityItemForm) {
            newQuantityItemForm.addEventListener("submit", async (event) => {
                    event.preventDefault();

                    const itemId = document.getElementById("newQuantityItemId").value.trim();
                    const quantity = document.getElementById("newQuantity").value.trim();

                    if (!itemId || !quantity) {
                        window.electronAPI.showToast("All fields are required.", false);
                        return;
                    }

                    const newQuantityData = {
                        id: itemId,
                        new_quantity: new Number(quantity),
                    }

                try {
                    const response = await window.electronAPI.updateEquipmentQuantity(newQuantityData);

                    if (response.success) {
                        window.electronAPI.showToast(response.message, true);
                        updateItemQuantityModal.hide();
                        checkboxColumn.style.display = "none";
                        ifSelected = false;
                        fetchAndDisplayItems(searchQuery);

                        const logData = {
                            userId: user.id,
                            log: `Quantity updated: Added ${quantity} ${quantity < 2 ? `${response.equipment.unit.toLowerCase()}` : `${response.equipment.unit.toLowerCase()}s`} of (${response.equipment.equipmentName})`
                    }
                        try {
                            window.electronAPI.addLog(logData);
                            console.log("quantity log saved")
                        } catch (error) {
                            console.log(error)
                        }
                    } else {
                        window.electronAPI.showToast(response.message, false);
                    }
                } catch (error) {
                    console.error("Error pulling item:", error);
                }
            })
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
        
                const tableName = "equipment";
                const response = await window.electronAPI.deleteSelectedItems(tableName, selectedIds);
        
                document.getElementById("checkboxColumn").style.display = "none";
        
                window.electronAPI.showToast(response.message, response.success);
                fetchAndDisplayItems(searchQuery);
                deleteItemModal.hide();
            });
        }
        if (editItemForm) {
            editItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const equipmentId = document.getElementById("editEquipmentId").value.trim();
                const equipmentCode = document.getElementById("editEquipmentCode").value.trim().toUpperCase();
                const equipmentName = capitalizeWords(document.getElementById("editEquipmentName").value.trim());
                const unit = document.getElementById("editUnit").value.trim();
                const status = document.getElementById("editStatus").value.trim();

                const newData = {
                        id: equipmentId,
                        equipmentCode: equipmentCode,
                        equipmentName: equipmentName,
                        unit: unit,
                        status: status,
                    }

                try {
                    const response = await window.electronAPI.editEquipment(newData)
                    if (response.success) {
                        window.electronAPI.showToast(response.message, true);
                        editItemModal.hide();
                        checkboxColumn.style.display = "none";
                        ifSelected = false;
                        fetchAndDisplayItems(searchQuery);

                        const oldEquipment = response.equipment
                        const newEquipment = response.newEquipment

                        const changes = {};
                        
                        for (const key in newEquipment) {
                            if (key === 'createdAt' || key === 'updatedAt') continue;
                          
                            if (oldEquipment[key] !== newEquipment[key]) {
                          
                              changes[key] = {
                                old: oldEquipment[key],
                                new: newEquipment[key]
                              };
                            }
                          }
                          const fieldNameMap = {
                            equipmentCode: "Code",
                            equipmentName: "Equipment",
                            unit: "Unit",
                            status: "Status",
                          };
                          
                          const formattedFields = `(${Object.entries(changes)
                            .map(([key]) => fieldNameMap[key] || key)
                            .join(", ")})`;

                        const logData = {
                            userId: user.id,
                            log: `${Object.keys(changes).length} ${Object.keys(changes).length < 2 ? "field" : "fields"} updated in (${oldEquipment.equipmentName}). ${Object.keys(changes).length < 2 ? "Field" : "Fields"}${formattedFields}`
                        }
                        try {
                            window.electronAPI.addLog(logData);
                            console.log("quantity log saved")
                        } catch (error) {   
                            console.log(error)
                        }
                    } else {
                      window.electronAPI.showToast(response.message, false);
                    }
                } catch (error) {
                    return;
                }
            })
        }
        if (deleteAllLog) {
            deleteAllLog.addEventListener("submit", async (event) => {
                event.preventDefault();

                const response = await window.electronAPI.deleteAllLogs();

                console.log(response)

                if (response.success) {
                    window.electronAPI.showToast(response.message, true)
                    deleteAllLogModal.hide();
                } else {
                    window.electronAPI.showToast(response.message, false)
                }
            })
        }
        if (updateAccountForm) {
            updateAccountForm.addEventListener("submit", async (e) => {
                e.preventDefault();
        
                const username = document.getElementById("username").value.trim();
                const oldPassword = document.getElementById("oldPassword").value.trim();
                const newPassword = document.getElementById("newPassword").value.trim();

                const addBtn = document.getElementById("addStaffAccount")

                if (addBtn) {
                    addBtn.addEventListener("click", () => {
                        updateAccountForm.reset()
                    })
                }
        
                if (!username || !oldPassword || !newPassword) {
                    window.electronAPI.showToast("Please fill in all fields.", false);
                    return;
                }
        
                const response = await window.electronAPI.updateAdminAccount({
                    username,
                    oldPassword,
                    newPassword
                });
        
                window.electronAPI.showToast(response.message, response.success);
        
                if (response.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById("updateAccountModal"));
                    modal.hide();
                    updateAccountForm.reset();
                }
            });
        }
        if (addStaffAccountForm) {
            addStaffAccountForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const name = capitalizeWords(document.getElementById("staffName").value.trim());
                const username = document.getElementById("staffUsername").value.trim();
                const isStaff = parseInt(document.getElementById("isStaff").value.trim());
                const staffPassword = document.getElementById("staffPassword").value.trim();
                const staffConPassword = document.getElementById("staffConPassword").value.trim();

                if (!name || !username || !staffPassword || !staffConPassword) {
                    window.electronAPI.showToast("All fields are required.");
                    return;
                }

                const data = {
                    name,
                    username,
                    isStaff: Boolean(isStaff),
                    staffPassword,
                    staffConPassword,
                }

                try {
                    const response = await window.electronAPI.createAccount(data)

                    if (!response.success){
                        window.electronAPI.showToast(response.message, response.success);
                        return;
                    }

                    window.electronAPI.showToast(response.message, response.success);
                    addStaffAccountModal.hide();
                    fetchAndDisplayItems(searchQuery)
                } catch (err) {

                }
            })
        }
    }
});

let items = [];

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("pull-item")) {
      const itemId = event.target.id.replace("pull-", "");
      const selectedItem = items.find((item) => item.id == itemId);

      if (selectedItem) {
        document.getElementById("itemCode").textContent = selectedItem.equipmentCode;
        document.getElementById("itemName").textContent = selectedItem.equipmentName;
        document.getElementById("itemStock").textContent = selectedItem.quantity;

        document.getElementById("pullReleasedBy").value = user.name
        document.getElementById("pullEquipmentId").value = selectedItem.id;
      }
    }
  });

});

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", (event) => {
        if (event.target.classList.contains("new-quantity")) {
            
            const itemId = event.target.id.replace("new-quantity-", "");
            const selectedItem = items.find((item) => item.id == itemId);

            if (selectedItem) {
                document.getElementById("newEquipmentCode").textContent = selectedItem.equipmentCode;
                document.getElementById("newEquipmentName").textContent = selectedItem.equipmentName;
                document.getElementById("newEquipmentStock").textContent = selectedItem.quantity;
                document.getElementById("newQuantityItemId").value = selectedItem.id;
            }
        }
    });
});


document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("edit-item")) {
      const itemId = event.target.id.replace("edit-", "");
      const selectedItem = items.find((item) => item.id == itemId);

        if (selectedItem) {
            document.getElementById("editEquipmentCode").value = selectedItem.equipmentCode;
            document.getElementById("editEquipmentName").value = selectedItem.equipmentName;
            document.getElementById("editEquipmentId").value = selectedItem.id;
            document.getElementById("editUnit").value = selectedItem.unit;
            document.getElementById("editStatus").value = selectedItem.status;
      }
    }
  });
});

document.getElementById("searchItem").addEventListener("input", (event) => {
  const searchQuery = event.target.value.trim();
  fetchAndDisplayItems(searchQuery);
});

async function fetchAndDisplayItems(searchQuery = "") {
  try {
    items = await window.electronAPI.getEquipmentList();
    const itemTable = document.getElementById("inventoryTable") 
    const tableHead = document.getElementById("itemsTableHead")
    const tableBody = document.getElementById("itemsTableBody");

    tableBody.innerHTML = "";

    const filteredItems = items.filter(item => {
        const itemCodeMatch = item.equipmentCode.toLowerCase().includes(searchQuery.toLowerCase());

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
        itemTable.classList.remove("table-hover");
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
        
        function itemStatus(status) {
            const colorMap = {
                ACTIVE: "#5ac072",
                IN_REPAIR: "#ff9e4e",
                RETIRED: "#6c757d",
                LOST: "#db5a67",
            };
            return `background-color: ${colorMap[status] || "#000"}; color:#ffffff;`;
        }
        
        const row = document.createElement("tr");

        row.setAttribute("style", "border-radius: 10px !important;")

        const formattedDate = new Date(item.createdAt)
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
                <input type="checkbox" class="rowCheckbox" data-id="${item.id}">
            </td>
            <td>${index + 1}</td>
            <td>${item.equipmentCode}</td>
            <td>${item.equipmentName}</td>
            <td>${item.quantity}</td>
            <td>${item.unit}</td>
            <td>${formattedDate}</td>
            <td>${item.user.name}</td>
            <td><span class="badge d-flex justify-content-center" style="${itemStatus(item.status)}">${item.status}</span></td>
            <td class="actions">
                <span data-bs-toggle="modal" data-bs-target="#editItemModal">
                    <i id="edit-${item.id}" class="edit-icon icon-btn icon material-icons edit-item" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Edit">edit</i>
                </span>
                <span data-bs-toggle="modal" data-bs-target="#updateItemQuantityModal">
                <i id="new-quantity-${
                    item.id
                }" class="ms-1 icon-btn icon material-icons new-quantity" data-bs-toggle="tooltip"
                    data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Add stock"
                    style="cursor:pointer;">add</i>
                </span>
                <span data-bs-toggle="modal" data-bs-target="#pullItemModal">
                    <i id="pull-${
                    item.id
                    }" class="ms-1 icon-btn icon material-icons pull-item" data-bs-toggle="tooltip"
                        data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Use item"
                        style="cursor:pointer;">arrow_outward</i>
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
    console.log("Items loaded successfully!");
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

