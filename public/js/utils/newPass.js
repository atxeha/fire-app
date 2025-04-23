document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("toggleIcons").addEventListener("click", (event) => {
        event.preventDefault();
        togglePassword()
    })

    document.getElementById("toggleIconss").addEventListener("click", (event) => {
        event.preventDefault();
        togglePasswords()
    })

    function togglePassword() {
        const passwordInput = document.getElementById("staffPassword");
        const toggleIcon = document.getElementById("toggleIcons");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.textContent = "visibility";
        } else {
            passwordInput.type = "password";
            toggleIcon.textContent = "visibility_off";
        }
    }

    function togglePasswords() {
        const passwordInput = document.getElementById("staffConPassword");
        const toggleIcon = document.getElementById("toggleIconss");
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleIcon.textContent = "visibility";
        } else {
            passwordInput.type = "password";
            toggleIcon.textContent = "visibility_off";
        }
    }

})
