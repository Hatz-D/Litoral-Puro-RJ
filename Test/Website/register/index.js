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
        const response = await fetch("http://dioguitoposeidon.com.br:8000/api/register", {
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
          // Redireciona para a página de login ou dashboard
          window.location.href = "/login";
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
  
