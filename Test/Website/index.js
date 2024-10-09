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
  initMap()
}

// Função de inicialização do mapa
function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
      center: { lat: -22.906644821166992, lng: -43.172874450683594 },
      zoom: 10,
  });
}

// Carrega o Google Maps quando o DOM estiver pronto
window.onload = loadGoogleMaps;