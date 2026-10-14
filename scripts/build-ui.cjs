const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');

const packageRoot = path.resolve(__dirname, '..');
const output = path.resolve(packageRoot, 'dist');
if (path.dirname(output) !== packageRoot || path.basename(output) !== 'dist') {
  throw new Error('Diretório de saída inválido: esperado app-ui/dist.');
}

const components = ['AppShell', 'AuthLayout', 'Botao', 'Cartao', 'CampoInput', 'CampoBusca', 'Tabela', 'Paginacao', 'Carregando', 'ModalGlobal'];
const neutralTokens = {
  '--cor-primario-2': '#111827',
  '--cor-primario-3': '#0b1018',
  '--paleta-primaria': '#1f2937',
  '--paleta-primaria-rgb': '31 41 55',
  '--paleta-secundaria': '#858796',
  '--paleta-sucesso': '#0a9f4f',
  '--paleta-informacao': '#36b9cc',
  '--paleta-alerta': '#f6c23e',
  '--paleta-perigo': '#e74a3b',
  '--paleta-clara': '#f8f9fc',
  '--paleta-escura': '#5a5c69',
  '--paleta-texto-pagina': '#5a5c69',
  '--paleta-texto-secundario': '#6e707e',
  '--paleta-fundo-pagina': '#f8f9fc',
  '--paleta-fundo-zebrado': '#f7f8fc',
  '--paleta-borda': '#e3e6f0',
  '--paleta-borda-destaque': '#dddfeb',
  '--paleta-branco': '#fff',
  '--paleta-input-borda-foco': '#9ca3af',
  '--paleta-input-sombra-foco': 'rgba(31, 41, 55, .15)',
  '--ui-fonte': "'Inter', 'Segoe UI', Arial, sans-serif",
  '--ui-raio': '.5rem',
  '--ui-sombra-cartao': '0 .15rem 1.75rem rgba(58, 59, 69, .1)',
};

async function build() {
  fs.rmSync(output, { recursive: true, force: true });
  const tsc = require.resolve('typescript/bin/tsc');
  const result = spawnSync(process.execPath, [tsc, '-p', path.join(packageRoot, 'tsconfig.json')], {
    cwd: packageRoot, stdio: 'inherit', windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);

  for (const filename of fs.readdirSync(output)) {
    if (!/\.(js|d\.ts)$/.test(filename)) continue;
    const filepath = path.join(output, filename);
    let source = fs.readFileSync(filepath, 'utf8');
    // O consumidor importa styles.css uma vez, explicitamente. CSS não faz
    // parte do grafo JavaScript, permitindo importar o pacote em Node/SSR.
    source = source.replace(/^import\s+['"][^'"]+\.css['"];?\s*$/gm, '');
    source = source.replace(/((?:from\s+|import\s*\(\s*)['"])(\.{1,2}\/[^'"]+)(['"])/g, (match, start, specifier, end) => {
      return path.posix.extname(specifier) ? match : start + specifier + '.js' + end;
    });
    fs.writeFileSync(filepath, source, 'utf8');
  }

  const baseline = `/* Base mínima do kit, independente do reset do Tailwind/Bootstrap. */
.ui-input, .ui-botao, .ui-cartao, .ui-cartao *, .ui-busca, .ui-tabela,
.ui-paginacao, .ui-paginacao *, .app-shell, .app-shell *, .app-auth,
.app-auth *, .modal-global-overlay, .modal-global-overlay * { box-sizing: border-box; }
.ui-busca > button { border: 0; background: transparent; cursor: pointer; }
.ui-tabela th { text-align: left; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
`;
  const styles = ['ui.css', 'app-shell.css', 'modals.css'].map(filename => {
    const source = fs.readFileSync(path.join(packageRoot, 'src', 'styles', filename), 'utf8');
    return '/* ' + filename + ' */\n' + source.replace(/var\((--[a-zA-Z0-9-]+)(?:,[^()]*(?:\([^()]*\)[^()]*)*)?\)/g, (match, token) =>
      neutralTokens[token] ? 'var(' + token + ', ' + neutralTokens[token] + ')' : match);
  }).join('\n\n');
  fs.writeFileSync(path.join(output, 'styles.css'), baseline + '\n' + styles, 'utf8');

  const library = await import(pathToFileURL(path.join(output, 'index.js')).href);
  for (const name of components) {
    if (typeof library[name] !== 'function') throw new Error('Export ausente: ' + name);
  }
  for (const filename of fs.readdirSync(output).filter(name => name.endsWith('.js'))) {
    const source = fs.readFileSync(path.join(output, filename), 'utf8');
    for (const match of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      const specifier = match[1];
      if (!specifier.startsWith('.') && !/^(react|react-dom)(\/|$)/.test(specifier)) {
        throw new Error('Dependência inesperada no kit: ' + specifier);
      }
    }
  }
  console.log('Kit criado e validado: dist (' + components.length + ' componentes, ESM + tipos + CSS).');
}

build().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
