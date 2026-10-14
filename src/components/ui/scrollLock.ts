let quantidadeBloqueios = 0;
let overflowAnterior = '';
let paddingAnterior = '';

/** Compartilha o bloqueio da página entre modais, menus e outros overlays. */
export function acquireScrollLock(): () => void {
  if (quantidadeBloqueios === 0) {
    overflowAnterior = document.body.style.overflow;
    paddingAnterior = document.body.style.paddingRight;
    const larguraBarra = window.innerWidth - document.documentElement.clientWidth;
    if (larguraBarra > 0) {
      document.body.style.paddingRight = `${parseFloat(getComputedStyle(document.body).paddingRight) + larguraBarra}px`;
    }
    document.body.style.overflow = 'hidden';
  }
  quantidadeBloqueios += 1;
  let liberado = false;
  return () => {
    if (liberado) return;
    liberado = true;
    quantidadeBloqueios -= 1;
    if (quantidadeBloqueios === 0) {
      document.body.style.overflow = overflowAnterior;
      document.body.style.paddingRight = paddingAnterior;
    }
  };
}
