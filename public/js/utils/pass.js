document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("toggleIcon").addEventListener("click", (event) => {
        event.preventDefault();
        togglePassword()
    })

    function togglePassword() {
        const passwordInput = document.getElementById("newPassword");
        const toggleIcon = document.getElementById("toggleIcon");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.textContent = "visibility";
        } else {
            passwordInput.type = "password";
            toggleIcon.textContent = "visibility_off";
        }
    }

})

