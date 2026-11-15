// Pointer Events keep mouse, pen and touch editing on the same path.
export function bindEditorDrag(root, { enabled, pieceAt, drop }) {
  let drag, suppressClick = false;
  const clear = () => {
    drag?.ghost?.remove();
    root.querySelectorAll('.drop-target').forEach(node => node.classList.remove('drop-target'));
    drag = null;
  };
  root.addEventListener('pointerdown', event => {
    if (!enabled() || !event.isPrimary || event.button !== 0 || drag) return;
    suppressClick = false;
    const source = event.target.closest('[data-piece], [data-square]');
    if (!source) return;
    const from = source.dataset.square || null;
    const piece = from ? pieceAt(from) : source.dataset.piece;
    if (!piece) return;
    drag = { id: event.pointerId, source, from, piece, x: event.clientX, y: event.clientY };
    source.setPointerCapture(event.pointerId);
  });
  root.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.ghost && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 8) return;
    if (!drag.ghost) {
      drag.ghost = drag.source.querySelector('img').cloneNode();
      drag.ghost.className = 'analysis-drag-ghost';
      drag.ghost.setAttribute('aria-hidden', 'true');
      document.body.append(drag.ghost);
    }
    event.preventDefault();
    drag.ghost.style.left = `${event.clientX}px`;
    drag.ghost.style.top = `${event.clientY}px`;
    root.querySelectorAll('.drop-target').forEach(node => node.classList.remove('drop-target'));
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-square], [data-trash]');
    if (target && root.contains(target)) target.classList.add('drop-target');
  });
  root.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-square], [data-trash]');
    suppressClick = Boolean(current.ghost);
    // A redraw may remove the captured source, so the browser can omit its click.
    setTimeout(() => { suppressClick = false; }, 0);
    clear();
    if (suppressClick && enabled() && target && root.contains(target)) {
      if (target.dataset.square) drop(current.from, target.dataset.square, current.piece);
      else if (current.from) drop(current.from, null, current.piece);
    }
  });
  root.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressClick = false; }
  }, true);
  root.addEventListener('pointercancel', clear);
  root.addEventListener('lostpointercapture', clear);
  return clear;
}
