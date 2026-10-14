import React, { useId } from 'react';

interface PropriedadesCampoInput extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'placeholder'> {
  rotulo: string;
  tipo?: React.HTMLInputTypeAttribute;
  valor?: string | number;
  aoMudar?: React.ChangeEventHandler<HTMLInputElement>;
  textoPlaceholder?: string;
  erro?: string;
}

export default function CampoInput({ rotulo, tipo = 'text', valor, aoMudar, textoPlaceholder, erro, id, className = '', ...props }: PropriedadesCampoInput) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return <div className="ui-campo">
    <label htmlFor={inputId}>{rotulo}</label>
    <input {...props} id={inputId} type={tipo} value={valor} onChange={aoMudar} placeholder={textoPlaceholder} aria-invalid={erro ? true : undefined} aria-describedby={erro ? `${inputId}-erro` : props['aria-describedby']} className={`ui-input ${className}`} />
    {erro && <p id={`${inputId}-erro`} className="ui-campo-erro" role="alert">{erro}</p>}
  </div>;
}
