---
title: Localização do site
description: Criando e mantendo páginas do site em localizações não inglesas.
linkTitle: Localização
weight: 25
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
cSpell:ignore: Dowair merge ptbr shortcodes
---

O site do OTel usa o [framework multilíngue][multilingual framework] do Hugo
para dar suporte a localizações de páginas. O inglês é o idioma padrão, com o
inglês americano como localização padrão (implícita). Um número crescente de
outras localizações é suportado, como pode ser visto no menu suspenso de idiomas
na navegação superior.

## Orientação para tradução {#translation-guidance}

Ao traduzir páginas do inglês, recomendamos que você siga a orientação oferecida
nesta seção.

### Resumo {#summary}

#### ✅ O que fazer {#do}

<div class="border-start border-success bg-success-subtle">

- **Traduzir**:
  - Conteúdo das páginas, incluindo:
    - Campos de texto de [diagramas](#images) Mermaid
    - Comentários de trechos de código (opcional)
  - Valores dos campos _[Front matter][]_ para `title`, `linkTitle`, e
    `description`
  - **Todo** conteúdo da página e _front matter_, a menos que indicado o
    contrário
- **Preservar** o _conteúdo_, _significado_, e _estilo_ do texto original
- **Envie o trabalho _incrementalmente_** através de
  [pequenos _pull requests_](#small-prs)
- **Perguntar** aos [mantenedores][maintainers] em caso de dúvidas, através de:
  - Canais do [Slack][], como `#otel-docs-localization`,
    `#otel-localization-ptbr` ou `#otel-comms`
  - [Discussões][Discussion], _issue_, ou comentário de PR

[Discussion]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ O que NÃO fazer {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **Não traduzir**:
  - [Tipos de alerta](../style-guide/#alerts) como `TIP`, `WARNING`, etc. Isso é
    garantido por uma regra do [linter `MARKDOWN`][`MARKDOWN` linter].
  - Código, incluindo blocos de código e código em linha (como este
    `exemplo de código inline`)
  - **Nomes de arquivos ou diretórios** de recursos neste repositório
  - Campos _[Front matter][]_ diferentes daqueles listados em
    [O que fazer](#do). Especificamente, não traduza `aliases`. Na dúvida,
    pergunte aos mantenedores.
  - [Links](#links), isso inclui [IDs de cabeçalho](#headings) [^*]
  - Elementos _Markdown_ marcados como `notranslate` (geralmente como uma classe
    CSS), em particular para [cabeçalhos](#headings)
- Não criar **cópias de imagens e outros recursos**, a menos que você
  [localize texto neles](#images)
- Não marcar uma página localizada como **[rascunho](#drafts)**
- Não adicionar novo ou alterar:
  - **Conteúdo** que seria diferente do significado originalmente pretendido
  - **Estilo** de apresentação, incluindo: _formatação_, _layout_, e estilo de
    _design_ (tipografia, capitalização de letras e espaçamento, por exemplo).

[^*]: Para uma possível exceção, veja [Links](#links).

[`MARKDOWN` linter]: ../pr-checks/#markdown-linter

</div>

#### Uso de ferramentas de IA {#ai-tools}

Ao usar ferramentas de IA generativa (como ChatGPT, Gemini ou similares) para
auxiliar nas traduções, é obrigatório seguir a [Política de Contribuição de IA
Generativa][genai-policy] do OpenTelemetry e a [Política de IA
Generativa][lf-ai-policy] da Linux Foundation. Em particular:

- **Declare** o uso de IA marcando a opção apropriada no [modelo de _pull
  request_][pull request template].
- **Revise e valide** todas as traduções geradas por IA quanto à precisão. Você
  é responsável pelo conteúdo que envia.
- **Não envie** traduções geradas por IA que não possam ser revisadas e
  verificadas por você (por exemplo, contribuições em idiomas nos quais você não
  é proficiente). Isso cria um gargalo significativo de revisão, e seu PR pode
  ser fechado para preservar a disponibilidade dos mantenedores.

[genai-policy]:
  https://github.com/open-telemetry/community/blob/main/policies/genai.md
[lf-ai-policy]: https://www.linuxfoundation.org/legal/generative-ai
[pull request template]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/PULL_REQUEST_TEMPLATE.md

### IDs de cabeçalho {#headings}

Para garantir que os alvos das âncoras dos cabeçalhos estejam padronizados entre
as localizações, ao traduzir cabeçalhos:

- Preserve o ID explícito do cabeçalho, se ele tiver um. A [sintaxe de ID de
  cabeçalho][Heading ID syntax] é escrita após o texto do cabeçalho usando
  sintaxe como `{ #some-id }`.
- Caso contrário, declare explicitamente um ID de cabeçalho correspondente ao ID
  autogerado do cabeçalho inglês original.

[Heading ID syntax]:
  https://github.com/yuin/goldmark/blob/master/README.md#headings

### Links {#links}

**Não** traduza referências de links. Isso vale para links externos, caminhos
para páginas do site e recursos locais da seção, como
[imagens e outros recursos](#images).

A única exceção é para links para páginas externas (como
<https://en.wikipedia.org>) que tenham uma versão específica para sua
localização. Geralmente isso significa substituir o `en` na URL pelo código do
idioma da sua localização.

> [!NOTE]
>
> O repositório do site do OTel tem um _hook_ render-link customizado que o Hugo
> usa para converter caminhos de links absolutos referindo-se a páginas de
> documentação. **Links da forma `/docs/some-page` são tornados específicos da
> localização** prefixando o caminho com o código do idioma da página ao
> renderizar o link. Por exemplo, o caminho de exemplo anterior se tornaria
> `/pt/docs/some-page` quando renderizado de uma página em português.

### Labels de definição de links {#link-labels}

Autores de localização podem escolher traduzir ou não _[labels][]_ de
[definições de links][link definitions] _Markdown_. Se você escolher manter o
_label_ em inglês, então siga a orientação dada nesta seção.

Por exemplo, considere o seguinte _Markdown_:

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
[link definitions]:
  https://spec.commonmark.org/0.31.2/#link-reference-definitions

### Imagens e outros recursos {#images}

- **Não** faça cópias de arquivos de imagem, vídeo ou outros recursos que não
  sejam de conteúdo, a menos que você localize texto no próprio arquivo.
  - O Hugo é inteligente sobre a forma como renderiza arquivos de imagem que são
    compartilhados entre localizações do site. Ou seja, o Hugo produzirá um
    _único_ arquivo de imagem e o compartilhará entre localizações. Para mais
    detalhes, consulte [Page bundles][].
  - Isso é garantido pela verificação [`LOCALIZATION` guidelines][l10n-check].

- **Traduza** texto em diagramas [Mermaid][].

[l10n-check]: ../pr-checks/#localization
[Mermaid]: https://mermaid.js.org
[Page bundles]: https://gohugo.io/content-management/multilingual/#page-bundles

### Páginas de rascunho {#drafts}

**Não** marque uma página localizada como rascunho (`draft: true`), mesmo quando
a página em inglês for um. Para páginas de documentação, quando sua localização
não tem uma tradução, o site exibe a página em inglês no mesmo caminho (o
**_fallback_** em inglês). Um rascunho localizado ocupa esse caminho, mas é
omitido do _build_ de produção, então, assim que a página em inglês é publicada,
os leitores da sua localização recebem um erro 404 em vez dela. Como a regra
vale independentemente de a página em inglês ser um rascunho ou não, publicar
uma página em inglês nunca deixa um rascunho localizado para trás. Traduza uma
página assim que sua versão em inglês for publicada.

Isso é garantido pela verificação [`WARNINGS in build log?`][warnings-check].
Para corrigir uma página sinalizada: se a página em inglês correspondente
estiver publicada, remova `draft: true` e marque a página como
[_patched_](#patched), a menos que ela seja sincronizada na mesma alteração;
caso contrário, remova a página localizada até que a página em inglês seja
publicada.

[warnings-check]: ../pr-checks/#localized-drafts

### Arquivos de inclusão {#includes}

**Traduza** fragmentos de página encontrados nos diretórios `_includes` da mesma
forma que você traduziria qualquer outro conteúdo de página.

### Shortcodes

> [!NOTE]
>
> A partir de fevereiro de 2025, estamos no processo de migração de _shortcodes_
> para [arquivos de inclusão](#includes) como meio de suportar conteúdo
> compartilhado de página.

Alguns dos _shortcodes_ base contêm texto em inglês que você pode precisar
localizar -- especialmente para aqueles contidos em
[layouts/_shortcodes/docs][].

Se você precisar criar uma versão localizada de um _shortcode_, coloque-o em
`layouts/_shortcodes/pt`, onde `pt` é o código do idioma da sua localização. A
partir daí, use o mesmo caminho relativo do _shortcode_ base original.

[layouts/_shortcodes/docs]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/layouts/_shortcodes/docs

## Acompanhando inconsistências em páginas localizadas {#track-changes}

Um dos principais desafios de manter páginas localizadas é identificar quando as
páginas correspondentes em inglês foram atualizadas. Esta seção explica como
lidamos com isso.

### O campo de front-matter `default_lang_commit` {#the-default_lang_commit-front-matter-field}

Quando uma página localizada é escrita, como `content/pt/<some-path>/page.md`,
esta tradução é baseada em um _commit_ específico da [_branch_ `main`][main] da
versão correspondente em inglês da página em `content/en/<some-path>/page.md`.
Neste repositório, toda página localizada identifica o _commit_ da página em
inglês no _front matter_ da página localizada da seguinte forma:

```markdown
---
title: Seu título de página localizada
# ...
default_lang_commit: <commit-hash-mais-recente-da-pagina-original>
---
```

O _front matter_ acima estaria em `content/pt/<some-path>/page.md`. O _hash_ do
_commit_ corresponderia ao _commit_ mais recente de
`content/en/<some-path>/page.md` da _branch_ `main`.

### Acompanhando mudanças nas páginas em inglês {#tracking-changes-to-english-pages}

À medida que atualizações são feitas nas páginas em inglês, você pode acompanhar
as páginas localizadas correspondentes que precisam de atualização executando o
seguinte comando:

```console
$ npm run check:i18n
> Drifted file: content/pt/docs/platforms/kubernetes/_index.md
...
DRIFTED files: 361 out of 990
```

Você pode restringir as páginas alvo a uma ou mais localizações fornecendo
caminho(s) assim:

```sh
npm run check:i18n -- content/pt
```

### Visualizando detalhes das mudanças {#viewing-change-details}

Para quaisquer páginas localizadas que precisem de atualização, você pode ver os
detalhes do diff das páginas correspondentes em inglês usando o subcomando
`diff` e fornecendo os caminhos para suas páginas localizadas. Por exemplo:

```console
$ npm run check:i18n -- diff content/pt/docs/platforms/kubernetes
# content/pt/docs/platforms/kubernetes/_index.md: drifted from 1ca30b4d
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

### Adicionando `default_lang_commit` a novas páginas {#adding-default_lang_commit-to-new-pages}

Ao criar páginas para sua localização, lembre-se de adicionar
`default_lang_commit` ao _front matter_ da página junto com um _hash_ de
_commit_ apropriado da _branch_ `main`.

Se sua tradução de página é baseada em uma página em inglês na `main` em
`<HASH>`, então execute o seguinte comando para adicionar automaticamente
`default_lang_commit` ao _front matter_ do arquivo da sua página usando o
_commit_ `<HASH>`. Você pode especificar `HEAD` como argumento se suas páginas
estão agora sincronizadas com a `main` em `HEAD`. Por exemplo:

```sh
npm run check:i18n -- commit 1ca30b4d --new content/ja
npm run check:i18n -- commit HEAD --new content/pt/docs/concepts
```

Para listar arquivos de páginas de localização com chaves de _hash_ faltando,
execute:

```sh
npm run check:i18n -- --new
```

### Atualizando `default_lang_commit` para páginas existentes {#updating-default_lang_commit-for-existing-pages}

Ao atualizar suas páginas localizadas para corresponder às mudanças feitas na
página correspondente em inglês, certifique-se de que você também atualize o
_hash_ do _commit_ `default_lang_commit`.

> [!TIP]
>
> Se sua página localizada agora corresponde à versão em inglês na `main` em
> `HEAD`, então execute `npm run check:i18n -- commit HEAD <PATH-TO-YOUR-PAGE>`:
> o _hash_ `default_lang_commit` é atualizado e o
> [status de inconsistência](#drift-status) da página é removido na mesma
> escrita.

Se você atualizou em lote todas as suas páginas de localização que possuíam
inconsistências, é possível atualizar o _hash_ do _commit_ desses arquivos
utilizando o subcomando `commit` seguido por um _hash_ de _commit_ ou 'HEAD'
para usar `main@HEAD`.

```sh
npm run check:i18n -- commit <HASH> <PATH-TO-YOUR-UPDATED-FILES>
npm run check:i18n -- commit HEAD <PATH-TO-YOUR-UPDATED-FILES>
```

> [!IMPORTANT]
>
> Ao utilizar `HEAD` como referência de _hash_, o _script_ utilizará o _hash_ da
> _branch_ `main` no seu **ambiente local**. Certifique-se de executar _fetch_ e
> _pull_ da `main` caso queira que HEAD corresponda ao estado atual da `main` no
> GitHub.

### Aplicando correções pontuais em páginas localizadas {#patched}

Algumas correções editam uma página localizada sem sincronizá-la com sua
contraparte em inglês: [correções de _build_](#keep-checks-green), como reparar
a invocação de um _shortcode_ após uma mudança no _shortcode_ compartilhado, e
correções exigidas por uma verificação, como remover a marcação de
[rascunho](#drafts). Marque cada página localizada corrigida dessa forma como
**_patched_**, independentemente de a correção abranger ou não várias
localizações:

- Faça apenas as edições que a correção exige — nenhuma outra alteração na
  página.
- Adicione o comentário YAML `# patched` ao final da linha `default_lang_commit`
  da página:

  ```yaml
  default_lang_commit: abc4567... # patched
  ```

O marcador é reservado para esse tipo de correção mecânica —
[mudanças semânticas](#semantic-changes) nunca o utilizam. O marcador informa à
equipe de localização da página que ela foi corrigida sem ser sincronizada: o
_hash_ ainda registra o último ponto de sincronização. O marcador é removido na
próxima vez que o _hash_ da página for
[atualizado](#updating-default_lang_commit-for-existing-pages).

### Status de inconsistência {#drift-status}

O campo de _front matter_ `drifted_from_default` marca uma página localizada
como desatualizada: a página exibe um banner de "desatualizada", e o verificador
de links a ignora, para que links quebrados em páginas desatualizadas não façam
a CI falhar. O verificador de links não depende apenas desse campo: cópias
localizadas de páginas em inglês alteradas desde a última sincronização de
status em toda a árvore também são ignoradas, como
[_drift pending_](/site/build/link-checking/#configuration).

A [execução diária de _Housekeeping_](/site/build/ci-workflows/#housekeeping)
mantém o campo sincronizado em toda a árvore; PRs não atualizam o status de
páginas que não alteram por outros motivos. Cada página que um PR **altera**
deve sair do PR com um estado de inconsistência preciso, como exige o
`I18N check`: sincronize a página com sua contraparte em inglês e
[atualize seu _hash_](#updating-default_lang_commit-for-existing-pages) — o
status é removido na mesma escrita — ou registre a inconsistência restante com
`npm run fix:i18n:status -- <PATHS>`. Os _hashes_ só podem apontar para
_commits_ na `main`, então uma página sincronizada com mudanças em inglês feitas
no mesmo PR registra a inconsistência restante até que essas mudanças sejam
mescladas.

### Ajuda do script {#script-help}

Para mais detalhes sobre o _script_, execute `npm run check:i18n -- -h`.

## Novas localizações {#new-localizations}

Possui interesse em iniciar uma nova localização para o site do OTel? Entre em
contato com os mantenedores para demonstrar seu interesse, por exemplo através
de uma discussão no GitHub ou via canal do Slack `#otel-docs-localization`. Esta
seção explica as etapas envolvidas na criação de uma nova localização.

> [!NOTE]
>
> Você não precisa ser um contribuidor atual do projeto OpenTelemetry para
> iniciar uma nova localização. No entanto, você não será adicionado como membro
> da [organização OpenTelemetry no GitHub](https://github.com/open-telemetry/)
> ou como membro do grupo de aprovadores para sua localização até cumprir os
> requisitos para se tornar um membro oficial e aprovador conforme descrito nas
> [diretrizes de associação][membership guidelines].
>
> Antes de obter o _status_ de aprovador, você pode indicar sua aprovação de um
> PR de localização adicionando um comentário "LGTM" (_Looks Good To Me_).
> Durante esta fase inicial, os mantenedores tratarão suas revisões como se você
> já fosse um aprovador.

[membership guidelines]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md

### 1. Monte uma equipe de localização {#team}

Criar uma localização é sobre formar uma comunidade ativa e colaborativa. Para
iniciar uma nova localização do site do OpenTelemetry, você precisará de:

1. Um **mentor de localização** que seja familiar com seu idioma, como um
   [aprovador ativo][active approver] do [Glossário CNCF][CNCF Glossary], ou do
   [site do Kubernetes][Kubernetes website].
2. Pelo menos dois contribuidores interessados.

[active approver]: https://github.com/cncf/glossary/blob/main/CODEOWNERS
[CNCF Glossary]: https://glossary.cncf.io/
[Kubernetes website]: https://github.com/kubernetes/website

### 2. Início da localização: crie uma _issue_ {#kickoff}

Com uma [equipe de localização](#team) formada (ou em processo de formação),
crie uma _issue_ com a seguinte lista de tarefas:

1. Procure o [código ISO 639-1][ISO 639-1 code] oficial para o idioma que você
   quer adicionar. Vamos nos referir a este código de idioma como `LANG_ID` no
   restante desta seção. Caso tenha dúvidas sobre qual código utilizar,
   especialmente ao escolher uma sub-região, consulte os mantenedores.

   [ISO 639-1 code]: https://en.wikipedia.org/wiki/ISO_639-1

2. Identifique os usuários do GitHub do
   [mentor e dos possíveis contribuidores](#team).

3. Crie uma [nova issue][new issue] contendo a seguinte lista de tarefas no
   comentário inicial:

   ```markdown
   - [ ] Informações do idioma:
     - Código de idioma ISO 639-1: `LANG_ID`
     - Nome do idioma: ADICIONE_NOME_AQUI
   - [ ] Informações da equipe de localização:
     - [ ] Mentor da localização: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
     - [ ] Contribuidores: @GITHUB_HANDLE1, @GITHUB_HANDLE2, ...
   - [ ] Ler a página de
         [Localização](https://opentelemetry.io/docs/contributing/localization/)
         e todas as outras páginas na seção Contribuindo
   - [ ] Localizar a página inicial do site (somente) para SEU_NOME_DO_IDIOMA e
         enviar um PR. Para mais detalhes, consulte
         [Localização da página inicial](https://opentelemetry.io/docs/contributing/localization/#homepage).
   - [ ] Mantenedores OTel:
     - [ ] Atualizar a config do Hugo para `LANG_ID`
     - [ ] Configurar cSpell e suporte de outras ferramentas
     - [ ] Criar um label de issue para `lang:LANG_ID`
     - [ ] Criar equipes de nível de organização para aprovadores e mantenedores
           de `LANG_ID`
     - [ ] Adicionar a localização em `data/locale-teams.yaml` e executar
           `npm run fix:codeowners`
   - [ ] Criar uma issue para acompanhar a tradução do **glossário**. Adicione o
         número da issue aqui. Para mais detalhes, consulte
         [Localização do glossário](https://opentelemetry.io/docs/contributing/localization/#glossary).
   ```

### 3. Localização da página inicial {#homepage}

[Submeta um _pull request_](../pull-requests/) com uma tradução da [página
inicial][homepage] do site, e _nada mais_, no arquivo
`content/LANG_ID/_index.md`. Certifique-se de que os mantenedores tenham as
permissões necessárias para editar seu PR, já que eles adicionarão mudanças
adicionais ao seu PR que são necessárias para iniciar seu projeto de
localização.

[homepage]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/content/en/_index.md

Após o _merge_ do seu primeiro PR, os mantenedores irão configurar o rótulo
_(label)_ da _issue_ e as equipes de nível organizacional.

### 4. Localização do glossário {#glossary}

A segunda página a ser localizada é o [Glossário](/docs/concepts/glossary/).
Essa é uma página **crítica** para os leitores de conteúdo localizado, já que
define termos essenciais utilizados em observabilidade e no OpenTelemetry em
particular. Isso é especialmente crítico se tais termos não existem em seu
idioma.

Para orientação, assista ao [vídeo][ali-d-youtube] de apresentação de Ali Dowair
no Write the Docs 2024: [The art of translation: How to localize technical
content][ali-dowair-2024].

[ali-dowair-2024]:
  https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair
[ali-d-youtube]: https://youtu.be/HY3LZOQqdig

### 5. Localização das páginas restantes em pequenos incrementos {#rest}

Com a terminologia estabelecida, você pode seguir com a localização das páginas
restantes do site.

> [!IMPORTANT] Enviar PRs pequenos <a id="small-prs"></a>
>
> Equipes de localização devem enviar seu trabalho em **pequenos incrementos**.
> Ou seja, mantenha os [PRs][] pequenos, preferencialmente limitados a um
> arquivo ou alguns arquivos pequenos. PRs menores são mais fáceis de revisar e
> normalmente são aprovados mais rapidamente.

### Lista de verificação do mantenedor OTel {#otel-maintainer-checklist}

#### Hugo

Atualize a configuração do Hugo para `LANG_ID`. Adicione entradas apropriadas
para `LANG_ID` em:

- `languages` em `config/_default/hugo.yaml`
- `module.mounts` através de `config/_default/module-template.yaml`. Adicione
  pelo menos uma entrada `source`-`target` para `content`. Considere adicionar
  entradas para páginas de _fallback_ `en` apenas quando a localização tiver
  conteúdo suficiente.

#### Ortografia {#spelling}

Procure por [dicionários cSpell][cSpell dictionaries] disponíveis como pacotes
NPM [@cspell/dict-LANG_ID][]. Caso um dicionário não esteja disponível para seu
dialeto ou região, escolha a região mais próxima.

- **Se um dicionário estiver disponível**:
  - Adicione o pacote NPM como dependência de desenvolvimento, por exemplo:
    `npm install --save-dev @cspell/dict-bn`.
  - Em [`.cspell.yml`][], adicione o `cspell-ext.json` do pacote em `import:`, e
    adicione o ID do dicionário (por exemplo `bn`, `es-es`, `pl_pl`) em
    `dictionaries:`.
- **Se nenhum dicionário estiver disponível** para o idioma, não adicione um
  `import` para ele. Adicione `content/LANG_ID` à lista `ignorePaths` em
  [`.cspell.yml`][] para que o cSpell não tente verificar a ortografia do
  _Markdown_ dessa localização como se fosse inglês.

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict
[`.cspell.yml`]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml

#### Lista de palavras {#word-list}

Crie `.cspell/LANG_ID-words.txt` para cada nova localização (inicialmente
vazio), mesmo quando **Ortografia** não tiver um dicionário de idioma natural a
ser adicionado.

- Em [`.cspell.yml`][], registre o arquivo e habilite-o:
  - Em `dictionaryDefinitions`, adicione uma entrada com `name` (por exemplo
    `LANG_ID-words`) e `path` (por exemplo `.cspell/LANG_ID-words.txt`).
  - Em `dictionaries`, adicione o mesmo valor de `name` do passo anterior (não o
    caminho do arquivo).

#### Equipes e code owners {#teams-and-code-owners}

Adicione a nova localização em [`data/locale-teams.yaml`][] e execute
`npm run fix:codeowners` para regenerar a seção de localizações do CODEOWNERS.
Inclua essas alterações no primeiro PR da localização: a CI exige que o registro
esteja de acordo com os diretórios de localização em `content/`. Uma nova
localização geralmente começa [sem equipe](#locale-teams), então suas linhas no
CODEOWNERS incluem `docs-approvers` como alternativa até que a localização
[se gradue](#locale-teams).

#### Suporte de outras ferramentas {#other-tooling-support}

- Suporte do Prettier: se `LANG_ID` não for bem suportado pelo Prettier,
  adicione regras de ignore a `.prettierignore`

## Orientação para aprovadores e mantenedores {#approver-and-maintainer-guidance}

### Equipes de localização, code owners e composição das equipes {#locale-teams}

Cada localização tem as equipes do GitHub `docs-LANG_ID-approvers` e
`docs-LANG_ID-maintainers`; mantenedores também são aprovadores. A equipe de
aprovadores é a [_code owner_][code owner] dos caminhos da localização, então a
revisão de um aprovador da localização satisfaz a revisão obrigatória de _code
owner_ de um PR que altera apenas essa localização. Os mantenedores da
localização também podem habilitar o [_auto-merge_](#auto-merge) desses PRs.

A composição esperada das equipes de localização é registrada no registro
[`data/locale-teams.yaml`][], que também gera a seção de localizações do arquivo
[CODEOWNERS][] do repositório. Mudanças na composição são propostas como PRs
para o registro, gerando um histórico auditável, e aplicadas às equipes reais
por um administrador da organização. Para o gerador e as convenções que ele
implementa, consulte o [README do locale-codeowners][locale-codeowners README].

Uma localização sem mantenedores está **sem equipe**: suas linhas no CODEOWNERS
listam `@open-telemetry/docs-approvers` como _code owner_ alternativo, para que
aprovadores da documentação possam revisar e desbloquear os PRs da localização.
Um mantenedor da documentação então faz o _merge_ desses PRs manualmente, já que
o [_auto-merge_](#auto-merge) exige mantenedores da localização.

Quando uma localização sem equipe ganha mantenedores, envie um PR para o
registro que os inclua e regenere a seção de localizações do CODEOWNERS
(`npm run fix:codeowners`). Isso remove a alternativa `docs-approvers` das
linhas da localização, e a equipe da localização passa a controlar seus próprios
PRs a partir de então: a localização **se graduou**. Para um exemplo, consulte o
[PR de graduação do zh][zh graduation PR]. Se uma equipe de localização ficar
inativa posteriormente, a mudança inversa no registro restaura a alternativa.

### Habilitando auto-merge em PRs de uma única localização {#auto-merge}

Membros da equipe de mantenedores de uma localização podem habilitar o
[_auto-merge_ do GitHub][GitHub auto-merge] em um PR que altera apenas essa
localização comentando `/auto-merge` (ou `/auto-merge:enable`; use
`/auto-merge:disable` para desativá-lo). A diretiva deve estar em sua própria
linha, sem texto ou espaços antes, como a primeira ou a última linha não vazia
do comentário. Ela pode aparecer no máximo uma vez. Por exemplo:

```text
LGTM
/auto-merge
```

Isso permite que equipes de localização estabelecidas façam o _merge_ de seus
próprios PRs sem esperar por um mantenedor da documentação. As regras do GitHub,
de proteção de _branch_ e do CODEOWNERS continuam controlando o _merge_: o PR só
é mesclado quando todas as revisões obrigatórias forem feitas e as verificações
passarem.

Um comentário de _auto-merge_ só é aceito quando todos os arquivos alterados
pertencem a uma localização que você mantém, então ele não pode ser usado para
fazer alterações em conteúdo compartilhado ou em inglês. Para as regras de
elegibilidade e detalhes do comando, consulte o [README do
utilitário][helper README].

[GitHub auto-merge]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request
[helper README]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-auto-merge

### PRs não devem abranger várias localizações {#prs-should-not-span-locales}

Como regra geral, um PR não deve abranger várias localizações, ou seja, ele deve
alterar páginas de no máximo uma localização. As únicas exceções estão descritas
nesta seção.

#### Mudanças semânticas {#semantic-changes}

Aprovadores devem garantir que [PRs][] fazendo mudanças **semânticas** em
páginas de documentação não abranjam múltiplas localizações. Uma mudança
semântica é aquela que impacta o _significado_ do conteúdo da página — o que os
leitores entendem e executam. Blocos de código, comandos e exemplos de
configuração fazem parte desse conteúdo: eles não são [traduzidos](#do-not), mas
edições neles são mudanças semânticas da mesma forma. Nosso
[processo de localização](.) de documentação garante que aprovadores de
localização irão, com o tempo, revisar as edições em inglês para determinar se
as mudanças são apropriadas para sua localização, e a melhor forma de
incorporá-las em sua localização. Se mudanças forem necessárias, os aprovadores
de localização as farão via seus próprios PRs específicos da localização.

> [!NOTE] Manutenção sem impacto no conteúdo
>
> A regra de abrangência de localizações se aplica ao **conteúdo** das páginas.
> Mantenedores às vezes enviam alterações que não afetam o conteúdo e que
> necessariamente abrangem várias localizações: atualizações de ferramentas,
> configuração, _front matter_ ou marcação de todo o site, incluindo a
> manutenção do [status de inconsistência](#drift-status) — tanto os PRs
> automatizados quanto as edições manuais apenas de status. Essas alterações não
> mudam o significado das páginas localizadas.

#### Mantendo o build funcionando {#keep-checks-green}

Um PR que altera o **conteúdo** de páginas localizadas pode abranger várias
localizações somente quando isso for estritamente necessário para manter o
_build_ do site funcionando. Essas **correções de _build_** reparam falhas no
_build_ do site em páginas localizadas, por exemplo, após mudanças em um
_shortcode_ compartilhado, arquivo de inclusão ou fonte de dados. O
[status de inconsistência](#drift-status) de uma página apenas a protege da
verificação de links, não do _build_ do Hugo. Marque cada página localizada que
você corrigir como [_patched_](#patched).

Falhas de verificação de links em páginas localizadas **não** se enquadram nesse
caso; para saber como resolvê-las, consulte
[Correções de links e atualizações de recursos](#link-fixes-and-resource-updates).

A mesma regra de correção mínima se aplica à manutenção do status de
inconsistência: quando uma verificação com falha exigir a atualização de
`drifted_from_default`, atualize apenas as páginas que a verificação com falha
reportar; a
[execução diária de _Housekeeping_](/site/build/ci-workflows/#housekeeping)
completa o restante. Edições apenas de status são
[manutenção sem impacto no conteúdo](#semantic-changes).

Trate qualquer outra alteração no conteúdo de páginas localizadas como uma
mudança **semântica** para aquela localização. Isso inclui adições pontuais de
conteúdo em páginas desatualizadas, como adicionar um novo termo ao glossário.

#### Correções de links e atualizações de recursos {#link-fixes-and-resource-updates}

Mudanças na documentação em inglês podem resultar em falhas de verificação de
links para localizações não inglesas. Isso acontece quando páginas de
documentação, ou seções dentro delas, são movidas ou removidas; links para
recursos externos movidos podem falhar de forma semelhante. Corrija essas falhas
apenas nas páginas em inglês; **nunca edite o conteúdo de páginas localizadas
para corrigir links**. O [acompanhamento de inconsistências](#track-changes)
sinaliza cópias localizadas desatualizadas para suas equipes de localização, e a
reconciliação, incluindo correções de links, fica a cargo de cada equipe.

Primeiro, contenha o impacto no lado em inglês corrigindo os links com falha.
Alguns destinos oferecem mitigações adicionais:

- **Uma página foi movida**: certifique-se de que a página em inglês movida
  declare um [alias][aliases] para seu caminho antigo. O alias mantém
  funcionando os links publicados anteriormente para a página, mas apenas para
  visitantes do site: aliases são publicados como redirecionamentos no servidor,
  e o verificador de links resolve os links com base nos caminhos canônicos das
  páginas do site gerado. Portanto, links para o caminho antigo ainda precisam
  ser corrigidos nas páginas em inglês.
- **Uma seção foi movida dentro da sua página**: preserve seu
  [ID de cabeçalho](#headings) para que os links para a seção continuem
  funcionando. Aliases não ajudam nesse caso: eles redirecionam caminhos de
  páginas, não fragmentos.

Os outros destinos não têm essa mitigação: uma seção movida para outra página,
um recurso externo movido ou um destino removido. Corrigir os links em inglês é
toda a correção do lado em inglês; para um destino removido, isso significa
escolher um destino substituto ou remover a referência em cada página que o
utiliza.

Em seguida, deixe que o tratamento de inconsistências cubra as páginas
localizadas: corrigir as páginas em inglês faz com que suas cópias localizadas
fiquem [desatualizadas](#drift-status), e o verificador de links ignora cópias
desatualizadas. Se uma página localizada ainda falhar na verificação de links,
atualize seu status de inconsistência diretamente:

```sh
npm run fix:i18n:status -- PATHS_TO_FAILING_LOCALIZED_PAGES
```

No caso raro em que um link com falha exista apenas em uma página localizada,
reporte-o e coordene uma correção com a equipe da localização.

Por fim, execute novamente `npm run check:links` e confirme que não restam
falhas de links.

<!-- prettier-ignore-start -->
[aliases]: https://gohugo.io/content-management/urls/#aliases
[code owner]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
[CODEOWNERS]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/CODEOWNERS
[`data/locale-teams.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/locale-teams.yaml
[front matter]: https://gohugo.io/content-management/front-matter/
[locale-codeowners README]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/gh/locale-codeowners
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[PRs]: ../pull-requests/
[slack]: https://slack.cncf.io/
[zh graduation PR]: https://github.com/open-telemetry/opentelemetry.io/pull/11516
<!-- prettier-ignore-end -->
