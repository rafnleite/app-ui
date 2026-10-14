import React, { useId } from 'react';

interface PropriedadesCampoBusca {
  valor: string;
  aoMudar: (valor: string) => void;
  rotulo: string;
  textoPlaceholder?: string;
}

export default function CampoBusca({ valor, aoMudar, rotulo, textoPlaceholder }: PropriedadesCampoBusca) {
  const id = useId();
  return <div className="ui-busca">
    <label htmlFor={id} className="sr-only">{rotulo}</label>
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
    <input id={id} className="ui-input" type="search" value={valor} onChange={e => aoMudar(e.target.value)} placeholder={textoPlaceholder || rotulo} />
    {valor && <button type="button" aria-label="Limpar busca" title="Limpar busca" onClick={() => aoMudar('')}>×</button>}
  </div>;
}
