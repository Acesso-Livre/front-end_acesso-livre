document.addEventListener('DOMContentLoaded', () => {
  const imgUrl = '../../assets/img/map/mapa-ifba.png'; // ajuste o caminho da imagem

  const pins = [
    { label: 'Entrada', top: 90, left: 7 },
    { label: 'Estacionamento I', top: 72, left: 32 },
    { label: 'Estacionamento II', top: 78, left: 75 },
    { label: 'Estacionamento III', top: 40, left: 96 },
    { label: 'Campo', top: 65, left: 12 },
    { label: 'Quadra', top: 17, left: 10 },
    { label: 'Quadra de Areia', top: 5, left: 14 },
    { label: 'Bloco 06', top: 44, left: 30 },
    { label: 'Bloco 05', top: 46, left: 48 },
    { label: 'Bloco 08', top: 21, left: 30 },
    { label: 'Bloco 09', top: 15, left: 46 },
    { label: 'Cantina', top: 44, left: 71 },
    { label: 'Auditório', top: 60, left: 54 },
    { label: 'Bloco 16', top: 30, left: 80 },
    { label: 'Biblioteca', top: 18, left: 86 },
    { label: 'Cores', top: 32, left: 54 }
  ];

  const img = new Image();
  img.src = imgUrl;

  img.onload = () => {
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    const bounds = [[0, 0], [H, W]];

    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -3,
      maxZoom: 4,
      zoomSnap: 0.25,
      attributionControl: false
    });

    L.imageOverlay(imgUrl, bounds).addTo(map);
    map.fitBounds(bounds);

    // Cria o ícone de pin
    function makePinIcon() {
      return L.divIcon({
        className: 'pin-marker',
        html: `<div class="dot"></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    }

    // Adiciona os pins no mapa
    pins.forEach(p => {
      const x = (p.left / 100) * W;
      const y = (p.top / 100) * H;
      const marker = L.marker([y, x], { icon: makePinIcon() }).addTo(map);

      marker.bindPopup(`<strong>${p.label}</strong>`);
      marker.on('click', () => alert(`Você clicou em ${p.label}`));
    });

    // Recalibra o mapa ao redimensionar a janela
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize(false);
        map.setView(center, zoom, { animate: false });
      }, 100);
    });
  };

  img.onerror = () => {
    console.error('Erro ao carregar a imagem do mapa:', imgUrl);
    alert('Erro ao carregar a imagem do mapa. Verifique o caminho.');
  };
});