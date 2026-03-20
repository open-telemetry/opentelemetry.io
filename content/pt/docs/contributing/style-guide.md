---
title: Manual de estilo da documentação
description: Terminologia e estilo ao escrever a documentação do OpenTelemetry.
linkTitle: Manual de estilo
weight: 20
default_lang_commit: 5ab640677e1ac0a57553fb1c72199812f628f461 # patched
cSpell:ignore: open-telemetry opentelemetryio postgre style-guide
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

Você também pode utilizar as seguintes extensões:

- [Alertas][gfm-alerts] do [GitHub-flavored Markdown][GFM] (GFM)
- [Emojis][]. Para a lista completa de emojis disponíveis, consulte os
  [Emojis][] da documentação do Hugo.

[Emojis]: https://gohugo.io/quick-reference/emojis/
[gfm-alerts]:
  https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide#alerts
[GFM]: https://github.github.com/gfm/
[Goldmark]: https://gohugo.io/configuration/markup/#goldmark

### Verificações de Markdown {#markdown-standards}

Para garantir padrões e consistência nos arquivos Markdown, todos os arquivos
devem seguir certas regras, aplicadas pelo [markdownlint][]. Para uma lista
completa, verifique os arquivos [.markdownlint.yaml][] e
[.markdownlint-cli2.yaml][].

Também aplicamos o padrão [file format](#file-format) ao Markdown, que remove
espaços em branco no final das linhas. Isso exclui a [line break syntax][] com
dois ou mais espaços. Para forçar a quebra de linha, use `<br>` em vez disso ou
reformate seu texto.

## Verificação ortográfica {#spell-checking}

Use [CSpell](https://github.com/streetsidesoftware/cspell) para garantir que
todo o texto esteja escrito corretamente. Para uma lista de palavras específicas
do site OpenTelemetry, consulte o arquivo
[`.cspell.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml).

Se o `cspell` indicar um erro de `Unknown word` (palavra desconhecida),
verifique se você escreveu essa palavra corretamente. Se sim, adicione essa
palavra à seção `cSpell:ignore` no início do seu arquivo. Se essa seção não
existir, você pode adicioná-la ao _front matter_ de um arquivo Markdown:

```markdown
---
title: TituloDaPagina
cSpell:ignore: <palavra>
---
```

Para qualquer outro arquivo, adicione `cSpell:ignore <palavra>` em uma linha de
comentário apropriada para o contexto do arquivo. Para um arquivo YAML de
entrada de [registro](/ecosystem/registry/), pode ser assim:

```yaml
# cSpell:ignore <palavra>
title: TituloDoRegistro
```

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
