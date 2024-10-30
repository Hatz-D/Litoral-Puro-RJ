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

  const coordenadas = JSON.parse("[[-22.98855, -43.193981], [-23.011334, -43.366277], [-23.011135, -43.335107], [-23.015383, -43.303935], [-23.016103, -43.297668], [-23.068052, -43.567816], [-22.945311, -43.18059], [-22.943248, -43.179182], [-22.985577, -43.188452], [-22.981945, -43.189236], [-22.973637, -43.184518], [-22.969771, -43.180013], [-22.988399, -43.189382], [-22.935312, -43.171021], [-22.928934, -43.170858], [-23.048297, -43.514021], [-23.048404, -43.52347], [-22.987135, -43.214321], [-22.987062, -43.209284], [-22.987171, -43.205046], [-23.014608, -43.290439], [-22.988491, -43.226842], [-22.987658, -43.222237], [-22.987056, -43.217069], [-22.963631, -43.167763], [-23.000519, -43.269344], [-23.031927, -43.472914], [-23.031481, -43.477817], [-23.04091, -43.505312], [-23.02697, -43.460558], [-23.023483, -43.44962], [-23.013437, -43.394248], [-23.016061, -43.412101], [-23.030398, -43.468566], [-22.99984, -43.264822], [-22.998808, -43.254686], [-22.94778, -43.163434], [-22.955202, -43.16463], [-22.992147, -43.232502], [-22.927626, -43.12282], [-22.907944, -43.128484], [-22.9614, -43.05785], [-22.967289, -43.047984], [-22.917774, -43.095007], [-22.931175, -43.098026], [-22.935882, -43.105497], [-22.929612, -43.122534], [-22.905242, -43.124361], [-22.905536, -43.121097], [-22.902013, -43.136131], [-22.904368, -43.117677], [-22.904528, -43.116037], [-22.908394, -43.111872], [-22.911031, -43.110118], [-22.974364, -43.035325], [-22.975522, -43.029958], [-22.973183, -43.045769], [-22.969088, -43.046698], [-22.934583, -43.112956], [-22.933528, -43.113526], [-22.953037, -43.098046], [-22.953771, -43.095353], [-22.95449, -43.087722], [-22.95606, -43.075214], [-22.915697, -43.095428], [-22.918544, -43.094746], [-22.921136, -43.09483], [-22.939521, -42.036254], [-23.23971, -44.634063], [-23.206294, -44.717749], [-23.04534, -44.595303], [-23.047583, -44.570481], [-23.178219, -44.71092], [-23.35421, -44.724678], [-23.347207, -44.719394], [-22.956946, -42.698192], [-22.969408, -42.979144], [-22.970336, -42.961642], [-22.957072, -42.742136], [-23.032387, -44.162307], [-23.038236, -44.200363], [-23.035568, -44.148684], [-22.961057, -44.042251], [-22.943668, -44.044834], [-22.945296, -44.042628], [-22.962049, -44.025264], [-22.963264, -44.028571], [-22.994488, -44.094545], [-22.997387, -44.0969], [-22.926723, -43.95077], [-22.929941, -43.941197], [-22.926901, -43.948743], [-22.928064, -43.945177], [-22.930185, -43.915038], [-22.930238, -43.912512], [-22.930856, -43.910264], [-22.905819, -43.871789], [-22.904731, -43.868635], [-22.906436, -43.873016], [-22.82932, -43.235339], [-22.820617, -43.226804], [-22.81674, -43.209495], [-22.819236, -43.200608], [-22.818766, -43.197266], [-22.82293, -43.164975], [-22.821137, -43.171672], [-23.99847, -46.25794], [-22.809161, -43.177536], [-22.800387, -43.174975], [-22.79332, -43.169559], [-22.784102, -43.184847], [-22.83889, -43.249418], [-22.767554, -43.105962], [-22.76573, -43.103636], [-22.763346, -43.106875], [-22.757137, -43.108395], [-22.749813, -43.105492], [-22.761435, -43.110922], [-22.936003, -42.465895], [-22.936125, -42.481427], [-22.934263, -42.498887], [-22.933265, -42.515416], [-22.933648, -42.505871], [-23.011644, -43.422579], [-22.922658, -42.528747], [-22.935717, -42.491621], [-22.912419, -42.482623], [-22.915579, -42.311165], [-22.919727, -42.307528], [-22.889149, -42.348853], [-22.891371, -42.366502], [-22.89487, -42.363534], [-22.889924, -42.369276], [-22.874149, -42.334646], [-22.873944, -42.333681], [-22.874666, -42.329025], [-22.874276, -42.330016], [-22.874939, -42.328648], [-23.013037, -43.295622], [-22.86904, -42.303222], [-22.867608, -42.295152], [-22.867038, -42.298457], [-22.867277, -42.296263], [-22.858509, -42.24815], [-22.859795, -42.254201], [-22.86369, -42.257398], [-22.870823, -42.283913], [-22.87938, -42.272853], [-22.847088, -42.228892], [-22.840413, -42.222594], [-22.839687, -42.217283], [-22.841336, -42.210986], [-22.841709, -42.207847], [-22.848401, -42.162936], [-22.830203, -42.109008], [-22.83529, -42.104919], [-22.848315, -42.103752], [-22.860396, -42.109946], [-22.869838, -42.115928], [-22.840212, -42.136188], [-22.865478, -42.111493], [-22.850629, -42.094127], [-22.873343, -42.052873], [-22.882436, -42.010396], [-22.883481, -42.01397], [-22.885702, -42.01694], [-22.875513, -42.00768], [-22.869378, -41.983202], [-22.860122, -41.986345], [-22.873101, -42.04533], [-22.919975, -42.037184], [-22.951283, -42.107006], [-22.941209, -42.035374], [-22.967206, -42.035102], [-22.975261, -42.021316], [-22.969919, -42.019173], [-22.959166, -42.02508], [-22.951255, -42.107333], [-22.72791, -41.977405], [-22.743755, -41.951731], [-22.800634, -41.930125], [-22.771425, -41.915952], [-22.779396, -41.911306], [-22.755172, -41.891031], [-22.750226, -41.882576], [-22.745932, -41.881309], [-22.741974, -41.881677], [-22.742205, -41.875416], [-22.754691, -41.87263], [-22.761265, -41.875244], [-22.769072, -41.887274], [-22.757091, -41.904804], [-22.589583, -41.987848], [-22.584806, -41.986869], [-22.578951, -41.985048], [-22.661937, -41.998284], [-22.641077, -41.999713], [-22.649139, -41.999364], [-22.611461, -41.998137], [-22.600732, -41.995984], [-22.528514, -41.941513], [-22.533136, -41.960302], [-22.528106, -41.946152], [-22.530807, -41.953263], [-22.531634, -41.940383], [-22.533036, -41.937227]]")

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
