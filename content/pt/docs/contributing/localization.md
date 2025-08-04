---
title: Localização do site
description: Criando e mantendo páginas do site em localizações não inglesas.
linkTitle: Localização
weight: 25
default_lang_commit: b089f21094014118017cf32ffeea6b50afc3579f
cSpell:ignore: mergeado ptbr shortcodes
---

O site do OTel usa o [framework multilíngue] do Hugo para dar suporte a
localizações de páginas. O inglês é o idioma padrão, com o inglês americano como
localização padrão (implícita). Um número crescente de outras localizações é
suportado, como pode ser visto no menu suspenso de idiomas na navegação
superior.

## Orientação para tradução

Ao traduzir páginas do inglês, recomendamos que você siga a orientação oferecida
nesta seção.

### Resumo

#### ✅ O que fazer {#do}

<div class="border-start border-success bg-success-subtle">

- **Traduzir**:
  - Conteúdo das páginas, incluindo:
    - Campos de texto de [diagramas](#images) Mermaid
    - Comentários de trechos de código (opcional)
  - Valores dos campos [Front matter][] para `title`, `linkTitle`, e
    `description`
  - **Todo** conteúdo da página e front matter, a menos que indicado o contrário
- **Preservar** o _conteúdo_, _significado_, e _estilo_ do texto original
- **Perguntar** aos [maintainers] se você tiver dúvidas ou perguntas através de:
  - Canais do [Slack], como `#otel-docs-localization`, `#otel-localization-ptbr`
    ou `#otel-comms`
  - [Discussion], issue, ou comentário de PR

[Discussion]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ O que NÃO fazer {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **Não traduzir**:
  - **Nomes de arquivos ou diretórios** de recursos neste repositório
  - [Links](#links), isso inclui [IDs de cabeçalho](#headings) [^*]
  - Trechos de código inline como estes: `exemplo de código inline`
  - Elementos Markdown marcados como `notranslate` (geralmente como uma classe
    CSS), em particular para [cabeçalhos](#headings)
  - Campos [Front matter][] diferentes daqueles listados em [O que fazer](#do).
    Especificamente, não traduza `aliases`. Na dúvida, pergunte aos maintainers.
  - Código
- Não criar **cópias de imagens**, a menos que você
  [localize texto nas imagens](#images)
- Não adicionar novo ou alterar:
  - **Conteúdo** que seria diferente do significado originalmente pretendido
  - **Estilo** de apresentação, incluindo: _formatação_, _layout_, e estilo de
    _design_ (tipografia, capitalização de letras e espaçamento, por exemplo).

[^*]: Para exceções, veja [Links](#links).

</div>

### IDs de cabeçalho {#headings}

Para garantir que os alvos das âncoras dos cabeçalhos estejam padronizados entre
as localizações, ao traduzir cabeçalhos:

- Preserve o ID explícito do cabeçalho, se ele tiver um. A [sintaxe de ID de
  cabeçalho][] é escrita após o texto do cabeçalho usando sintaxe como
  `{ #some-id }`.
- Caso contrário, declare explicitamente um ID de cabeçalho correspondente ao ID
  autogerado do cabeçalho inglês original.

[sintaxe de ID de cabeçalho]:
  https://github.com/yuin/goldmark/blob/master/README.md#headings

### Links {#links}

**Não** traduza referências de links. Isso vale para links externos, caminhos
para páginas do site e recursos locais da seção, como [imagens](#images).

A única exceção é para links para páginas externas (como
<https://en.wikipedia.org>) que tenham uma versão específica para sua
localização. Geralmente isso significa substituir o `en` na URL pelo código do
idioma da sua localização.

{{% alert title="Nota" %}}

O repositório do site do OTel tem um hook render-link customizado que o Hugo usa
para converter caminhos de links absolutos referindo-se a páginas de
documentação. **Links da forma `/docs/some-page` são tornados específicos da
localização** prefixando o caminho com o código do idioma da página ao
renderizar o link. Por exemplo, o caminho de exemplo anterior se tornaria
`/ja/docs/some-page` quando renderizado de uma página japonesa.

{{% /alert %}}

### Labels de definição de links {#link-labels}

Autores de localização podem escolher traduzir ou não [labels] de [definições de
links][] Markdown. Se você escolher manter o label em inglês, então siga a
orientação dada nesta seção.

Por exemplo, considere o seguinte Markdown:

```markdown
[Hello], world! Welcome to the [OTel website][].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

Isso seria traduzido em português como:

```markdown
[Olá][hello], mundo! Bem-vindo ao [site OTel][OTel website].

[hello]: https://code.org/helloworld
[OTel website]: https://opentelemetry.io
```

[labels]: https://spec.commonmark.org/0.31.2/#link-label
[definições de links]:
  https://spec.commonmark.org/0.31.2/#link-reference-definitions

### Imagens e diagramas {#images}

**Não** faça cópias de arquivos de imagem a menos que você localize texto na
própria imagem[^shared-images].

**Traduza** texto em diagramas [Mermaid][].

[^shared-images]:
    Hugo é inteligente sobre a forma como renderiza arquivos de imagem que são
    compartilhados entre localizações do site. Ou seja, Hugo produzirá um
    _único_ arquivo de imagem e o compartilhará entre localizações.

[Mermaid]: https://mermaid.js.org

### Arquivos de inclusão {#includes}

**Traduza** fragmentos de página encontrados nos diretórios `_includes` da mesma
forma que você traduziria qualquer outro conteúdo de página.

### Shortcodes

{{% alert title="Nota" %}}

A partir de fevereiro de 2025, estamos no processo de migração de shortcodes
para [arquivos de inclusão](#includes) como meio de suportar conteúdo
compartilhado de página.

{{% /alert %}}

Alguns dos shortcodes base contêm texto em inglês que você pode precisar
localizar -- especialmente para aqueles contidos em [layouts/shortcodes/docs].

Se você precisar criar uma versão localizada de um shortcode, coloque-o em
`layouts/shortcodes/pt`, onde `pt` é o código do idioma da sua localização. A
partir daí, use o mesmo caminho relativo do shortcode base original.

[layouts/shortcodes/docs]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/shortcodes/docs

## Acompanhando inconsistências em páginas localizadas {#track-changes}

Um dos principais desafios de manter páginas localizadas é identificar quando as
páginas correspondentes em inglês foram atualizadas. Esta seção explica como
lidamos com isso.

### O campo de front-matter `default_lang_commit`

Quando uma página localizada é escrita, como `content/pt/<some-path>/page.md`,
esta tradução é baseada em um commit específico da [branch `main`][main] da
versão correspondente em inglês da página em `content/en/<some-path>/page.md`.
Neste repositório, toda página localizada identifica o commit da página em
inglês no front matter da página localizada da seguinte forma:

```markdown
---
title: Seu título de página localizada
# ...
default_lang_commit: <commit-hash-mais-recente-da-pagina-original>
---
```

O front matter acima estaria em `content/pt/<some-path>/page.md`. O hash do
commit corresponderia ao commit mais recente de `content/en/<some-path>/page.md`
da branch `main`.

### Acompanhando mudanças nas páginas em inglês

À medida que atualizações são feitas nas páginas em inglês, você pode acompanhar
as páginas localizadas correspondentes que precisam de atualização executando o
seguinte comando:

```console
$ npm run check:i18n
1       1       content/en/docs/platforms/kubernetes/_index.md - content/zh/docs/platforms/kubernetes/_index.md
...
```

Você pode restringir as páginas alvo a uma ou mais localizações fornecendo
caminho(s) assim:

```sh
npm run check:i18n -- content/pt
```

### Visualizando detalhes das mudanças

Para quaisquer páginas localizadas que precisem de atualização, você pode ver os
detalhes do diff das páginas correspondentes em inglês usando a flag `-d` e
fornecendo os caminhos para suas páginas localizadas, ou omitir os caminhos para
ver todas. Por exemplo:

```console
$ npm run check:i18n -- -d content/zh/docs/platforms/kubernetes
diff --git a/content/en/docs/platforms/kubernetes/_index.md b/content/en/docs/platforms/kubernetes/_index.md
index 3592df5d..c7980653 100644
--- a/content/en/docs/platforms/kubernetes/_index.md
+++ b/content/en/docs/platforms/kubernetes/_index.md
@@ -1,7 +1,7 @@
 ---
 title: OpenTelemetry with Kubernetes
 linkTitle: Kubernetes
-weight: 11
+weight: 350
 description: Using OpenTelemetry with Kubernetes
 ---
```

### Adicionando `default_lang_commit` a novas páginas

Ao criar páginas para sua localização, lembre-se de adicionar
`default_lang_commit` ao front matter da página junto com um hash de commit
apropriado da `main`.

Se sua tradução de página é baseada em uma página em inglês na `main` em
`<hash>`, então execute o seguinte comando para adicionar automaticamente
`default_lang_commit` ao front matter do arquivo da sua página usando o commit
`<hash>`. Você pode especificar `HEAD` como argumento se suas páginas estão
agora sincronizadas com a `main` em `HEAD`. Por exemplo:

```sh
npm run check:i18n -- -n -c 1ca30b4d content/ja
npm run check:i18n -- -n -c HEAD content/zh/docs/concepts
```

Para listar arquivos de páginas de localização com chaves de hash faltando,
execute:

```sh
npm run check:i18n -- -n
```

### Atualizando `default_lang_commit` para páginas existentes

Ao atualizar suas páginas localizadas para corresponder às mudanças feitas na
página correspondente em inglês, certifique-se de que você também atualize o
hash do commit `default_lang_commit`.

{{% alert title="Dica" %}}

Se sua página localizada agora corresponde à versão em inglês na `main` em
`HEAD`, então apague o valor do hash do commit no front matter, e execute o
comando **add** dado na seção anterior para atualizar automaticamente o valor do
campo `default_lang_commit`.

{{% /alert %}}

Se você atualizou em lote todas as suas páginas de localização que possuíam
inconsistências, você pode atualizar o hash do commit desses arquivos usando a
flag `-c` seguida por um hash de commit ou 'HEAD' para usar `main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

{{% alert title="Importante" %}}

Quando você usa `HEAD` como especificador de hash, o script usará o hash da
`main` em HEAD no seu **ambiente local**. Certifique-se de fazer fetch e pull da
`main`, se você quiser que HEAD corresponda à `main` no GitHub.

{{% /alert %}}

### Status de inconsistência

Execute `npm run fix:i18n:status` para adicionar um campo de front-matter
`drifted_from_default` àquelas páginas de localização alvo que possuem
inconsistências. Este campo será usado em breve para exibir um banner no topo
das páginas que derivaram em relação às suas respectivas páginas em inglês.

### Ajuda do script

Para mais detalhes sobre o script, execute `npm run check:i18n -- -h`.

## Novas localizações

### Nova equipe de localização

Para iniciar uma nova localização para o site do OpenTelemetry, você precisa de:

1. Um **mentor de localização** que seja familiar com seu idioma, como um
   [aprovador ativo][] do [Glossário CNCF][], ou do [site do Kubernetes][].
2. Pelo menos dois contribuidores interessados.

[aprovador ativo]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[Glossário CNCF]: https://glossary.cncf.io/
[site do Kubernetes]: https://github.com/kubernetes/website

Uma vez que você estiver pronto:

1. Crie uma [nova issue][] para compartilhar seu interesse em contribuir.

2. Adicione os usernames do GitHub do mentor e dos possíveis contribuidores.

3. Procure o [código ISO 639-1][] oficial para o idioma que você quer adicionar.
   Vamos nos referir a este código de idioma como `LANG_ID` no restante desta
   seção.

4. Adicione a seguinte lista de tarefas ao comentário de abertura da sua issue:

   ```markdown
   - [ ] Informações do idioma:
     - Código de idioma ISO 639-1: `LANG_ID`
     - Nome do idioma: ADICIONE_NOME_AQUI
   - [ ] Informações da equipe de localização:
     - [ ] Mentor da localização: @GITHUB_USERNAME1, @GITHUB_USERNAME2, ...
     - [ ] Contribuidores: @GITHUB_USERNAME1, @GITHUB_USERNAME2, ...
   - [ ] Ler a página de
         [Localização](https://opentelemetry.io/docs/contributing/localization/)
         e todas as outras páginas na seção Contribuindo
   - [ ] Localizar homepage do site para SEU_NOME_DO_IDIOMA
   - [ ] Maintainers OTel:
     - [ ] Atualizar `hugo.yaml`
     - [ ] Configurar cSpell e suporte de outras ferramentas
     - [ ] Criar um label de issue para `lang:LANG_ID`
     - [ ] Criar grupo de nível de organização para aprovadores `LANG_ID`
     - [ ] Atualizar proprietários de componentes para `content/LANG_ID`
   ```

5. [Submeta um pull request](../pull-requests/) com uma tradução da [homepage]
   do site, e _nada mais_, no arquivo `content/LANG_ID/_index.md`. Certifique-se
   de que os maintainers tenham as permissões necessárias para editar seu PR, já
   que eles adicionarão mudanças adicionais ao seu PR que são necessárias para
   iniciar seu projeto de localização.

[código ISO 639-1]: https://en.wikipedia.org/wiki/ISO_639-1
[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

Após seu primeiro PR ser mergeado, os maintainers configurarão o label da issue,
o grupo de nível de organização e os proprietários do componente.

{{% alert title="Nota" %}}

Você não precisa ser um contribuidor existente do projeto OpenTelemetry para
iniciar uma nova localização. No entanto, você não será adicionado como membro
da [organização GitHub OpenTelemetry](https://github.com/open-telemetry/) ou
como membro do grupo de aprovadores para sua localização. Você precisará
satisfazer os requisitos para se tornar um membro oficial e aprovador conforme
descrito nas
[diretrizes de membership](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md).

Ao iniciar o projeto de localização, os maintainers tratarão suas revisões como
se você já fosse um aprovador.

{{% /alert %}}

### Lista de verificação do maintainer OTel

#### Hugo

Atualize o arquivo `hugo.yaml`. Adicione entradas apropriadas para `LANG_ID` em:

- `languages`
- `module.mounts`. Adicione pelo menos uma entrada `source`-`target` para
  `content`. Considere adicionar entradas para páginas de fallback `en` apenas
  quando a localização tiver conteúdo suficiente.

#### Ortografia

Procure por [dicionários cSpell][] disponíveis como pacotes NPM
[@cspell/dict-LANG_ID][]. Se um dicionário não estiver disponível para seu
dialeto ou região, escolha a região mais próxima.

Se nenhum dicionário estiver disponível, então pule o resto desta subseção. Caso
contrário:

- Adicione o pacote NPM como dependência de desenvolvimento, por exemplo:
  `npm install --save-dev @cspell/dict-pt-br`.
- Crie `.cspell/LANG_ID-words.txt` como as palavras do dicionário local do site
  para `LANG_ID`.
- Em `.cspell.yml`, adicione entradas para:
  - `import`
  - `dictionaryDefinitions`
  - `dictionaries`: adicione duas entradas aqui, uma para `LANG_ID` e uma para
    `LANG_ID-words.txt`

[dicionários cSpell]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict

#### Suporte de outras ferramentas

- Suporte do Prettier: se `LANG_ID` não for bem suportado pelo Prettier,
  adicione regras de ignore a `.prettierignore`

## Orientação para aprovadores e maintainers

### PRs com mudanças semânticas não devem abranger localizações {#prs-should-not-span-locales}

Aprovadores devem garantir que PRs fazendo mudanças **semânticas** em páginas de
documentação não abranjam múltiplas localizações. Uma mudança semântica é aquela
que impacta o _significado_ do conteúdo da página. Nosso
[processo de localização](.) de documentação garante que aprovadores de
localização irão, com o tempo, revisar as edições em inglês para determinar se
as mudanças são apropriadas para sua localização, e a melhor forma de
incorporá-las em sua localização. Se mudanças forem necessárias, os aprovadores
de localização as farão via seus próprios PRs específicos da localização.

### Mudanças puramente editoriais entre localizações são OK {#patch-locale-links}

Atualizações de páginas **puramente editoriais** como corrigir caminhos de links
quebrados podem abranger localizações. Uma mudança puramente editorial é aquela
que **não** impacta o significado do conteúdo da página.

Por exemplo, às vezes mudanças na documentação em inglês podem resultar em
falhas de verificação de links para localizações não inglesas. Isso acontece
quando páginas de documentação são movidas ou deletadas.

Em tais situações, faça as seguintes atualizações para cada página não inglesa
que tem um caminho que falha na verificação de links:

- Atualize a referência do link para o novo caminho da página.
- Adicione o comentário YAML `# patched` no final da linha para a linha de front
  matter `default_lang_commit`.
- Não faça outras mudanças no arquivo.
- Execute novamente `npm run check:links` e certifique-se de que não restam
  falhas de links.

Quando um _link externo_ para um recurso **movido** (mas semanticamente
**inalterado**), como um arquivo do GitHub, resulta em uma falha de verificação
de link, considere:

- Remover o link quebrado do refcache
- Atualizar o link em todas as localizações usando o método descrito
  anteriormente nesta seção.

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[framework multilíngue]: https://gohugo.io/content-management/multilingual/
[nova issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[slack]: https://slack.cncf.io/
