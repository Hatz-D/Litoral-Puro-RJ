// Verifica se há um nome de usuário armazenado no localStorage
const userName = localStorage.getItem("userName");
const userNameElement = document.getElementById("user-name");
const authButton = document.getElementById("auth-button");

if (userName) {
    userNameElement.textContent = `Bem-vindo(a), ${userName}!`;
    authButton.textContent = "Logout";
    authButton.onclick = () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        userNameElement.textContent = '';
        authButton.textContent = "Registrar/Login";
        alert("Você foi deslogado com sucesso.");
        window.location.href = "index.html";
    };
} else {
    userNameElement.textContent = '';
    authButton.textContent = "Registrar/Login";
    authButton.onclick = () => {
        window.location.href = "/login/index.html";
    };
}

document.addEventListener("DOMContentLoaded", function() {
  // TODO
});
