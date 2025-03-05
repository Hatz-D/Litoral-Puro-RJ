// Verifica se há um nome de usuário armazenado no localStorage
const userName = localStorage.getItem("userName");
const userNameElement = document.getElementById("user-name");
const authButton = document.getElementById("auth-button");

if (userName) {
    userNameElement.textContent = `Bem-vindo, ${userName}!`;
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
    const registerForm = document.querySelector("#registerForm");
  
    registerForm.addEventListener("submit", async function(event) {
      event.preventDefault();
  
      // Captura os valores dos campos
      const name = document.querySelector("#name").value;
      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;
      const confirmPassword = document.querySelector("#confirmPassword").value;
  
      // Verifica se a senha e a confirmação coincidem
      if (password !== confirmPassword) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
      }
  
      try {
        // Envia uma requisição POST para a API de registro
        const response = await fetch("https://dioguitoposeidon.com.br:8000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name, email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Registro bem-sucedido!", data);
          alert("Registro realizado com sucesso!");
          localStorage.setItem("userName", data.user.name);
          localStorage.setItem("userEmail", data.user.email);
            
          // Redireciona para a página de login ou dashboard
          window.location.href = "/index.html";
        } else {
          const errorData = await response.json();
          alert("Erro: " + (errorData.message || "Falha no registro"));
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
        alert("Erro de conexão. Por favor, tente novamente.");
      }
    });
  });
  
