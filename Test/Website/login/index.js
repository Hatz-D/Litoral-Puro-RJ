document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.querySelector("#loginForm");

  loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    try {
      const response = await fetch("https://dioguitoposeidon.com.br:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login bem-sucedido!", data);

        // Armazena o nome do usuário no localStorage
        localStorage.setItem("userName", data.user.name);

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
