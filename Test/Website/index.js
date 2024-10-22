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

  loadMarkers(map);
}

async function loadMarkers(map) {
  const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");

  const greenPin = new google.maps.marker.PinElement({
    background: "#32CD32",
    borderColor: "#008000",
    glyphColor: "#008000",
  });

  const arpoadorInfo = new google.maps.InfoWindow({
    content: "<h1>Arpoador</h1><p>Canto esquerdo da praia</p>",
    ariaLabel: "Arpoador",
  });

  const arpoadorMarker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: -22.988550, lng: -43.193981 },
    title: "Arpoador",
    content: greenPin.element,
  });

  arpoadorMarker.addListener("gmp-click", () => {
    arpoadorInfo.open({
      anchor: arpoadorMarker,
      map,
    });
  });

  const tijucaAyrtonInfo = new google.maps.InfoWindow({
    content: "<h1>Barra da Tijuca</h1><p>Em frente a Avenida Ayrton Senna</p>",
    ariaLabel: "Barra da Tijuca Ayrton Senna",
  });

  const tijucaAyrtonMarker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: { lat: -23.011334, lng: -43.366277 },
    title: "Barra da Tijuca Ayrton Senna",
  });

  tijucaAyrtonMarker.addListener("gmp-click", () => {
    tijucaAyrtonInfo.open({
      anchor: tijucaAyrtonMarker,
      map,
    });
  });

}

// Carrega o Google Maps quando o DOM estiver pronto
window.onload = loadGoogleMaps;