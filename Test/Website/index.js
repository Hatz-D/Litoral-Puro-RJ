document.addEventListener('DOMContentLoaded', function() {
    fetchData();
});

function fetchData() {
    fetch('http://dioguitoposeidon.com.br:8000/api/data')
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

    data = JSON.parse(data);

    data.forEach(item => {
        const dataItem = document.createElement('div');
        dataItem.classList.add('data-item');
        dataItem.textContent = `Praia: ${item.Praia}, Local: ${item.Local}, Qualidade: ${item.Qualidade}, Municipio: ${item.Municipio}, Data: ${item.Data}`;
        dataContainer.appendChild(dataItem);
    })
}
