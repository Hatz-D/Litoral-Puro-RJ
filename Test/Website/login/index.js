
document.addEventListener("DOMContentLoaded", function() {
  // Seleciona o formulário de login
  const loginForm = document.querySelector("form");
  loginForm.addEventListener("submit", async function(event) {
    // Previne o comportamento padrão de envio do formulário
    event.preventDefault();
    // Captura os dados do formulário
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    try {
      // Envia uma requisição POST para a API de login
      const response = await fetch("http://dioguitoposeidon.com.br:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      // Processa a resposta da API
      if (response.ok) {
        const data = await response.json();
        // Sucesso no login: redireciona ou armazena o token
        console.log("Login bem-sucedido!", data);
        // Por exemplo, redireciona o usuário
        window.location.href = "/dashboard";
      } else {
        // Se o login falhar, exibe uma mensagem de erro
        const errorData = await response.json();
        alert("Erro: " + (errorData.message || "Falha no login"));
      }
    } catch (error) {
      // Lida com erros de rede ou outros problemas
      console.error("Erro na requisição:", error);
      alert("Erro de conexão. Por favor, tente novamente.");
    }
  });
});
