document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.querySelector("#loginForm");
  
  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    try {
      // Envia a requisição de login para a API
      const response = await fetch("http://dioguitoposeidon.com.br:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login bem-sucedido!", data);
        
        // Exibe o nome do usuário no frontend
        const userName = data.user.name;
        document.getElementById("user-info").style.display = "block"; // Exibe a área com o nome
        document.getElementById("username").textContent = userName; // Define o nome no frontend
        
        // Redireciona para o dashboard
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
