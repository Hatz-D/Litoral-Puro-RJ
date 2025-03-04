document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.querySelector("#registerForm");

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.querySelector("#name").value;
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        const confirmPassword = document.querySelector("#confirmPassword").value;

        if (password !== confirmPassword) {
            alert("As senhas não coincidem. Por favor, tente novamente.");
            return;
        }

        // 🔹 Gera hash da senha usando SHA-256
        const passwordHash = await hashPassword(password);

        try {
            const response = await fetch("https://dioguitoposeidon.com.br:8000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password: passwordHash }) // 🔹 Envia a senha como hash
            });

            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem("access_token", data.access_token);
                alert("Registro realizado com sucesso!");
                window.location.href = "/dashboard";
            } else {
                alert("Erro: " + (data.message || "Falha no registro"));
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro de conexão. Por favor, tente novamente.");
        }
    });

    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    }
    
    const userNameElement = document.getElementById("user-name");
    const authButton = document.getElementById("auth-button");

    // Obtém o token do sessionStorage
    const token = sessionStorage.getItem("access_token");

    if (token) {
        try {
            // Decodifica o token JWT para obter as informações do usuário
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userName = payload.name || "Usuário";

            userNameElement.textContent = `Bem-vindo, ${userName}!`;
            authButton.textContent = "Logout";

            // Função de logout
            authButton.onclick = () => {
                sessionStorage.removeItem("access_token");
                alert("Você foi deslogado com sucesso.");
                window.location.href = "/index.html";
            };
        } catch (error) {
            console.error("Erro ao processar token JWT:", error);
            sessionStorage.removeItem("access_token");
            window.location.reload();
        }
    } else {
        // Se não estiver logado, mostra o botão de login
        userNameElement.textContent = "";
        authButton.textContent = "Registrar/Login";
        authButton.onclick = () => {
            window.location.href = "/login/index.html";
        };
    }
});
