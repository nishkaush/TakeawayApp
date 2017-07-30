const signupSection = document.querySelector(".signup-input-section");
const loginSection = document.querySelector(".login-input-section");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginBtn = document.querySelector('button[name="loginBtn"]');
const signupBtn = document.querySelector('button[name="signupBtn"]');
const fbLogin = document.getElementById("fb-login");
const googleLogin = document.getElementById("google-login");

if (signupTab) {
    signupTab.classList.add("colorToTabs");

    signupTab.addEventListener("click", function() {
        signupSection.style.display = "block";
        loginSection.style.display = "none";
        loginTab.classList.remove("colorToTabs");
        signupTab.classList.add("colorToTabs");
    });
}


if (loginTab) {
    loginTab.addEventListener("click", function() {
        loginSection.style.display = "block";
        signupSection.style.display = "none";
        loginTab.classList.add("colorToTabs");
        signupTab.classList.remove("colorToTabs");
    });
}


if (fbLogin) {
    fbLogin.addEventListener("click", function() {
        window.location = "/auth/facebook";
    });
}

if (googleLogin) {
    googleLogin.addEventListener("click", function() {
        window.location = "/auth/google";
    });
}
