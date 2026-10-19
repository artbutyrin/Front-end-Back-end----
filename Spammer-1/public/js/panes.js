const STORAGE_KEY = 'spammer-pane-widths';
const LIMITS = {
  rail: { min: 180, max: 420 },
  list: { min: 240, max: 640 }
};

function readWidths() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function applyWidth(paneName, width) {
  const pane = document.querySelector(paneName === 'rail' ? '.rail' : '.list-pane');
  const limit = LIMITS[paneName];
  const next = Math.min(limit.max, Math.max(limit.min, width));
  pane.style.width = `${next}px`;
  return next;
}

const saved = readWidths();
if (saved.rail) applyWidth('rail', saved.rail);
if (saved.list) applyWidth('list', saved.list);

document.querySelectorAll('.resizer').forEach((handle) => {
  handle.addEventListener('pointerdown', (event) => {
    const paneName = handle.dataset.pane;
    const pane = document.querySelector(paneName === 'rail' ? '.rail' : '.list-pane');
    const startX = event.clientX;
    const startWidth = pane.getBoundingClientRect().width;

    handle.classList.add('is-dragging');
    document.body.classList.add('is-resizing');
    handle.setPointerCapture(event.pointerId);

    function onMove(moveEvent) {
      const width = applyWidth(paneName, startWidth + moveEvent.clientX - startX);
      const widths = readWidths();
      widths[paneName] = width;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
    }

    function onUp() {
      handle.classList.remove('is-dragging');
      document.body.classList.remove('is-resizing');
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
    }

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  });
});
