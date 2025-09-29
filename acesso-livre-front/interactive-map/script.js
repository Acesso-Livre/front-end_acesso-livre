const mapPan = document.getElementById('map-pan');

// Inicializa Panzoom
const panzoom = Panzoom(mapPan, {
  maxScale: 3,   // zoom máximo (3x)
  minScale: 0.5, // zoom mínimo (0.5x)
  contain: 'outside', // permite arrastar em todas direções
  cursor: 'grab'
});

// Permite zoom com scroll do mouse
mapPan.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

// Clique nos pins
document.querySelectorAll('.pin').forEach(pin => {
  pin.addEventListener('click', function () {
    alert(`Você clicou no ${this.title}`);
  });
});
