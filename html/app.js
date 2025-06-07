let items = [];
let filteredItems = [];
let currentImgSize = 100;
let options = {};

const bookContainer = document.querySelector('.book-container');
const itemsGrid = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const imgSizeRange = document.getElementById('imgSizeRange');
const imgSizeLabel = document.getElementById('imgSizeLabel');
const closeBtn = document.getElementById('closeBtn');

function formatBool(value) {
  return value ? 'Sí' : 'No';
}

function populateTypeFilter() {
  const types = [...new Set(items.map(i => i.type))].sort();
  typeFilter.innerHTML = `<option value="all">Todos los tipos</option>` +
    types.map(t => `<option value="${t}">${t}</option>`).join('');
}

function filterItems() {
  const term = searchInput.value.toLowerCase();
  const type = typeFilter.value;

  filteredItems = items.filter(item => {
    const label = item.label || item.name || '';
    const description = item.description || '';
    const matchTerm = label.toLowerCase().includes(term) || description.toLowerCase().includes(term);
    const matchType = (type === 'all' || item.type === type);
    return matchTerm && matchType;
  });

  renderItems();
}

function renderItems() {
  itemsGrid.innerHTML = '';

  const containerWidth = itemsGrid.clientWidth;
  const itemFullWidth = currentImgSize + 20; // 20 es el padding/margen que usas
  const containerHeight = itemsGrid.clientHeight; // altura visible, si la tienes fija
  const itemFullHeight = currentImgSize + 20;
  const columnsCount = Math.floor(containerWidth / itemFullWidth) || 1; // al menos 1 columna
  const sizeMin = 100;
  const sizeMax = 200;
  const rowsMin = 2;
  const rowsMax = 5;
  const m = (rowsMax - rowsMin) / (sizeMax - sizeMin); // = (2-5)/(300-100) = -3/200 = -0.015
  const b = rowsMin - m * sizeMin; // 5 - (-0.015)*100 = 5 + 1.5 = 6.5
  let rowsCount = Math.round(m * currentImgSize + b);
  rowsCount = Math.max(rowsMin, Math.max(rowsMax, rowsCount));

  itemsGrid.style.gridTemplateColumns = `repeat(${columnsCount}, ${itemFullWidth}px)`;
  itemsGrid.style.maxHeight = `${rowsCount * itemFullHeight}px`;
  itemsGrid.style.overflowY = 'auto'; // si quieres scroll vertical cuando hay más filas
  itemsGrid.style.gridTemplateColumns = `repeat(${columnsCount}, ${itemFullWidth}px)`;

  filteredItems.forEach(item => {
    const wrapper = document.createElement('div');
    wrapper.className = 'item-wrapper';
    if (item.unique) wrapper.classList.add('unique-item');

    wrapper.style.width = `${itemFullWidth}px`;
    wrapper.style.height = `${itemFullHeight}px`;

    const img = document.createElement('div');
    img.className = 'item-image';
    img.style.width = `${currentImgSize}px`;
    img.style.height = `${currentImgSize}px`;

    const imgTag = document.createElement('img');
    imgTag.src = item.imageUrl || 'no-image.png';
    imgTag.alt = item.label || item.name || 'Ítem';
    img.appendChild(imgTag);
    imgTag.addEventListener('click', () => {
      fetch(`https://${GetParentResourceName()}/giveItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: item.name })
      });
    });
    wrapper.appendChild(img);

    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.textContent = (options.showLabel && item.label) ? item.label :
                          (options.showName && item.name) ? item.name : '';

    nameDiv.addEventListener('click', () => {
      fetch(`https://${GetParentResourceName()}/giveItem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: item.name })
      });
    });

    wrapper.appendChild(nameDiv);

    wrapper.addEventListener('mouseenter', (e) => showTooltip(e, item));
    wrapper.addEventListener('mouseleave', hideTooltip);

    itemsGrid.appendChild(wrapper);
  });
}

const slider = document.getElementById('imgSizeRange');
const label = document.getElementById('imgSizeLabel');

function updateLabel() {
  const value = slider.value;
  label.textContent = `${value} x ${value}`;

  const controlsRect = slider.parentElement.getBoundingClientRect(); // contenedor .controls
  const sliderRect = slider.getBoundingClientRect();

  const min = slider.min ? slider.min : 0;
  const max = slider.max ? slider.max : 100;
  const percent = (value - min) / (max - min);

  const sliderWidth = sliderRect.width;
  const labelWidth = label.offsetWidth;

  // Posición del thumb dentro del slider:
  let left = percent * sliderWidth - labelWidth / 2;

  // Evitar que el label se salga de .controls
  if (left < 0) left = 0;
  if (left > sliderWidth - labelWidth) left = sliderWidth - labelWidth;

  label.style.left = `${left}px`;
}

slider.addEventListener('input', updateLabel);
window.addEventListener('resize', updateLabel);

updateLabel();
slider.addEventListener('input', updateLabel);
window.addEventListener('resize', updateLabel);

updateLabel();

imgSizeRange.addEventListener('input', () => {
  currentImgSize = parseInt(imgSizeRange.value);
  imgSizeLabel.textContent = `${currentImgSize} x ${currentImgSize}`;
  renderItems();
});

searchInput.addEventListener('input', filterItems);
typeFilter.addEventListener('change', filterItems);

closeBtn.addEventListener('click', () => {
  fetch(`https://${GetParentResourceName()}/close`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });

  bookContainer.classList.add('fade-out');

  setTimeout(() => {
    bookContainer.style.display = 'none';
    bookContainer.classList.remove('fade-out');
    itemsGrid.innerHTML = '';
    hideTooltip();
  }, 300); // Tiempo igual al transition de .fade-out
});

window.addEventListener('message', event => {
  const data = event.data;
  if (data.action === 'open') {
    bookContainer.style.display = 'flex';
  } else if (data.action === 'close') {
    bookContainer.style.display = 'none';
    hideTooltip();
  } else if (data.action === 'loadItems') {
    options = data.options || {};
    items = data.items ? Object.values(data.items) : [];
    populateTypeFilter();
    filteredItems = [...items];
    renderItems();
  }
});

// Tooltip flotante global
const globalTooltip = document.createElement('div');
globalTooltip.id = 'globalTooltip';
globalTooltip.className = 'tooltip';
globalTooltip.style.position = 'fixed';
globalTooltip.style.display = 'none';
globalTooltip.style.zIndex = '9999';
document.body.appendChild(globalTooltip);

function showTooltip(event, item) {
  const tooltipHTML = `
    <strong>${item.label || item.name}</strong><br>
    <em>${item.description || 'Sin descripción'}</em><br><br>
    <strong>Nombre:</strong> ${item.name}<br>
    <strong>Peso:</strong> ${item.weight || 0}<br>
    <strong>Tipo:</strong> ${item.type || 'N/A'}<br>
    <strong>Único:</strong> ${item.unique ? 'Sí' : 'No'}<br>
    <strong>Usable:</strong> ${item.useable ? 'Sí' : 'No'}<br>
    <strong>Duración (decay):</strong> ${item.decay || 'N/A'}<br>
    <strong>Se elimina al usar:</strong> ${item.delete ? 'Sí' : 'No'}<br>
    <strong>Cierra al usar:</strong> ${item.shouldClose ? 'Sí' : 'No'}
  `;

  globalTooltip.innerHTML = tooltipHTML;
  globalTooltip.style.display = 'block';
  globalTooltip.style.width = '210px';

  const tooltipRect = globalTooltip.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Obtener el elemento sobre el que está el ratón (el wrapper)
  const targetRect = event.currentTarget.getBoundingClientRect();

  const offset = 10; // espacio entre imagen y tooltip

  let left, top;

  // Colocar tooltip fuera del rectángulo del elemento (a la derecha si hay espacio)
  if (targetRect.right + offset + tooltipRect.width < viewportWidth) {
    left = targetRect.right + offset;
  } else if (targetRect.left - offset - tooltipRect.width > 0) {
    // Si no cabe a la derecha, poner a la izquierda
    left = targetRect.left - offset - tooltipRect.width;
  } else {
    // Si no cabe a izquierda ni derecha, poner al borde derecho de la pantalla
    left = viewportWidth - tooltipRect.width - offset;
  }

  // Intentar poner tooltip alineado arriba con el elemento
  if (targetRect.top + tooltipRect.height < viewportHeight) {
    top = targetRect.top;
  } else if (targetRect.bottom - tooltipRect.height > 0) {
    // Si no cabe arriba, poner alineado abajo
    top = targetRect.bottom - tooltipRect.height;
  } else {
    // Si no cabe arriba ni abajo, poner en 10px desde arriba
    top = offset;
  }

  // Evitar que el tooltip se salga por arriba o por abajo (extra seguridad)
  if (top < offset) top = offset;
  if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - offset;

  globalTooltip.style.left = `${left}px`;
  globalTooltip.style.top = `${top}px`;
}

function hideTooltip() {
  globalTooltip.style.display = 'none';
}
