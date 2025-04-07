const checkboxColumn = document.getElementById("checkboxColumn");

document.addEventListener("DOMContentLoaded", async () => {
    let searchQuery = "";

    fetchAndDisplayItems(searchQuery);

    const addItemForm = document.getElementById("addItemForm");
    const viewPulledItem = document.getElementById("viewPulledItem");
    const viewAddedItem = document.getElementById("viewAddedItem")
    const pullItemForm = document.getElementById("pullItemForm");
    const newQuantityItemForm = document.getElementById("newQuantityItemForm");
    const deleteItemForm = document.getElementById("deleteItemForm");
    const editItemForm = document.getElementById("editItemForm");
    const deleteItemModal = new bootstrap.Modal(document.getElementById("deleteItemModal"));
    const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));
    const pullItemModal = new bootstrap.Modal(document.getElementById("pullItemModal"));
    const updateItemQuantityModal = new bootstrap.Modal(document.getElementById("updateItemQuantityModal"));
    const editItemModal = new bootstrap.Modal(document.getElementById("editItemModal"));
    const deleteAllLogModal = new bootstrap.Modal(document.getElementById("deleteAllLogModal"));

    const deleteAllLog = document.getElementById("deleteAllLogForm");

    const tableContainer = document.querySelector(".table-container");
    const logModal = document.querySelector(".log-modal")
    const logTableHead = document.querySelector(".thead")
    const tableHead = document.querySelector(".table thead");

    const selectAllIcon = document.getElementById("selectAllItem");

    const selectItemIcon = document.getElementById("selectItem");

    const exportButton = document.getElementById("exportItem");
    const importButton = document.getElementById("importItem")
    const deleteSelectedBtn = document.getElementById("deleteSelected")

    if (exportButton) {
        exportButton.addEventListener("click", async () => {
            const checkboxes = document.querySelectorAll(".rowCheckbox:checked");
            const selectedIds = Array.from(checkboxes).map(checkbox => Number(checkbox.dataset.id));

            if (selectedIds.length === 0) {
                window.electronAPI.showToast("No items selected.", false);
                return;
            }
            const tableName = "item"; // Change dynamically based on your UI
            const response = await window.electronAPI.exportItems({ tableName, selectedIds });

            window.electronAPI.showToast(response.message, response.success);
        });
    }

    if (importButton) {
        importButton.addEventListener("click", async () => {
        const response = await window.electronAPI.importItems();

        if (response.success) {
            window.electronAPI.showToast(response.message, true);
            fetchAndDisplayItems();
            return;
        } 
        window.electronAPI.showToast(response.message, false);
        console.log(response.message)
        
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
        });
    };
    
    if (selectAllIcon) {
        selectAllIcon.addEventListener("click", () => {
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
        
        if (viewAddedItem) {
            viewAddedItem.addEventListener("click", (event) => {
                event.preventDefault();
                console.log("asdasds")
                window.electronAPI.navigate("addedItem.html")
            })
        }

        // Only add event listener if form exists
        if (addItemForm) {
            addItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const itemCode = document.getElementById("addItemCode").value.trim().toUpperCase();
                const itemName = capitalizeWords(document.getElementById("addItemName").value.trim());
                const quantity = parseInt(
                document.getElementById("addQuantity").value.trim() || "0",
                10
                );
                const unit = capitalizeWords(document.getElementById("addUnit").value.trim());
                const date = document.getElementById("addDate").value.trim();
                const addedBy = capitalizeWords(document.getElementById("addedBy").value.trim());

                if (!itemCode || !itemName || !quantity || !unit || !date || !addedBy) {
                    window.electronAPI.showToast("All fields are required.", false);
                    return;
                }

                const itemData = {
                    item_code: itemCode,
                    item_name: itemName,
                    quantity: quantity,
                    unit: unit,
                    date: new Date(date),
                    added_by: addedBy,
                };

                console.log("Sending item data:", itemData);

                const response = await window.electronAPI.addItem(itemData);

                // Show success or error toast based on response
                if (response.success) {
                    window.electronAPI.showToast(response.message, true);
                    addItemModal.hide();
                    checkboxColumn.style.display = "none";
                    ifSelected = false;
                    fetchAndDisplayItems(searchQuery);

                    const data = {
                        itemCode: response.item.item_code,
                        itemName: response.item.item_name,
                        addedQuantity: response.item.quantity,
                        unit: response.item.unit,
                        addedBy: response.item.added_by
                    }
                    const logData = {
                        itemId: response.item.id,
                        user: addedBy,
                        log: quantity === 1 ? `Added ${quantity} new ${unit.toLowerCase()} of item` : `Added ${quantity} new ${unit.toLowerCase()}s of item`
                    }

                    try {
                        window.electronAPI.addAddedItem(data);
                    } catch (error) {
                        console.log(error)
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

        if (pullItemForm) {
            pullItemForm.addEventListener("submit", async (event) => {
                event.preventDefault();

                const itemCode = document.getElementById("pullItemCode").value.trim();
                const itemName = document.getElementById("pullItemName").value.trim();
                const quantity = parseInt(document.getElementById("pullQuantity").value.trim() || "0", 10);
                const unit = document.getElementById("pullUnit").value.trim();
                const releasedBy = capitalizeWords(document.getElementById("pullReleasedBy").value.trim());
                const receivedBy = capitalizeWords(document.getElementById("pullReceivedBy").value.trim());

                console.log(itemCode, itemName, unit, quantity, releasedBy, receivedBy)

                if (!itemCode || !releasedBy || !quantity || !receivedBy) {
                    window.electronAPI.showToast("All fields are required.", false);
                    return;
                }

                const pullData = {
                    itemCode: itemCode,
                    itemName: itemName,
                    releasedQuantity: Number(quantity),
                    unit: unit,
                    releasedBy: releasedBy,
                    receivedBy: receivedBy,
                };

                try {
                    const response = await window.electronAPI.pullItem(pullData);

                if (response.success) {
                    window.electronAPI.showToast(response.message, true);
                    pullItemModal.hide();
                    checkboxColumn.style.display = "none";
                    ifSelected = false;
                    fetchAndDisplayItems(searchQuery);

                    const logData = {
                        itemId: response.item.item.id,
                        user: receivedBy,
                        log: quantity === 1 ? `Pulled ${quantity} ${unit.toLowerCase()} of item` : `Pulled ${quantity} ${unit.toLowerCase()}s of item`
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
                    const date = document.getElementById("newQuantityDate").value.trim();
                    const updatedBy = capitalizeWords(document.getElementById("newUpdatedBy").value.trim());

                    if (!itemId || !quantity || !date || !updatedBy) {
                        window.electronAPI.showToast("All fields are required.", false);
                        return;
                    }

                    const newQuantityData = {
                        id: itemId,
                        new_quantity: new Number(quantity),
                        date: new Date(date),
                        updated_by: updatedBy,
                    }

                try {
                    const response = await window.electronAPI.updateItemQuantity(newQuantityData);

                    if (response.success) {
                        window.electronAPI.showToast(response.message, true);
                        updateItemQuantityModal.hide();
                        checkboxColumn.style.display = "none";
                        ifSelected = false;
                        fetchAndDisplayItems(searchQuery);

                        const logData = {
                            itemId: response.item.id,
                            user: updatedBy,
                            log: quantity < 2 ? `Added ${quantity} new ${response.item.unit.toLowerCase()} for item` : `Added ${quantity} new ${response.item.unit.toLowerCase()}s for item`
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
        
                const tableName = "item";
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

                const itemId = document.getElementById("editItemId").value.trim();
                const itemCode = document.getElementById("editItemCode").value.trim().toUpperCase();
                const itemName = capitalizeWords(document.getElementById("editItemName").value.trim());
                const unit = document.getElementById("editUnit").value.trim();

                const item = Number(itemId)

                const newData = {
                        id: item,
                        item_code: itemCode,
                        item_name: itemName,
                        unit: unit,
                    }

                try {
                    const response = await window.electronAPI.editItem(newData)
                    if (response.success) {
                        window.electronAPI.showToast(response.message, true);
                        editItemModal.hide();
                        checkboxColumn.style.display = "none";
                        ifSelected = false;
                        fetchAndDisplayItems(searchQuery);

                        const logData = {
                            itemId: response.item.id,
                            user: "",
                            log: `Updated information of item`
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
    }
});

let items = [];

document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", (event) => {
    if (event.target.classList.contains("pull-item")) {
      const itemId = event.target.id.replace("pull-", "");
      const selectedItem = items.find((item) => item.id == itemId);

      if (selectedItem) {
        document.getElementById("itemCode").textContent = selectedItem.item_code;
        document.getElementById("itemName").textContent = selectedItem.item_name;
        document.getElementById("itemStock").textContent = selectedItem.quantity;
        document.getElementById("pullItemCode").value = selectedItem.item_code;
        document.getElementById("pullItemName").value = selectedItem.item_name;
        document.getElementById("pullUnit").value = selectedItem.unit;
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
                document.getElementById("newItemCode").textContent = selectedItem.item_code;
                document.getElementById("newItemName").textContent = selectedItem.item_name;
                document.getElementById("newItemStock").textContent = selectedItem.quantity;
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
            document.getElementById("editItemCode").value = selectedItem.item_code;
            document.getElementById("editItemName").value = selectedItem.item_name;
            document.getElementById("editItemId").value = selectedItem.id;
            document.getElementById("editUnit").value = selectedItem.unit;
            document.getElementById("editQuantity").value = selectedItem.quantity;
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
    items = await window.electronAPI.getItems();
    const itemTable = document.getElementById("inventoryTable") 
    const tableHead = document.getElementById("itemsTableHead")
    const tableBody = document.getElementById("itemsTableBody");

    tableBody.innerHTML = "";

    const filteredItems = items.filter(item => {
        const itemCodeMatch = item.item_code.toLowerCase().includes(searchQuery.toLowerCase());

        const itemDate = new Date(item.date)
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
            <td colspan="9" class="text-center text-muted p-3 pt-4"><h6>No item found</h6></td>
            </tr>
        `;
      return;
    }

    tableHead.style.display = "table-header-group";

    filteredItems.forEach((item, index) => {
      const row = document.createElement("tr");

      row.setAttribute("style", "border-radius: 10px !important;")

      const formattedDate = new Date(item.updatedAt)
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
        <td>${item.item_code}</td>
        <td>${item.item_name}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${formattedDate}</td>
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
                    data-bs-placement="top" data-bs-custom-class="custom-tooltip" title="Pull item"
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
