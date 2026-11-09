---
title: Verificações e testes de pull request
linkTitle: Verificações e testes de PR
description:
  Saiba como fazer seu pull request passar por todas as verificações com sucesso
weight: 40
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
---

Ao abrir um
[_pull request_](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) no
[repositório opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io),
um conjunto de verificações é executado. As verificações garantem que:

- Você assinou o [CLA](#easy-cla)
- Seu PR é [implantado com sucesso através do Netlify](#netlify-deployment)
- Suas alterações estão em conformidade com nosso [guia de estilo](#checks)

> [!NOTE]
>
> Caso alguma das verificações falhe, tente
> [resolver os problemas do conteúdo](../pull-requests/#fix-issues) primeiro,
> executando o comando `npm run fix` localmente.
>
> Você também pode adicionar o comentário `/fix` ao seu PR. Isso fará com que o
> _OpenTelemetry Bot_ execute esse comando por você e atualize o PR.
> Certifique-se de sincronizar essas alterações localmente com o comando _git
> pull_.
>
> Caso os problemas persistam, leia abaixo o que cada verificação faz e como
> você pode recuperar o PR de um estado de falha.

## `Easy CLA` {#easy-cla}

Esta verificação falha caso você ainda não tenha
[assinado o CLA](../prerequisites/#cla).

## Implantação com Netlify {#netlify-deployment}

Caso a [implantação através do Netlify](https://www.netlify.com/) falhe,
selecione **Detalhes** para mais informações.

Uma linha de status `?? some/path` pouco antes de `"build.command" failed`,
indicando um caminho que seu PR não altera, sugere que a compilação falhou por
causa de um cache de compilação desatualizado do Netlify, e não por causa das
suas alterações:

1. Peça a um mantenedor, por meio de um comentário no PR, para executar a
   compilação novamente sem o cache. Para o procedimento de limpeza do cache,
   consulte
   [Gerenciamento de dependências](/site/build/dependencies/#netlify-build-cache).
2. Se a falha se repetir na nova execução sem cache, o cache não era a causa:
   alguma etapa da compilação está escrevendo nesse caminho, e suas alterações
   são as primeiras suspeitas.

## GitHub PR checks {#checks}

Para garantir que as contribuições sigam nosso
[guia de estilo](../style-guide/), implementamos um conjunto de verificações que
checam as regras do guia e falham caso encontrem algum problema.

As seções a seguir descrevem as verificações atuais e como corrigir os erros
relacionados.

> [!NOTE]
>
> Apenas publicações recentes do blog são verificadas. Para mais detalhes,
> consulte [Publicações antigas do blog não são atualizadas][old-blogs]. Em
> particular, embora as publicações antigas sejam exibidas no site, as
> verificações listadas abaixo não se aplicam a elas.

[old-blogs]: ../blog/#old-blogs-are-not-updated

### `TEXT linter` {.notranslate lang=en}

Essa verificação garante que os
[termos e palavras específicas do OpenTelemetry sejam usados de forma consistente em todo o site](../style-guide/#opentelemetryio-word-list).

Se forem encontrados problemas, anotações serão adicionadas aos seus arquivos na
visualização `arquivos alterados` do PR. Corrija estes itens para que a
verificação passe. Como alternativa, você pode executar
`npm run check:text -- --fix` localmente para corrigir a maioria dos problemas.
Depois, execute `npm run check:text` novamente e corrija manualmente o que
restar.

### `MARKDOWN linter` {.notranslate lang=en}

Essa verificação garante que sejam aplicados os
[critérios de padronização e consistência dos arquivos Markdown](../style-guide/#markdown-standards).

Se forem encontrados problemas, execute `npm run fix:markdown` para resolver a
maioria deles automaticamente. Para os problemas restantes, execute
`npm run check:markdown` e aplique manualmente as alterações sugeridas.

### `SPELLING check` {.notranslate lang=en}

Essa verificação garante que [todas as palavras estejam corretamente
escritas][spell checking] em todos os idiomas.

Se a verificação falhar, execute `npm run check:spelling` localmente para listar
os problemas. Para adicionar ou alterar palavras permitidas, consulte
[Verificação ortográfica][Spell checking] no guia de estilo.

[Spell checking]: ../style-guide/#spell-checking

### `CSPELL` check {.notranslate lang=en}

Essa verificação garante que as listas `cSpell:ignore` do cSpell no _front
matter_ estejam normalizadas e que as listas de palavras em `.cspell/*.txt`
estejam ordenadas (consulte `npm run fix:dict`).

Se essa verificação falhar, execute `npm run fix:dict` localmente e envie as
alterações em um novo _commit_.

### `FILE FORMAT` {.notranslate lang=en}

Essa verificação garante que todos os arquivos estejam em conformidade com as
[regras de formatação do Prettier](../style-guide/#file-format).

Se essa verificação falhar, execute `npm run fix:format` localmente e envie as
alterações em um novo _commit_.

### `FILENAME check` {.notranslate lang=en}

Essa verificação garante que:

- Todos os [nomes de arquivos estejam em kebab-case](../style-guide/#file-names)
- Não existam arquivos ou pastas obsoletos no repositório (consulte a lista
  abaixo)

Siga as orientações de cada anotação de erro. Para aplicar as correções
localmente, execute `npm run fix:filenames` e envie as alterações em um novo
_commit_.

> [!NOTE]
>
> `fix:filenames` pode **excluir** arquivos ou pastas obsoletos.

#### Arquivos e pastas obsoletos {#obsolete-files-and-folders}

A verificação sinaliza os seguintes caminhos obsoletos:

- `tools/` - removido quando as [ferramentas de code-excerpts foram movidas para
  um pacote npm][#9638]
- `static/refcache.json` - removido na [migração para o Lychee][#10911]. Se sua
  _branch_ o restaurar, siga as [instruções de atualização de _branches_
  desatualizadas][#10990].
- `.lycheecache` como arquivo **rastreado** - deixou de ser rastreado quando o
  cache de links versionado [passou a ser `link-cache.jsonc`][#11649]. Se sua
  _branch_ ainda o versiona, siga as [instruções de atualização][#11928].

[#9638]: https://github.com/open-telemetry/opentelemetry.io/pull/9638
[#10911]: https://github.com/open-telemetry/opentelemetry.io/pull/10911
[#10990]: https://github.com/open-telemetry/opentelemetry.io/issues/10990
[#11649]: https://github.com/open-telemetry/opentelemetry.io/pull/11649
[#11928]: https://github.com/open-telemetry/opentelemetry.io/issues/11928

### `BUILD` e `CHECK LINKS` {#build-and-check-links}

Estas duas verificações compilam o site e verificam que seus _links_ são
válidos.

> [!NOTE]
>
> Para informações sobre avisos relacionados a links locais do site, consulte
> [Sempre use um caminho para links locais do site](#avoid-external-site-local-links).

#### Corrigir erros 404 {#fix-404s}

Você deve corrigir as URLs marcadas como **inválidas** (código HTTP **404**)
pelo verificador de links.

#### Lidando com links externos válidos {#handling-valid-external-links}

O verificador de links pode ocasionalmente obter um código de status HTTP
diferente de 200 (sucesso) de servidores que bloqueiam verificadores. Esses
servidores geralmente retornam um código de status HTTP na faixa de 400, como
401, 403 ou 406, que são os mais comuns. Alguns servidores, como o LinkedIn,
reportam 999.

Se você validou manualmente um link externo que o verificador de links não está
obtendo um status de sucesso, você pode adicionar o seguinte parâmetro de
consulta à sua URL para fazer com que o verificador de links ignore ele:
`?link-check=no`, ou `&link-check=no` caso existam outros parâmetros de
consulta. Por exemplo, as seguintes URLs serão ignoradas:

- `https:/some-example.org?link-check=no`
- `https:/some-example.org?other-param=value&link-check=no`

Ao adicionar `link-check=no`, registre a data da sua validação manual
adicionando também o parâmetro `last-validated=YYYY-MM-DD`, por exemplo:

- `https:/some-example.org?link-check=no&last-validated=2026-08-02`

### `CHECK LINKS (production, internal)` {#check-links-production-internal .notranslate lang=en}

Essa verificação falha quando uma página aponta para uma página em **rascunho**
(_draft_) ou com **data futura**: essa página é exibida na pré-visualização da
implantação, mas o site de produção a omite. Aponte para uma página publicada ou
publique a página de destino primeiro. Se `CHECK LINKS` reportar a mesma página
como ausente, ela não existe: corrija o link. Para saber o que essa verificação
compila e cobre, consulte
[Links para páginas não publicadas](/site/build/link-checking/#production-internal).

### `CACHE updates committed?` {#cache-updates-committed .notranslate lang=en}

Se você adicionou ou alterou um link externo, o verificador de links o registra
no cache de links (`link-cache.jsonc`), e essa verificação falha até que o cache
atualizado seja incluído em um _commit_.

Se sua _branch_ é anterior ao `link-cache.jsonc`, primeiro atualize-a a partir
da `main`; para saber como, incluindo como resolver um conflito no próprio
arquivo de cache, consulte as [instruções de atualização][#11928]. Em seguida,
escolha uma das opções:

- Comente [`/fix:link-cache`](../pull-requests/#fixing-prs-in-github) no seu PR
  — o _OpenTelemetry Bot_ atualiza o cache por você (em uma _branch_ anterior ao
  `link-cache.jsonc`, o bot recusa e aponta para as mesmas instruções); ou
- Compile e verifique os links localmente: `npm run install:safe` e, em seguida,
  `npm run check:links`, que também atualiza o cache de links. Envie as
  alterações no cache de uma execução bem-sucedida em um novo _commit_.

### `WARNINGS in build log?` {.notranslate lang=en}

Se essa verificação falhar, revise o log `BUILD`, na etapa `npm run log:build`,
para identificar possíveis problemas adicionais. Caso não tenha certeza de como
resolver, peça ajuda aos mantenedores.

#### Sempre use um caminho para links locais do site {#avoid-external-site-local-links}

Ao criar links para páginas do site do OpenTelemetry, use caminhos locais em vez
de links externos. A compilação emitirá um aviso caso você não faça isso.

Para resolver o aviso de compilação, mantenha apenas a parte do caminho da URL
completa:

| ❌ Não use                                | ✅ Use em vez disso |
| ----------------------------------------- | ------------------- |
| `https://opentelemetry.io/docs/concepts/` | `/docs/concepts/`   |
| `https://www.opentelemetry.io/blog/...`   | `/blog/...`         |

O uso de caminhos locais garante que:

- Páginas locais do site sejam abertas na mesma aba do navegador: links externos
  abrem em uma nova aba, o que não é o comportamento desejado para a navegação
  dentro do site
- O processamento de links de localização funcione como esperado: os links
  recebem automaticamente o prefixo do código de idioma apropriado
- Os caminhos locais sejam mais fáceis de verificar e não ocupem
  desnecessariamente o cache de links

<details>
<summary>Nota para mantenedores</summary>

O código a seguir aplica o requisito de links descrito nesta seção:

- O _render-link hook_ que emite esse aviso:
  [`layouts/_markup/render-link.html`](https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_markup/render-link.html)
- O script que converte automaticamente URLs completas em caminhos locais:
  [`scripts/content-modules/adjust-pages/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/content-modules/adjust-pages)

</details>

#### Nunca marque uma página localizada como rascunho {#localized-drafts}

A compilação emite um aviso sobre páginas localizadas marcadas como rascunho
(_draft_). Para a regra e a solução, consulte
[Páginas em rascunho](../localization/#drafts).

### `LOCALIZATION` guidelines {.notranslate lang=en #localization}

Essa verificação aplica as [diretrizes de localização](../localization/) que
podem ser verificadas mecanicamente, como
[não copiar imagens e outros recursos](../localization/#images) entre
localizações, e que ainda não são cobertas por outras verificações.

Se essa verificação falhar, execute `npm run fix:l10n` localmente e envie as
alterações em um novo _commit_.

### `TEST (excluding test:base)` {.notranslate lang=en}

Executa `npm run test:compound-tests`, que executa os scripts NPM compostos
`test:*-*` (por exemplo, testes de _edge functions_ do Netlify). Ele **não**
executa `test:base`.
