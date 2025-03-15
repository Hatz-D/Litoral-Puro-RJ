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

document.addEventListener('DOMContentLoaded', function() {
    fetchData();
});

function fetchData() {
    fetch('https://dioguitoposeidon.com.br:8001/api/data')
    .then(response => response.json())
    .then(data => {
        displayData(data);
    })
    .catch(error => {
        console.error('Erro ao buscar os dados!:', error);
    });
}

function displayData(data) {
    const dataContainer = document.getElementById("data-container");

    // Limpa o conteúdo anterior
    dataContainer.innerHTML = '';

    // Se o dado for uma string, tenta fazer o parse para JSON
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            dataContainer.textContent = 'Erro ao processar os dados: formato inválido de JSON.';
            return;
        }
    }

    // Verifica se todos os campos necessários existem e são objetos
    if (data.Praia && data.Local && data.Qualidade && data.Municipio && data.Data) {
        const table = document.createElement('table');
        table.setAttribute("id", "myTable");
        table.classList.add('data-table');

        // Cria o cabeçalho da tabela
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Define os cabeçalhos das colunas
        const headers = ['Praia', 'Local', 'Qualidade', 'Municipio', 'Data'];

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Cria o corpo da tabela
        const tbody = document.createElement('tbody');

        // Como os dados estão organizados com chaves numéricas, vamos iterar sobre essas chaves
        const keys = Object.keys(data.Praia); // Usando 'Praia' para obter as chaves numéricas

        keys.forEach(key => {
            const row = document.createElement('tr');

            // Cria uma célula para cada coluna (Praia, Local, Qualidade, Municipio, Data)
            const rowData = [
                data.Praia[key] || 'N/A',
                data.Local[key] || 'N/A',
                data.Qualidade[key] || 'N/A',
                data.Municipio[key] || 'N/A',
                data.Data[key] || 'N/A'
            ];

            rowData.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        dataContainer.appendChild(table);  // Adiciona a tabela ao container
    } else {
        dataContainer.textContent = 'Formato inválido: dados incompletos.';
    }
}

function tableFilter() {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
