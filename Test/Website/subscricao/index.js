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
    fetch('https://hatz-d.com.br/praia/praia/data')
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
            selectButton.id = data.Id[key];
            selectButton.setAttribute("data-id", data.Id[key]);
            selectButton.onclick = () => toggleSelection(data.Id[key], selectButton);
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
        button.classList.remove('selected');  // Remover a classe "selected"
    } else {
        selectedItems.push(key);
        button.textContent = 'Desmarcar';
        button.classList.add('selected');  // Adicionar a classe "selected"
    }
    document.getElementById('submit-btn').style.display = selectedItems.length > 0 ? 'block' : 'none';
}

function submitSelections() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
        alert('Você precisa estar logado para enviar as seleções.');
        return;
    }

    fetch('https://hatz-d.com.br/praia/subscricao/save-selections', {
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
    fetch(`https://hatz-d.com.br/praia/subscricao/get-selections/${email}`)
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
