import React from 'react';

export interface PropriedadesBotao extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'perigo' | 'discreto';
  carregando?: boolean;
}

export default function Botao({ variante = 'primario', carregando = false, className = '', children, disabled, type = 'button', ...props }: PropriedadesBotao) {
  return (
    <button {...props} type={type} disabled={disabled || carregando} aria-busy={carregando || undefined} className={`ui-botao ui-botao--${variante} ${className}`}>
      {carregando && <span className="ui-spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
