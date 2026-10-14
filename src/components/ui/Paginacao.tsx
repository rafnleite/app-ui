import React from 'react';

export interface PropriedadesPaginacao {
  pagina: number;
  itensPorPagina: number;
  total: number;
  aoMudarPagina: (pagina: number) => void;
  aoMudarItensPorPagina?: (quantidade: number) => void;
  opcoesItensPorPagina?: number[];
  className?: string;
}

export default function Paginacao({ pagina, itensPorPagina, total, aoMudarPagina, aoMudarItensPorPagina, opcoesItensPorPagina = [10, 25, 50, 100], className = '' }: PropriedadesPaginacao) {
  const paginas = Math.max(1, Math.ceil(total / itensPorPagina));
  const atual = Math.min(Math.max(1, pagina), paginas);
  const inicio = Math.max(1, Math.min(atual - 2, paginas - 4));
  const visiveis = Array.from({ length: Math.min(5, paginas) }, (_, i) => inicio + i);
  const primeiraLinha = total === 0 ? 0 : (atual - 1) * itensPorPagina + 1;
  return <div className={`ui-paginacao ${className}`}>
    <div className="ui-paginacao-resumo">
      {aoMudarItensPorPagina && <label>Mostrar <select aria-label="Registros por página" value={itensPorPagina} onChange={e => aoMudarItensPorPagina(Number(e.target.value))}>
        {opcoesItensPorPagina.map(n => <option key={n} value={n}>{n}</option>)}
      </select> registros</label>}
      <span aria-live="polite">{primeiraLinha}–{Math.min(atual * itensPorPagina, total)} de {total} registros</span>
    </div>
    <nav aria-label="Paginação da tabela">
      <button type="button" aria-label="Página anterior" disabled={atual === 1} onClick={() => aoMudarPagina(atual - 1)}>‹</button>
      {visiveis.map(n => <button type="button" key={n} aria-label={`Página ${n}`} aria-current={n === atual ? 'page' : undefined} onClick={() => aoMudarPagina(n)}>{n}</button>)}
      <button type="button" aria-label="Próxima página" disabled={atual === paginas} onClick={() => aoMudarPagina(atual + 1)}>›</button>
    </nav>
  </div>;
}
