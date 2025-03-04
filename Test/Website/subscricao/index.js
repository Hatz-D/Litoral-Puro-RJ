// Verifica se há um nome de usuário armazenado no localStorage
const userName = localStorage.getItem("userName");
const userNameElement = document.getElementById("user-name");
const authButton = document.getElementById("auth-button");

if (userName) {
    userNameElement.textContent = `Bem-vindo, ${userName}!`;
    authButton.textContent = "Logout";
    authButton.onclick = () => {
        localStorage.removeItem("userName");
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

let selectedItems = [];

function fetchData() {
    fetch('https://dioguitoposeidon.com.br:8000/api/data')
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
    dataContainer.innerHTML = '';
            
    if (typeof data === 'string') {
        try {
            data = JSON.parse(data);
        } catch (e) {
            dataContainer.textContent = 'Erro ao processar os dados: formato inválido de JSON.';
            return;
        }
    }

    if (data.Praia && data.Local && data.Qualidade && data.Municipio && data.Data) {
        const table = document.createElement('table');
        table.setAttribute("id", "myTable");
        table.classList.add('data-table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const headers = ['Praia', 'Local', 'Qualidade', 'Municipio', 'Data', 'Selecionar'];

        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        const keys = Object.keys(data.Praia);

        keys.forEach(key => {
            const row = document.createElement('tr');
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

            const selectCell = document.createElement('td');
            const selectButton = document.createElement('button');
            selectButton.textContent = 'Selecionar';
            selectButton.onclick = () => toggleSelection(key, selectButton);
            selectCell.appendChild(selectButton);
            row.appendChild(selectCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        dataContainer.appendChild(table);
    } else {
        dataContainer.textContent = 'Formato inválido: dados incompletos.';
    }
}

function toggleSelection(key, button) {
    const index = selectedItems.indexOf(key);
    if (index > -1) {
        selectedItems.splice(index, 1);
        button.textContent = 'Selecionar';
    } else {
        selectedItems.push(key);
        button.textContent = 'Desmarcar';
    }
    document.getElementById('submit-btn').style.display = selectedItems.length > 0 ? 'block' : 'none';
}

function submitSelections() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        alert('Você precisa estar logado para enviar as seleções.');
        return;
    }

    fetch('https://dioguitoposeidon.com.br:8000/api/save-selections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, selectedItems })
    })
    .then(response => response.json())
    .then(data => {
        alert('Seleções enviadas com sucesso!');
    })
    .catch(error => {
        console.error('Erro ao enviar as seleções:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchData();
});

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
