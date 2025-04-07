document.addEventListener("DOMContentLoaded", () => {
fetchAndDisplayItems()
    async function fetchAndDisplayItems() {
        console.log("Fetching items...");
        const items = await window.electronAPI.getItems();
        const dataList = document.getElementById("dataList");

        if (!dataList) {
            console.error("Error: Table body element not found!");
            return;
        }
        dataList.innerHTML = ""; // Clears datalist once

        items.forEach((item) => {
          const option = document.createElement("option");
          option.value = item.id;
          option.textContent = item.item_name;
          dataList.appendChild(option); // Adds option without clearing others
        });

    }
})
