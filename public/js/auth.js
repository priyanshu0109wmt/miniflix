document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      localStorage.setItem("netflixUser", loginForm.email.value);
      window.location.href = "index.html";
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      localStorage.setItem("netflixUser", signupForm.email.value);
      window.location.href = "index.html";
    });
  }
});
