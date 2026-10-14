import React, { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { acquireScrollLock } from './scrollLock';

interface AppShellProps {
  brand: ReactNode;
  navigation: ReactNode;
  sidebarFooter?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  title: string;
  children: ReactNode;
  routeKey?: string;
  storageKey?: string;
}

/** Estrutura visual sem dependências de autenticação, rotas ou domínio. */
export default function AppShell({ brand, navigation, sidebarFooter, headerActions, footer, title, children, routeKey, storageKey = 'app:sidebar-retraida' }: AppShellProps) {
  const sidebarId = useId();
  const sidebarRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(storageKey) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 992px)').matches);

  useEffect(() => {
    try { localStorage.setItem(storageKey, String(collapsed)); } catch { /* Persistência opcional. */ }
  }, [collapsed, storageKey]);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 992px)');
    const onChange = () => {
      setDesktop(query.matches);
      if (query.matches) setMobileOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [routeKey]);

  useEffect(() => {
    if (!mobileOpen || desktop) return;
    const releaseScrollLock = acquireScrollLock();
    const menuButton = menuButtonRef.current;
    const focusable = () => Array.from(sidebarRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      releaseScrollLock();
      document.removeEventListener('keydown', onKeyDown);
      menuButton?.focus();
    };
  }, [mobileOpen, desktop]);

  return (
    <div className={`app-shell${collapsed ? ' is-collapsed' : ''}${mobileOpen ? ' is-mobile-open' : ''}`}>
      <a className="app-shell-skip" href="#app-main-content">Ir para o conteúdo</a>
      {mobileOpen && !desktop && <button type="button" className="app-shell-backdrop" onClick={() => setMobileOpen(false)} tabIndex={-1} aria-label="Fechar menu lateral" />}
      <aside id={sidebarId} ref={sidebarRef} className="app-shell-sidebar" aria-label="Menu principal" aria-hidden={!desktop && !mobileOpen} inert={!desktop && !mobileOpen}>
        <div className="app-shell-brand-wrap">
          {brand}
          <button type="button" className="app-shell-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu lateral">×</button>
        </div>
        <nav className="app-shell-navigation" aria-label="Páginas do aplicativo" onClick={event => {
          if ((event.target as HTMLElement).closest('a, button')) setMobileOpen(false);
        }}>{navigation}</nav>
        <div className="app-shell-sidebar-footer">
          <button type="button" className="app-shell-collapse" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'} aria-expanded={!collapsed} title={collapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}>
            <span aria-hidden="true">{collapsed ? '›' : '‹'}</span>
            <span className="app-shell-label">Recolher menu</span>
          </button>
          {sidebarFooter}
        </div>
      </aside>
      <div className="app-shell-content" inert={mobileOpen && !desktop} aria-hidden={mobileOpen && !desktop}>
        <header className="app-shell-header">
          <div className="app-shell-heading">
            <button ref={menuButtonRef} type="button" className="app-shell-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Abrir menu lateral" aria-expanded={mobileOpen} aria-controls={sidebarId}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1>{title}</h1>
          </div>
          {headerActions && <div className="app-shell-header-actions">{headerActions}</div>}
        </header>
        <main id="app-main-content" className="app-shell-main" tabIndex={-1}>{children}</main>
        {footer && <footer className="app-shell-footer">{footer}</footer>}
      </div>
    </div>
  );
}
