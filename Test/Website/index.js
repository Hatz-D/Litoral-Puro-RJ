async function loadGoogleMaps() {
  const response = await fetch('https://dioguitoposeidon.com.br:8000/api/map');
  const data = await response.json();

  if (!response.ok) {
      console.error("Erro ao carregar a API do Google Maps");
      return;
  }

  // Injeta o script da API do Google Maps no HTML
  const script = document.createElement('script');
  script.innerHTML = data.script;
  document.head.appendChild(script);
  initMap();
}

// Função de inicialização do mapa
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -22.906644821166992, lng: -43.172874450683594 },
      zoom: 10,
      mapId: "MAP"
  });

  fetchData(map);
}

async function loadMarkers(map, data) {
  const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");

  if (typeof data === 'string') {
    try {
        data = JSON.parse(data);
    } catch (e) {
        dataContainer.textContent = 'Erro ao processar os dados: formato inválido de JSON.';
        return;
    }
}

  const responseCoord = await fetch('https://dioguitoposeidon.com.br:8000/api/coordinates');
  const coords = await responseCoord.json();
  const cleanedString = coords.replace(/^"|"$/g, '').replace(/\\"/g, '"');
  const coordenadas = JSON.parse(cleanedString);
  console.log(typeof coordenadas)

  coordenadas.forEach((coordenada, index) => {
    const latitude = coordenada[0];
    const longitude = coordenada[1];

    const nomePraia = data.Praia[index];
    const localPraia = data.Local[index];
    const qualidade = data.Qualidade[index];
    const municipio = data.Municipio[index];
    const dataAtualizacao = data.Data[index];

    const infoWindowContent = `
      <h1>${nomePraia}</h1>
      <p>${localPraia}</p>
      <p><b>Qualidade da água:</b> ${qualidade}</p>
      <p><b>Município:</b> ${municipio}</p>
      <p><b>Última atualização:</b> ${dataAtualizacao}</p>
    `;

    const greenPin = new google.maps.marker.PinElement({
      background: "#32CD32",
      borderColor: "#008000",
      glyphColor: "#008000",
    });
  
    const greyPin = new google.maps.marker.PinElement({
      background: "#bdbebd",
      borderColor: "#808080",
      glyphColor: "#808080",
    });

    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent,
      ariaLabel: nomePraia,
    });

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: { lat: latitude, lng: longitude },
      title: `${nomePraia} - ${localPraia}`,
    });

    if(qualidade.trim() === 'Propria') {
      marker.content = greenPin.element;
    }

    else if(qualidade.trim() === 'n/a') {
      marker.content = greyPin.element;
    }

    marker.addListener("gmp-click", () => {
      infoWindow.open({
        anchor: marker,
        map,
      });
    });
  });
}

function fetchData(map) {
  fetch('https://dioguitoposeidon.com.br:8000/api/data')
  .then(response => response.json())
  .then(data => {
      loadMarkers(map, data);
  })
  .catch(error => {
      console.error('Erro ao buscar os dados!:', error);
  });
}

// Carrega o Google Maps quando o DOM estiver pronto
window.onload = loadGoogleMaps;
