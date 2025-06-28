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
  const loginForm = document.querySelector("#loginForm");

  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
      const response = await fetch("https://hatz-d.com.br/usuario/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login bem-sucedido!", data);

        // Armazena o nome do usuário e email no localStorage
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);

        // Redireciona para a página inicial (index.html)
        window.location.href = "/index.html";
      } else {
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha no login"));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro de conexão. Por favor, tente novamente.");
    }
  });
});
