import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fireEvent, screen, within } from '@testing-library/dom';
import ModalGlobal from './ModalGlobal';
import { acquireScrollLock } from './scrollLock';

let root;
let host;
let acionador;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  host = document.createElement('div');
  acionador = document.createElement('button');
  acionador.textContent = 'Abrir';
  document.body.append(acionador, host);
  acionador.focus();
  document.body.style.overflow = 'auto';
  document.body.style.paddingRight = '4px';
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  acionador.remove();
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
});

test('usa portal, nome acessível, ciclo de foco e retorna ao acionador', () => {
  const conteudo = <><input aria-label="Nome" /><div hidden><button>Oculto</button></div><button>Última ação</button></>;
  act(() => root.render(<ModalGlobal aberto aoFechar={() => {}} titulo="Cadastro" rodape={null}>{conteudo}</ModalGlobal>));
  const dialogo = screen.getByRole('dialog', { name: 'Cadastro' });
  expect(host.contains(dialogo)).toBe(false);
  expect(dialogo.getAttribute('aria-modal')).toBe('true');
  expect(document.activeElement).toBe(screen.getByLabelText('Nome'));

  const fechar = within(dialogo).getByRole('button', { name: 'Fechar' });
  const ultima = within(dialogo).getByRole('button', { name: 'Última ação' });
  ultima.focus();
  fireEvent.keyDown(ultima, { key: 'Tab' });
  expect(document.activeElement).toBe(fechar);
  fireEvent.keyDown(fechar, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(ultima);
  acionador.focus();
  expect(document.activeElement).toBe(screen.getByLabelText('Nome'));

  act(() => root.render(<ModalGlobal aberto={false} aoFechar={() => {}} titulo="Cadastro" />));
  expect(document.activeElement).toBe(acionador);
  expect(document.body.style.overflow).toBe('auto');
  expect(document.body.style.paddingRight).toBe('4px');
});

test('Escape fecha somente o diálogo do topo e conserva o bloqueio da página', () => {
  const fecharBase = jest.fn();
  const fecharTopo = jest.fn();
  function Pilha() {
    const [topoAberto, setTopoAberto] = useState(true);
    return <>
      <ModalGlobal aberto aoFechar={fecharBase} titulo="Base"><input aria-label="Campo base" /></ModalGlobal>
      <ModalGlobal aberto={topoAberto} aoFechar={() => { fecharTopo(); setTopoAberto(false); }} titulo="Topo"><input aria-label="Campo topo" /></ModalGlobal>
    </>;
  }
  act(() => root.render(<Pilha />));
  expect(document.activeElement).toBe(screen.getByLabelText('Campo topo'));
  act(() => fireEvent.keyDown(document, { key: 'Escape' }));
  expect(fecharTopo).toHaveBeenCalledTimes(1);
  expect(fecharBase).not.toHaveBeenCalled();
  expect(document.body.style.overflow).toBe('hidden');
  expect(document.activeElement).toBe(screen.getByLabelText('Campo base'));
  act(() => fireEvent.keyDown(document, { key: 'Escape' }));
  expect(fecharBase).toHaveBeenCalledTimes(1);
});

test('salvamento impede fechar por Escape, fundo ou botão sem perder o foco ao atualizar', () => {
  const fechar = jest.fn();
  const renderizar = ocupado => <ModalGlobal aberto ocupado={ocupado} aoFechar={fechar} titulo="Salvar"><input aria-label="Campo" /></ModalGlobal>;
  act(() => root.render(renderizar(true)));
  const campo = screen.getByLabelText('Campo');
  const overlay = screen.getByRole('dialog').parentElement;
  act(() => {
    fireEvent.keyDown(campo, { key: 'Escape' });
    fireEvent.click(overlay);
    fireEvent.click(screen.getAllByRole('button', { name: 'Fechar' })[0]);
  });
  expect(fechar).not.toHaveBeenCalled();
  act(() => root.render(renderizar(false)));
  expect(document.activeElement).toBe(campo);
  act(() => fireEvent.click(overlay));
  expect(fechar).toHaveBeenCalledTimes(1);
});

test('ações no rodapé continuam ligadas ao formulário e preservam campos obrigatórios', () => {
  const enviar = jest.fn(evento => evento.preventDefault());
  act(() => root.render(
    <ModalGlobal aberto titulo="Formulário" rodape={<button type="submit" form="cadastro">Salvar</button>}>
      <form id="cadastro" onSubmit={enviar}><input aria-label="Obrigatório" required /></form>
    </ModalGlobal>
  ));
  const campo = screen.getByLabelText('Obrigatório');
  expect(campo.required).toBe(true);
  expect(screen.getByRole('button', { name: 'Salvar' }).form).toBe(campo.form);
  campo.value = 'Preenchido';
  act(() => fireEvent.click(screen.getByRole('button', { name: 'Salvar' })));
  expect(enviar).toHaveBeenCalledTimes(1);
});

test('abrir um modal a partir do menu mantém o bloqueio até fechar o último overlay', () => {
  const liberarMenu = acquireScrollLock();
  act(() => root.render(<ModalGlobal aberto aoFechar={() => {}} titulo="Alterar senha" />));
  liberarMenu();
  liberarMenu();
  expect(document.body.style.overflow).toBe('hidden');
  act(() => root.render(<ModalGlobal aberto={false} titulo="Alterar senha" />));
  expect(document.body.style.overflow).toBe('auto');
  expect(document.body.style.paddingRight).toBe('4px');
});
