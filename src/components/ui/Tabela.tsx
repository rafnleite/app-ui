import React from 'react';

interface PropriedadesTabela extends React.TableHTMLAttributes<HTMLTableElement> {
  rotulo: string;
}

/** A apresentação é compartilhada; células e regras de negócio são slots do aplicativo. */
export default function Tabela({ rotulo, className = '', children, ...props }: PropriedadesTabela) {
  return <div className="ui-tabela-rolagem" tabIndex={0} role="region" aria-label={rotulo}>
    <table {...props} className={`ui-tabela ${className}`}>
      <caption className="sr-only">{rotulo}</caption>
      {children}
    </table>
  </div>;
}
