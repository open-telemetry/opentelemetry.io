---
title: Localização do site
description: Criando e mantendo páginas do site em localizações não inglesas.
linkTitle: Localização
weight: 25
default_lang_commit: 915801c19b651b250f72f72390372fee84cd0b14
drifted_from_default: true
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
- **Perguntar** aos [mantenedores][maintainers] em caso de dúvidas, através de:
  - Canais do [Slack], como `#otel-docs-localization`, `#otel-localization-ptbr`
    ou `#otel-comms`
  - [Discussões][Discussion], _issue_, ou comentário de PR

[Discussion]:
  https://github.com/open-telemetry/opentelemetry.io/discussions?discussions_q=is%3Aopen+label%3Ai18n

</div>

#### ❌ O que NÃO fazer {#do-not}

<div class="border-start border-warning bg-warning-subtle">

- **Não traduzir**:
  - **Nomes de arquivos ou diretórios** de recursos neste repositório
  - [Links](#links), isso inclui [IDs de cabeçalho](#headings) [^*]
  - Trechos de código em linha como estes: `exemplo de código inline`
  - Elementos _Markdown_ marcados como `notranslate` (geralmente como uma classe
    CSS), em particular para [cabeçalhos](#headings)
  - Campos _[Front matter][]_ diferentes daqueles listados em
    [O que fazer](#do). Especificamente, não traduza `aliases`. Na dúvida,
    pergunte aos mantenedores.
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
`/pt/docs/some-page` quando renderizado de uma página em português.

{{% /alert %}}

### Labels de definição de links {#link-labels}

Autores de localização podem escolher traduzir ou não _[labels]_ de [definições
de links][link definitions] _Markdown_. Se você escolher manter o _label_ em
inglês, então siga a orientação dada nesta seção.

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

A partir de fevereiro de 2025, estamos no processo de migração de _shortcodes_
para [arquivos de inclusão](#includes) como meio de suportar conteúdo
compartilhado de página.

{{% /alert %}}

Alguns dos _shortcodes_ base contêm texto em inglês que você pode precisar
localizar -- especialmente para aqueles contidos em [layouts/_shortcodes/docs].

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
1       1       content/en/docs/platforms/kubernetes/_index.md - content/pt/docs/platforms/kubernetes/_index.md
...
```

Você pode restringir as páginas alvo a uma ou mais localizações fornecendo
caminho(s) assim:

```sh
npm run check:i18n -- content/pt
```

### Visualizando detalhes das mudanças {#viewing-change-details}

Para quaisquer páginas localizadas que precisem de atualização, você pode ver os
detalhes do diff das páginas correspondentes em inglês usando a _flag_ `-d` e
fornecendo os caminhos para suas páginas localizadas, ou omitir os caminhos para
ver todas. Por exemplo:

```console
$ npm run check:i18n -- -d content/pt/docs/platforms/kubernetes
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
`<hash>`, então execute o seguinte comando para adicionar automaticamente
`default_lang_commit` ao _front matter_ do arquivo da sua página usando o
_commit_ `<hash>`. Você pode especificar `HEAD` como argumento se suas páginas
estão agora sincronizadas com a `main` em `HEAD`. Por exemplo:

```sh
npm run check:i18n -- -n -c 1ca30b4d content/pt
npm run check:i18n -- -n -c HEAD content/pt/docs/concepts
```

Para listar arquivos de páginas de localização com chaves de _hash_ faltando,
execute:

```sh
npm run check:i18n -- -n
```

### Atualizando `default_lang_commit` para páginas existentes {#updating-default_lang_commit-for-existing-pages}

Ao atualizar suas páginas localizadas para corresponder às mudanças feitas na
página correspondente em inglês, certifique-se de que você também atualize o
_hash_ do _commit_ `default_lang_commit`.

{{% alert title="Dica" %}}

Se sua página localizada agora corresponde à versão em inglês na `main` em
`HEAD`, então apague o valor do _hash_ do _commit_ no _front matter_, e execute
o comando **add** mostrado na seção anterior para atualizar automaticamente o
valor do campo `default_lang_commit`.

{{% /alert %}}

Se você atualizou em lote todas as suas páginas de localização que possuíam
inconsistências, é possível atualizar o _hash_ do _commit_ desses arquivos
utilizando a _flag_ `-c` seguida por um _hash_ de _commit_ ou 'HEAD' para usar
`main@HEAD`.

```sh
npm run check:i18n -- -c <hash> <PATH-TO-YOUR-NEW-FILES>
npm run check:i18n -- -c HEAD <PATH-TO-YOUR-NEW-FILES>
```

{{% alert title="Importante" %}}

Ao utilizar `HEAD` como referência de _hash_, o _script_ utilizará o _hash_ da
_branch_ `main` no seu **ambiente local**. Certifique-se de executar _fetch_ e
_pull_ da `main` caso queira que HEAD corresponda ao estado atual da `main` no
GitHub.

{{% /alert %}}

### Status de inconsistência {#drift-status}

Execute `npm run fix:i18n:status` para adicionar o campo `drifted_from_default`
no _front matter_ das páginas localizadas que estão divergentes. Este campo será
utilizado em breve para exibir um banner no topo das páginas que se desviaram da
versão em inglês correspondente.

### Ajuda do script {#script-help}

Para mais detalhes sobre o _script_, execute `npm run check:i18n -- -h`.

## Novas localizações {#new-localizations}

Possui interesse em iniciar uma nova localização para o site do OTel? Entre em
contato com os mantenedores para demonstrar seu interesse, por exemplo através
de uma discussão no GitHub ou via canal do Slack `#otel-docs-localization`. Esta
seção explica as etapas envolvidas na criação de uma nova localização.

{{% alert title="Note" %}}

Você não precisa ser um contribuidor atual do projeto OpenTelemetry para iniciar
uma nova localização. No entanto, você não será adicionado como membro da
[organização OpenTelemetry no GitHub](https://github.com/open-telemetry/) ou
como membro do grupo de aprovadores para sua localização até cumprir os
requisitos para se tornar um membro oficial e aprovador conforme descrito nas
[diretrizes de associação](https://github.com/open-telemetry/community/blob/main/guides/contributor/membership.md).

Antes de obter o _status_ de aprovador, você pode indicar sua aprovação de um PR
de localização adicionando um comentário "LGTM" (_Looks Good To Me_). Durante
esta fase inicial, os mantenedores tratarão suas revisões como se você já fosse
um aprovador.

{{% /alert %}}

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
     - [ ] Mentor da localização: @GITHUB_USERNAME1, @GITHUB_USERNAME2, ...
     - [ ] Contribuidores: @GITHUB_USERNAME1, @GITHUB_USERNAME2, ...
   - [ ] Ler a página de
         [Localização](https://opentelemetry.io/docs/contributing/localization/)
         e todas as outras páginas na seção Contribuindo
   - [ ] Localizar a página inincial do site (somente) para SEU_NOME_DO_IDIOMA e
         enviar um PR. Para mais detalhes, consulte
         [Localização da página inicial](https://opentelemetry.io/docs/contributing/localization/#homepage).
   - [ ] Mantenedores OTel:
     - [ ] Atualizar `hugo.yaml`
     - [ ] Configurar cSpell e suporte de outras ferramentas
     - [ ] Criar um label de issue para `lang:LANG_ID`
     - [ ] Criar grupo de nível de organização para aprovadores `LANG_ID`
     - [ ] Atualizar proprietários de componentes para `content/LANG_ID`
   - [ ] Criar uma issue para acompanhar a tradução do **glossário**. Adicione o
         número da issue aqui. Para mais detalhes, consulte
         [Localização do glossário](https://opentelemetry.io/docs/contributing/localization/#glossary)
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
_(label)_ da _issue_, o grupo de nível organizacional e os responsáveis pelo
componente.

### 4. Localização do glossário {#glossary}

A segunda página a ser localizada é o [Glossário](/docs/concepts/glossary). Essa
é uma página **crítica** para os leitores de conteúdo localizado, já que define
termos essenciais utilizados em observabilidade e no OpenTelemetry em
particular. Isso é especialmente crítico se tais termos não existem em seu
idioma.

Para orientação, assista ao [vídeo][ali-d-youtube] de apresentação de Ali Dowair
no Write the Docs 2024: [The art of translation: How to localize technical
content][ali-dowair-2024].

[ali-dowair-2024]:
  https://www.writethedocs.org/conf/atlantic/2024/speakers/#speaker-ali-dowair-what-s-in-a-word-lessons-from-localizing-kubernetes-documentation-to-arabic-ali-dowair
[ali-d-youtube]: https://youtu.be/HY3LZOQqdig

### 5. Localização das páginas restantes {#remaining-pages}

Com a terminologia estabelecida, você pode seguir com a localização das páginas
restantes do site.

Ao submeter PRs, mantenha-os pequenos: preferencialmente limitados a um arquivo
ou alguns arquivos pequenos. PRs menores são mais fáceis de revisar e
normalmente são aprovados mais rapidamente.

### Lista de verificação do maintainer OTel {#otel-maintainer-checklist}

#### Hugo

Atualize o arquivo `hugo.yaml`. Adicione entradas apropriadas para `LANG_ID` em:

- `languages`
- `module.mounts`. Adicione pelo menos uma entrada `source`-`target` para
  `content`. Considere adicionar entradas para páginas de _fallback_ `en` apenas
  quando a localização tiver conteúdo suficiente.

#### Ortografia {#spelling}

Procure por [dicionários cSpell][cSpell dictionaries] disponíveis como pacotes
NPM [@cspell/dict-LANG_ID][]. Caso um dicionário não esteja disponível para seu
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

[cSpell dictionaries]: https://github.com/streetsidesoftware/cspell-dicts
[@cspell/dict-LANG_ID]: https://www.npmjs.com/search?q=%40cspell%2Fdict

#### Suporte de outras ferramentas {#other-tooling-support}

- Suporte do Prettier: se `LANG_ID` não for bem suportado pelo Prettier,
  adicione regras de ignore a `.prettierignore`

## Orientação para aprovadores e maintainers {#approver-and-maintainer-guidance}

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

Atualizações de páginas **puramente editoriais** são mudanças que **não** afetam
o conteúdo existente e podem abranger múltiplas localizações. Isso inclui:

- **Manutenção de links**: Corrigir caminhos de _links_ quebrados quando páginas
  são movidas ou deletadas.
- **Atualização de recursos**: Atualizar _links_ para recursos externos movidos.
- **Adições direcionadas de conteúdo**: Adicionar novas definições ou seções
  específicas em arquivos desatualizados quando não for viável atualizar o
  arquivo completo.

#### Correções de links e atualizações de recursos {#link-fixes-and-resource-updates}

Por exemplo, às vezes mudanças na documentação em inglês podem resultar em
falhas de verificação de links para localizações não inglesas. Isso acontece
quando páginas de documentação são movidas ou deletadas.

Em tais situações, faça as seguintes atualizações para cada página não inglesa
que tem um caminho que falha na verificação de links:

- Atualize a referência do link para o novo caminho da página.
- Adicione o comentário YAML `# patched` ao final da linha `default_lang_commit`
  no _front matter_.
- Não faça outras mudanças no arquivo.
- Execute novamente `npm run check:links` e certifique-se de que não restam
  falhas de links.

Quando um _link externo_ para um recurso **movido** (mas semanticamente
**inalterado**), como um arquivo do GitHub, resulta em uma falha de verificação
de link, considere:

- Remover o link quebrado do refcache
- Atualizar o link em todas as localizações usando o método descrito
  anteriormente nesta seção.

#### Adições pontuais em arquivos desatualizados {#targeted-content-additions}

Quando for necessário adicionar conteúdo novo a um arquivo traduzido que está
desatualizado em relação à versão em inglês, é possível fazer uma atualização
pontual. Por exemplo: se o termo "cardinalidade" for adicionado ao glossário em
inglês, você pode incluir apenas essa definição na versão localizada sem
atualizar todo o arquivo.

Aqui está um exemplo do fluxo de trabalho para esta atualização direcionada:

- Adicione apenas o bloco de definição de "cardinalidade" no glossário
  localizado.
- Atualize o _front matter_ adicionando `# patched` como um comentário YAML no
  final da linha.
- Não faça outras mudanças no arquivo.
- Na descrição do PR, documente as alterações:
  - O conteúdo específico adicionado (definição de "cardinalidade")
  - Que o arquivo ainda está desatualizado em outros pontos
  - O motivo da atualização pontual (por exemplo, "Adicionar nova terminologia
    essencial para a documentação, sem exigir sincronização total do conteúdo do
    arquivo")

  Esta abordagem permite melhorias incrementais ao conteúdo localizado, mantendo
  a rastreabilidade das partes que ainda precisam de atualização completa.

[front matter]: https://gohugo.io/content-management/front-matter/
[main]: https://github.com/open-telemetry/opentelemetry.io/commits/main/
[maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[multilingual framework]: https://gohugo.io/content-management/multilingual/
[new issue]: https://github.com/open-telemetry/opentelemetry.io/issues/new
[slack]: https://slack.cncf.io/
