async function loadGoogleMaps() {
  const response = await fetch('http://dioguitoposeidon.com.br:8000/api/map');
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

  const coordenadas = JSON.parse("[[-22.98855, -43.193981], [-23.011334, -43.366277], [-23.011135, -43.335107], [-23.015383, -43.303935], [-23.016103, -43.297668], [-23.068052, -43.567816], [-22.945311, -43.18059], [-22.943248, -43.179182], [-22.985577, -43.188452], [-22.981945, -43.189236], [-22.973637, -43.184518], [-22.969771, -43.180013], [-22.988399, -43.189382], [-22.935312, -43.171021], [-22.928934, -43.170858], [-23.048297, -43.514021], [-23.048404, -43.52347], [-22.987135, -43.214321], [-22.987062, -43.209284], [-22.987171, -43.205046], [-23.014608, -43.290439], [-22.988491, -43.226842], [-22.987658, -43.222237], [-22.987056, -43.217069], [-22.963631, -43.167763], [-23.000519, -43.269344], [-23.031927, -43.472914], [-23.031481, -43.477817], [-23.04091, -43.505312], [-23.02697, -43.460558], [-23.023483, -43.44962], [-23.013437, -43.394248], [-23.016061, -43.412101], [-23.030398, -43.468566], [-22.99984, -43.264822], [-22.998808, -43.254686], [-22.94778, -43.163434], [-22.955202, -43.16463], [-22.992147, -43.232502]]")

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
  fetch('http://dioguitoposeidon.com.br:8000/api/data')
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