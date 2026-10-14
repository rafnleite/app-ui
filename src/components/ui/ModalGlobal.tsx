import React, { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { acquireScrollLock } from './scrollLock';
import '../../styles/modals.css';

export type LarguraModal = 'sm' | 'md' | 'lg' | 'xl';

export interface PropriedadesModalGlobal {
  aberto: boolean;
  aoFechar?: () => void;
  titulo: string;
  icone?: ReactNode;
  subtitulo?: ReactNode;
  conteudo?: ReactNode;
  children?: ReactNode;
  rodape?: ReactNode;
  largura?: LarguraModal;
  classeDialogo?: string;
  classeCorpo?: string;
  fecharAoClicarFora?: boolean;
  ocupado?: boolean;
  camada?: number;
  focoInicial?: React.RefObject<HTMLElement | null>;
}

// Compartilhados entre instâncias: fechar um diálogo não pode desbloquear a
// página ou capturar o teclado enquanto outro diálogo estiver aberto.
const modaisAbertos: { id: string; dialogo: HTMLElement; camada: number }[] = [];

const seletorFoco = 'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

function elementosFocaveis(dialogo: HTMLElement): HTMLElement[] {
  return Array.from(dialogo.querySelectorAll<HTMLElement>(seletorFoco)).filter(elemento => {
    if (elemento.matches(':disabled') || elemento.closest('[hidden], [inert], [aria-hidden="true"]')) return false;
    let atual: HTMLElement | null = elemento;
    while (atual && atual !== dialogo) {
      const estilo = getComputedStyle(atual);
      if (estilo.display === 'none' || estilo.visibility === 'hidden') return false;
      atual = atual.parentElement;
    }
    return true;
  });
}

export default function ModalGlobal({
  aberto,
  aoFechar,
  titulo,
  icone,
  subtitulo,
  conteudo,
  children,
  rodape,
  largura = 'lg',
  classeDialogo = '',
  classeCorpo = '',
  fecharAoClicarFora = true,
  ocupado = false,
  camada = 11000,
  focoInicial,
}: PropriedadesModalGlobal) {
  const tituloId = useId();
  const subtituloId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef({ aoFechar, ocupado, fecharAoClicarFora, focoInicial });
  estadoRef.current = { aoFechar, ocupado, fecharAoClicarFora, focoInicial };

  const estaNoTopo = () => modaisAbertos[modaisAbertos.length - 1]?.id === tituloId;
  const solicitarFechamento = () => {
    if (estaNoTopo() && !estadoRef.current.ocupado) estadoRef.current.aoFechar?.();
  };

  useLayoutEffect(() => {
    if (!aberto || !dialogoRef.current) return;
    const dialogo = dialogoRef.current;
    const focoAnterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const liberarRolagem = acquireScrollLock();
    const camadaAtual = Math.max(camada, (modaisAbertos[modaisAbertos.length - 1]?.camada ?? camada - 1) + 1);
    modaisAbertos.push({ id: tituloId, dialogo, camada: camadaAtual });
    if (overlayRef.current) overlayRef.current.style.zIndex = String(camadaAtual);

    const focarInicio = () => {
      const alvos = elementosFocaveis(dialogo);
      const alvo = estadoRef.current.focoInicial?.current ??
        alvos.find(elemento => elemento.matches('[data-autofocus], input, select, textarea')) ??
        alvos[0] ?? dialogo;
      alvo.focus({ preventScroll: true });
    };
    focarInicio();

    const aoTeclar = (evento: KeyboardEvent) => {
      if (!estaNoTopo()) return;
      if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        if (!estadoRef.current.ocupado) estadoRef.current.aoFechar?.();
        return;
      }
      if (evento.key !== 'Tab') return;
      const alvos = elementosFocaveis(dialogo);
      const primeiro = alvos[0];
      const ultimo = alvos[alvos.length - 1];
      if (!primeiro) {
        evento.preventDefault();
        dialogo.focus();
      } else if (evento.shiftKey && (document.activeElement === primeiro || document.activeElement === dialogo || !dialogo.contains(document.activeElement))) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && (document.activeElement === ultimo || document.activeElement === dialogo || !dialogo.contains(document.activeElement))) {
        evento.preventDefault();
        primeiro.focus();
      }
    };
    const aoFocar = (evento: FocusEvent) => {
      if (estaNoTopo() && !dialogo.contains(evento.target as Node)) focarInicio();
    };
    document.addEventListener('keydown', aoTeclar);
    document.addEventListener('focusin', aoFocar);
    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('focusin', aoFocar);
      const estavaNoTopo = estaNoTopo();
      const indice = modaisAbertos.findIndex(modal => modal.id === tituloId);
      if (indice !== -1) modaisAbertos.splice(indice, 1);
      liberarRolagem();
      if (estavaNoTopo) {
        const proximo = modaisAbertos[modaisAbertos.length - 1]?.dialogo;
        if (focoAnterior?.isConnected && (!proximo || proximo.contains(focoAnterior))) {
          focoAnterior.focus({ preventScroll: true });
        } else if (proximo) {
          (elementosFocaveis(proximo)[0] ?? proximo).focus({ preventScroll: true });
        }
      }
    };
    // Os callbacks e o estado de salvamento são lidos pela referência sem
    // desmontar o diálogo ou perder o foco a cada atualização do formulário.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, tituloId, camada]);

  if (!aberto) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="modal-global-overlay"
      style={{ zIndex: camada }}
      onClick={evento => {
        if (evento.target === evento.currentTarget && estadoRef.current.fecharAoClicarFora) solicitarFechamento();
      }}
    >
      <div
        ref={dialogoRef}
        className={`modal-global-dialogo modal-global-${largura} ${classeDialogo}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={subtitulo ? subtituloId : undefined}
        aria-busy={ocupado || undefined}
        tabIndex={-1}
      >
        <header className="modal-global-cabecalho">
          <div className="modal-global-titulos">
            <h2 id={tituloId} className="modal-global-titulo">
              {icone && <span className="modal-global-icone" aria-hidden="true">{icone}</span>}
              {titulo}
            </h2>
            {subtitulo && <div id={subtituloId} className="modal-global-subtitulo">{subtitulo}</div>}
          </div>
          {aoFechar && (
            <button type="button" className="modal-global-fechar" aria-label="Fechar" onClick={solicitarFechamento} disabled={ocupado}>
              <span aria-hidden="true">×</span>
            </button>
          )}
        </header>
        <div className={`modal-global-corpo ${classeCorpo}`.trim()}>{conteudo ?? children}</div>
        {rodape !== null && (rodape !== undefined || aoFechar) && (
          <footer className="modal-global-rodape">
            {rodape ?? <button type="button" className="modal-global-botao-secundario" onClick={solicitarFechamento} disabled={ocupado}>Fechar</button>}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
}
