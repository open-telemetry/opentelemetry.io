---
title: Manual de estilo da documentação
description: Terminologia e estilo ao escrever a documentação do OpenTelemetry.
linkTitle: Manual de estilo
weight: 20
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
params:
  alertExamples: |
    > [!TIP]
    >
    > Ao escrever novo conteúdo, prefira, em geral, esta sintaxe de alerta em
    > bloco de citação em vez do
    > [shortcode de alerta](https://www.docsy.dev/docs/content/shortcodes/#alert)
    > do Docsy.

    > [!WARNING] :warning: Linha em branco obrigatória!
    >
    > Este site utiliza o formatador [Prettier], que exige uma linha vazia
    > separando a tag/título do alerta do corpo do alerta.
cSpell:ignore: opentelemetryio postgre
---

Ainda não possuímos um manual de estilo oficial, porém, a atual aparência da
documentação do OpenTelemetry é influenciada pelos seguintes manuais de estilo:

- [Google Developer Documentation Style Guide](https://developers.google.com/style)
- [Kubernetes Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)

As seções a seguir contêm orientações específicas para o projeto OpenTelemetry.

> [!NOTE]
>
> Muitos requisitos do nosso manual de estilo podem ser aplicados
> automaticamente: antes de enviar uma [pull request][] (PR), execute
> `npm run fix:all` na sua máquina local e faça o _commit_ das alterações.
>
> Se você encontrar erros ou [falhas nas verificações de PR](../pr-checks), leia
> sobre nosso manual de estilo e aprenda o que pode ser feito para corrigir
> certos problemas comuns.

[pull request]:
  https://docs.github.com/en/get-started/learning-about-github/github-glossary#pull-request

## Lista de palavras do OpenTelemetry.io {#opentelemetryio-word-list}

Uma lista de termos e palavras específicas do OpenTelemetry que devem ser usadas
de forma consistente em todo o site:

- [OpenTelemetry](/docs/concepts/glossary/#opentelemetry) e
  [OTel](/docs/concepts/glossary/#otel)
- [Collector](/docs/concepts/glossary/#collector)
- [OTEP](/docs/concepts/glossary/#otep)
- [OpAMP](/docs/concepts/glossary/#opamp)

Para uma lista completa de termos do OpenTelemetry e suas definições, consulte o
[Glossário](/docs/concepts/glossary/).

Certifique-se de que nomes próprios, como outros projetos da CNCF ou ferramentas
de terceiros, sejam escritos corretamente e utilizem a capitalização original.
Por exemplo, escreva "PostgreSQL" em vez de "postgre". Para uma lista completa,
verifique o arquivo
[`.textlintrc.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.textlintrc.yml).

## Markdown {#markdown}

As páginas do site são escritas na sintaxe Markdown suportada pelo renderizador
Markdown [Goldmark][]. Para a lista completa de extensões Markdown suportadas,
consulte [Goldmark][].

Também é possível utilizar as seguintes extensões Markdown:

- [Alertas](#alerts)
- [Emojis][]: para a lista completa de emojis disponíveis, consulte os
  [Emojis][] da documentação do Hugo.

[Emojis]: https://gohugo.io/quick-reference/emojis/

### Alertas {#alerts}

É possível escrever alertas utilizando a seguinte sintaxe estendida:

- [Alertas][gfm-alerts] do [GitHub-flavored Markdown][GFM] (GFM)
- Sintaxe de [Obsidian callout][] para títulos de alerta personalizados

Segue um exemplo de cada:

```markdown
{{% _param alertExamples %}}
```

Esses exemplos são renderizados como:

{{% _param alertExamples %}}

Para mais detalhes sobre a sintaxe de alertas em bloco de citação, consulte
[Alertas][docsy-alerts] na documentação do Docsy.

[gfm-alerts]:
  https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark
[docsy-alerts]: https://www.docsy.dev/docs/content/adding-content/#alerts
[Obsidian callout]: https://help.obsidian.md/callouts

### Referências de links {#link-references}

Ao utilizar [links de referência][reference links] em Markdown, prefira a forma
_recolhida_ (_collapsed_) `[texto][]` em vez da forma _abreviada_ (_shortcut_)
`[texto]`. Embora ambas sejam válidas em [CommonMark][], a forma abreviada não é
reconhecida de maneira consistente por todas as ferramentas de Markdown. Em
particular, ao escrever `[exemplo]` e esquecer a definição, o linter
[markdownlint][] não emite nenhum aviso[^md052] -- o texto é renderizado
silenciosamente como o literal `[exemplo]` em vez de um link. Com a forma
recolhida `[exemplo][]`, o linter detecta a definição ausente imediatamente.

[^md052]:
    Especificamente, a regra nativa [MD052][] (`reference-links-images`)
    verifica, por padrão, apenas as formas de referência recolhida e completa. A
    opção `shortcut_syntax` permite incluir referências abreviadas, mas não
    funciona bem na prática.

[MD052]: https://github.com/DavidAnson/markdownlint/blob/main/doc/md052.md

Isso é aplicado pela regra personalizada `no-shortcut-ref-link`. Execute
`npm run fix:markdown` para converter referências abreviadas automaticamente.

[CommonMark]: https://spec.commonmark.org/0.31.2/#reference-link
[reference links]: https://spec.commonmark.org/0.31.2/#reference-link

### Verificações de Markdown {#markdown-standards}

Para garantir padrões e consistência nos arquivos Markdown, todos os arquivos
devem seguir certas regras, aplicadas pelo [markdownlint][]. Para uma lista
completa, verifique os arquivos [.markdownlint.yaml][] e
[.markdownlint-cli2.yaml][].

Quando houver exceções legítimas a uma regra, utilize a diretiva
`markdownlint-disable` para suprimir os avisos da regra. Para mais detalhes,
consulte a
[documentação do markdownlint](https://github.com/DavidAnson/markdownlint#configuration).

Também aplicamos o padrão [file format](#file-format) ao Markdown, que remove
espaços em branco no final das linhas. Isso exclui a [line break syntax][] com
dois ou mais espaços. Para forçar a quebra de linha, use `<br>` em vez disso ou
reformate seu texto.

## Verificação ortográfica {#spell-checking}

Use [CSpell](https://github.com/streetsidesoftware/cspell) para garantir que
todo o texto esteja escrito corretamente.

Se o `cspell` reportar uma `Unknown word` (palavra desconhecida), verifique se a
palavra foi escrita corretamente. Se sim, adicione a palavra a um destes locais:

- Uma lista `cSpell:ignore` local da página, no _front matter_ da página. Para
  mais detalhes, veja abaixo.
- O arquivo de lista de palavras específico do seu idioma
- A lista de palavras geral [all-words.txt][]

[all-words.txt]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/all-words.txt

### Lista `cSpell:ignore` local da página {#page-local-cspellignore-list}

Se a palavra desconhecida aparecer em apenas uma ou poucas páginas, adicione-a a
uma lista `cSpell:ignore` local no _front matter_ da página:

```markdown
---
title: TituloDaPagina
cSpell:ignore: <palavra>
---
```

Para arquivos que não sejam Markdown, adicione `cSpell:ignore <palavra>` em uma
linha de comentário apropriada para o arquivo. Por exemplo, em um arquivo YAML
de entrada de [registro](/ecosystem/registry/), pode ser assim:

```yaml
# cSpell:ignore <palavra>
title: TituloDoRegistro
```

### Arquivos de lista de palavras {#word-list-files}

Se a palavra desconhecida aparecer em várias páginas ou for um termo técnico,
adicione-a ao arquivo de lista de palavras específico do seu idioma. Os arquivos
de lista de palavras ficam no diretório [.cspell/][].

Se a palavra estiver escrita corretamente em todos os idiomas, como `opamp`,
adicione-a ao arquivo [all-words.txt][].

[.cspell/]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell/

## Formato de arquivo {#file-format}

Nós utilizamos o [Prettier][] para aplicar a formatação de arquivos. Execute-o
usando:

- `npm run fix:format` para formatar todos os arquivos
- `npm run fix:format:diff` para formatar apenas os arquivos que foram alterados
  desde o último commit
- `npm run fix:format:staged` para formatar apenas os arquivos que estão
  preparados para o próximo commit

## Nomes de arquivos {#file-names}

Todos os nomes de arquivos devem estar em
[_kebab case_](https://en.wikipedia.org/wiki/Letter_case#Kebab_case).

## Corrigindo problemas de validação {#fixing-validation-issues}

Para aprender como corrigir problemas de validação, consulte
[Verificações de pull request](../pr-checks).

[.markdownlint.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint.yaml
[.markdownlint-cli2.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.markdownlint-cli2.yaml
[line break syntax]: https://www.markdownguide.org/basic-syntax/#line-breaks
[markdownlint]: https://github.com/DavidAnson/markdownlint
[Prettier]: https://prettier.io
