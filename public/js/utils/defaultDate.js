document.addEventListener("DOMContentLoaded", function () {
  const addItemDate = document.getElementById("addDate");
  const pullItemDate = document.getElementById("pullDate");
  const updateItemDate = document.getElementById("newQuantityDate");

  if (addItemDate && pullItemDate && updateItemDate) {
    const now = new Date();

    // Convert to GMT+8 (Manila Time)
    now.setHours(now.getHours() + 8);

    // Format as "YYYY-MM-DDTHH:MM" (required for datetime-local input)
    const formattedDateTime = now.toISOString().slice(0, 16);

    addItemDate.value = formattedDateTime;
    pullItemDate.value = formattedDateTime;
    updateItemDate.value = formattedDateTime;
  }
});
