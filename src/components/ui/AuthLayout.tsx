import React, { type ReactNode } from 'react';

interface AuthLayoutProps {
  brand: ReactNode;
  artwork: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  imageUrl?: string;
}

/** Dois painéis para autenticação; marca, imagem e conteúdo pertencem ao aplicativo. */
export default function AuthLayout({ brand, artwork, children, footer, imageUrl }: AuthLayoutProps) {
  return (
    <main className="app-auth">
      <div className="app-auth-card">
        <aside className="app-auth-artwork" style={imageUrl ? { backgroundImage: `url("${imageUrl}")` } : undefined}>
          {artwork}
        </aside>
        <section className="app-auth-content" aria-label="Acesso ao aplicativo">
          <div className="app-auth-brand">{brand}</div>
          {children}
          {footer && <footer className="app-auth-footer">{footer}</footer>}
        </section>
      </div>
    </main>
  );
}
