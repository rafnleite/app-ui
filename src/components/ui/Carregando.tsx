import React from 'react';

export default function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return <div className="ui-carregando" role="status"><span className="ui-spinner" aria-hidden="true" /><span>{texto}</span></div>;
}
