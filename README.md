# Componentes de interface compartilhados

`@rafnleite/app-ui` é a fonte única de layout, login, formulários simples,
cartões, tabelas, paginação, indicadores de carregamento e modais usados pelos
aplicativos. O pacote contém React/React DOM como dependências *peer*. Rotas,
autenticação, chamadas à API, logos, imagens e temas continuam em cada app.

## Desenvolvimento local

```powershell
npm install
npm run build
npm pack
```

O pacote gerado pode ser instalado por um frontend com `npm install` e o caminho
do `.tgz`. As versões atualmente vendorizadas nos dois frontends permitem que
os builds independentes encontrem a mesma versão sem acessar um diretório fora
do projeto. Depois de uma alteração no kit, aumente a versão em `package.json`,
execute os comandos acima, substitua os `.tgz` nos frontends e atualize suas
dependências e lockfiles.

Importe `@rafnleite/app-ui/styles.css` uma vez no aplicativo e defina os tokens
`--paleta-*`, `--cor-primario-2`, `--cor-primario-3`, `--ui-fonte`, `--ui-raio` e
`--ui-sombra-cartao` no tema local. O CSS do kit usa classes `ui-*`, `app-shell-*`,
`app-auth-*` e `modal-global-*`; não impõe estilos ao `body` ou aos elementos
genéricos do app.

Quando o pacote for publicado em um registro privado, os frontends poderão
trocar a dependência de arquivo por `@rafnleite/app-ui@versão` e remover o
tarball vendorizado. Publicar o pacote ou alterar deploys não faz parte do
build local.
