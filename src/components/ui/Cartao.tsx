import React, { useId } from 'react';

export interface PropriedadesCartao {
  titulo?: string;
  children: React.ReactNode;
  acoes?: React.ReactNode;
  className?: string;
  classeCorpo?: string;
}

/** Contrato do Cartao do finhub, sem acoplamento ao Bootstrap ou ao domínio. */
export default function Cartao({ titulo, children, acoes, className = '', classeCorpo = '' }: PropriedadesCartao) {
  const id = useId();
  return (
    <section className={`ui-cartao ${className}`} aria-labelledby={titulo ? id : undefined}>
      {(titulo || acoes) && <div className="ui-cartao-cabecalho">
        {titulo && <h2 id={id}>{titulo}</h2>}
        {acoes && <div>{acoes}</div>}
      </div>}
      <div className={`ui-cartao-corpo ${classeCorpo}`}>{children}</div>
    </section>
  );
}
