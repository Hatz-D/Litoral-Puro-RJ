document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.querySelector("#loginForm");

    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;

        // Hashear senha antes do envio (evita envio em plaintext)
        const hashedPassword = sha256(password);

        try {
            const response = await fetch("https://dioguitoposeidon.com.br:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: hashedPassword })
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Login bem-sucedido!", data);

                // Armazena o token JWT no sessionStorage (mais seguro que localStorage)
                sessionStorage.setItem("authToken", data.token);

                // Redireciona para a página inicial
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

    // Gerenciamento de autenticação no frontend
    const authToken = sessionStorage.getItem("authToken");
    const userNameElement = document.getElementById("user-name");
    const authButton = document.getElementById("auth-button");

    if (authToken) {
        fetch("https://dioguitoposeidon.com.br:8000/api/me", {
            headers: { Authorization: `Bearer ${authToken}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.name) {
                userNameElement.textContent = `Bem-vindo, ${data.name}!`;
                authButton.textContent = "Logout";
                authButton.onclick = () => {
                    sessionStorage.removeItem("authToken");
                    window.location.href = "index.html";
                };
            }
        })
        .catch(() => {
            sessionStorage.removeItem("authToken");
        });
    } else {
        authButton.textContent = "Registrar/Login";
        authButton.onclick = () => window.location.href = "/login/index.html";
    }
});
