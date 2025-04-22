document.addEventListener("DOMContentLoaded", function () {
    const addItemDates = document.getElementById("addDates");
  
    if (addItemDates) {
      const now = new Date();
  
      // Convert to GMT+8 (Manila Time)
      now.setHours(now.getHours() + 8);
  
      // Format as "YYYY-MM-DDTHH:MM" (required for datetime-local input)
      const formattedDateTime = now.toISOString().slice(0, 16);
  
      addItemDates.value = formattedDateTime;
    }
  });
  