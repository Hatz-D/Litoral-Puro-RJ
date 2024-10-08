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

    // Verifica se os dados são um array
    if (Array.isArray(data)) {
        data.forEach(item => {
            const dataItem = document.createElement('div');
            dataItem.classList.add('data-item');

            // Garante que os campos existam no item antes de acessá-los
            dataItem.textContent = `Praia: ${item.Praia || 'N/A'}, Local: ${item.Local || 'N/A'}, Qualidade: ${item.Qualidade || 'N/A'}, Municipio: ${item.Municipio || 'N/A'}, Data: ${item.Data || 'N/A'}`;

            // Adiciona o elemento ao container
            dataContainer.appendChild(dataItem);
        });
    } else {
        // Mostra uma mensagem se os dados não forem um array
        dataContainer.textContent = 'Os dados fornecidos não são um array válido.';
    }
}
