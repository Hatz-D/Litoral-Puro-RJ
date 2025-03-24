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

let selectedItems = [];

function fetchData() {
    fetch('https://dioguitoposeidon.com.br:8001/api/data')
    .then(response => response.json())
    .then(data => {
        displayData(data);

        const userEmail = localStorage.getItem("userEmail");
        if (userEmail) {
            fetchSelections(userEmail);
        }
    })
    .catch(error => {
        console.error('Erro ao buscar os dados:', error);
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

    if (Array.isArray(data)) {
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

        data.forEach(item => {
            const row = document.createElement('tr');
            const rowData = [
                item.Praia || 'N/A',
                item.Local || 'N/A',
                item.Qualidade || 'N/A',
                item.Municipio || 'N/A',
                item.Data || 'N/A'
            ];

            rowData.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const selectCell = document.createElement('td');
            const selectButton = document.createElement('button');
            selectButton.textContent = 'Selecionar';
            selectButton.setAttribute("data-id", item.Id);
            selectButton.onclick = () => toggleSelection(item.Id, selectButton);
            selectCell.appendChild(selectButton);
            row.appendChild(selectCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        dataContainer.appendChild(table);
    } else {
        dataContainer.textContent = 'Formato inválido: dados não são uma lista.';
    }
}

function toggleSelection(itemId, button) {
    const index = selectedItems.indexOf(itemId);
    if (index > -1) {
        selectedItems.splice(index, 1);
        button.textContent = 'Selecionar';
        button.classList.remove('selected');
    } else {
        selectedItems.push(itemId);
        button.textContent = 'Desmarcar';
        button.classList.add('selected');
    }
    document.getElementById('submit-btn').style.display = selectedItems.length > 0 ? 'block' : 'none';
}

function submitSelections() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        alert('Você precisa estar logado para enviar as seleções.');
        return;
    }

    fetch('https://dioguitoposeidon.com.br:8002/api/save-selections', {
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

function tableFilter() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("myTable");
    tr = table.getElementsByTagName("tr");

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

function fetchSelections(email) {
    fetch(`https://dioguitoposeidon.com.br:8002/api/get-selections/${email}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.selectedItems) {
                updateUIWithSelections(data.selectedItems);
            }
        })
        .catch(error => console.error("Erro ao buscar seleções:", error));
}

function updateUIWithSelections(selections) {
    selections.forEach(selectionId => {
        const button = document.querySelector(`button[data-id="${selectionId}"]`);
        if (button) {
            button.click();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchData();

    // Adicionando o manipulador de eventos para o filtro
    const input = document.getElementById("myInput");
    input.addEventListener("keyup", tableFilter);

    // Adicionando o manipulador de eventos para o botão de envio
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.addEventListener("click", submitSelections);
});

document.querySelectorAll(".select-button").forEach(button => {
    button.addEventListener("click", function () {
        const itemId = this.getAttribute("data-id");
        this.classList.toggle("selected");

        if (this.classList.contains("selected")) {
            this.textContent = "Selecionado";
            saveSelection(itemId);
        } else {
            this.textContent = "Selecionar";
            removeSelection(itemId);
        }
    });
});
