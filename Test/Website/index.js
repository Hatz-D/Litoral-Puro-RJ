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

    // Verifica se todos os campos necessários existem e são objetos
    if (data.Praia && data.Local && data.Qualidade && data.Municipio && data.Data) {
        // Obtém as chaves numéricas (assumindo que todas têm os mesmos índices)
        const keys = Object.keys(data.Praia);

        // Itera sobre cada índice para montar as informações
        keys.forEach(key => {
            const dataItem = document.createElement('div');
            dataItem.classList.add('data-item');

            // Adiciona as informações ao elemento
            dataItem.textContent = `
                Praia: ${data.Praia[key] || 'N/A'}, 
                Local: ${data.Local[key] || 'N/A'}, 
                Qualidade: ${data.Qualidade[key] || 'N/A'}, 
                Municipio: ${data.Municipio[key] || 'N/A'}, 
                Data: ${data.Data[key] || 'N/A'}
            `;

            // Adiciona o elemento ao container
            dataContainer.appendChild(dataItem);
        });
    } else {
        // Mostra uma mensagem se algum campo estiver faltando
        dataContainer.textContent = 'Formato inválido: dados incompletos.';
    }
}
