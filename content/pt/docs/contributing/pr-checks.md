---
title: Verificações de pull request
description:
  Saiba como fazer seu pull request passar por todas as verificações com sucesso
weight: 40
default_lang_commit: 4839e453a5e22a108fa0b4fce2577cc6aab6f7ec
---

Ao abrir um
[_pull request_](https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request)
(PR) no
[repositório opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io),
um conjunto de verificações é executado. As verificações garantem que:

- Você assinou o [CLA](#easy-cla)
- Seu PR é [implantado com sucesso através do Netlify](#netlify-deployment)
- Suas alterações estão em conformidade com nosso [guia de estilo](#checks)

{{% alert title="Nota" %}}

Caso alguma das verificações falhe, tente
[resolver os problemas do conteúdo](../pull-requests/#fix-issues) primeiro,
executando o comando `npm run fix:all` localmente.

Você também pode adicionar o comentário `/fix:all` ao seu PR. Isso fará com que
o _OpenTelemetry Bot_ execute esse comando por você e atualize o PR.
Certifique-se de sincronizar essas alterações localmente com o comando _git
pull_.

Caso os problemas persistam, leia abaixo o que cada verificação faz e como você
pode recuperar o PR de um estado de falha.

{{% /alert %}}

## `Easy CLA` {#easy-cla}

Esta verificação falha caso você ainda não tenha
[assinado o CLA](../prerequisites/#cla).

## Implantação com Netlify {#netlify-deployment}

Caso a [implantação através do Netlify](https://www.netlify.com/) falhe,
selecione **Detalhes** para mais informações.

## GitHub PR checks {#checks}

Para garantir que as contribuições sigam nosso
[guia de estilo](../style-guide/), implementamos um conjunto de verificações que
checam as regras do guia e falham caso encontrem algum problema.

A lista a seguir descreve as verificações atuais e como corrigir os erros
relacionados:

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

Essa verificação garante que
[todas as palavras estejam corretamente escritas](../style-guide/#spell-checking).

Se essa verificação falhar, execute `npm run check:spelling` localmente para ver
as palavras incorretamente escritas. Caso a palavra esteja escrita corretamente,
adicione-a à seção `cSpell:ignore` no _front matter_ do arquivo.

### `CSPELL` check {.notranslate lang=en}

Essa verificação garante que todas as palavras na lista de ignorados do cSpell
estejam normalizadas.

Se essa verificação falhar, execute `npm run fix:dict` localmente e envie as
alterações em um novo _commit_.

### `FILENAME check` {.notranslate lang=en}

Essa verificação garante que todos os
[arquivos estejam formatados com o Prettier](../style-guide/#file-format).

Se essa verificação falhar, execute `npm run fix:format` localmente e envie as
alterações em um novo _commit_.

### `FILE FORMAT` {.notranslate lang=en}

Essa verificação garante que todos os
[nomes de arquivos estejam em kebab-case](../style-guide/#file-names).

Se essa verificação falhar, execute `npm run fix:filenames` localmente e envie
as alterações em um novo _commit_.

### `BUILD and CHECK LINKS` {.notranslate lang=en}

Estas duas verificações compilam o site e verificam que todos os _links_ são
válidos.

Para compilar e verificar os links localmente, execute `npm run check:links`.
Esse comando também atualiza o cache de referências (_refcache_). Envie as
alterações no cache em um novo _commit_.

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
`?no-link-check`. Por exemplo, <https:/some-example.org?no-link-check> será
ignorado pelo verificador de links.

{{% alert title="Dica para mantenedores" %}}

Os mantenedores podem executar o seguinte script imediatamente após terem
executado o verificador de links para fazer com que o Puppeteer tente validar
links com status não-ok:

```sh
./scripts/double-check-refcache-4XX.mjs
```

Utilize o parâmetro `-f` para validar também fragmentos de URL (âncoras) em
links externos, algo que o `htmltest` não faz. Atualmente, não executamos esse
script com frequência, então você provavelmente desejará limitar o número de
entradas atualizadas através do parâmetro `-m N`. Para mais informações de uso,
utilize o parâmetro `-h`.

{{% /alert %}}

### `WARNINGS in build log?` {.notranslate lang=en}

Se essa verificação falhar, revise o log `BUILD and CHECK LINKS`, na etapa
`npm run log:check:links`, para identificar possíveis problemas adicionais. Caso
não tenha certeza de como resolver, peça ajuda aos mantenedores.
