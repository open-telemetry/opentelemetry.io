---
title: Anúncios
description: Crie anúncios ou banners para eventos especiais.
weight: 50
default_lang_commit: 645760e1961cb45d9ce6b291887c74ce4efa0398
---

Um anúncio é uma página regular do Hugo contida no diretório `announcements` de
um idioma. Isso significa que aproveitamos o tratamento interno do Hugo para
páginas com datas (futuras ou expiradas), internacionalização e outros,
mostrando ou ocultando banners automaticamente dependendo da data de compilação,
determinando a ordem dos banners, lidando com _fallback_ para banners em inglês,
etc.

> Atualmente, os anúncios são usados apenas como banners. Nós podemos
> eventualmente dar suporte a anúncios um pouco mais gerais também.

### Criando um anúncio {#creating-an-announcement}

Para adicionar um novo anúncio, crie um arquivo Markdown no diretório
`announcements` da sua localização utilizando o seguinte comando:

```sh
hugo new --kind announcement content/SUA-LOCALIZACAO/announcements/nome-do-arquivo-de-anuncio.md
```

Ajuste o comando de acordo com o idioma e nome de arquivo desejado. Adicione o
texto do anúncio como o conteúdo da página.

> Para banners, o conteúdo da página deve ser uma frase curta.

{{% alert title="Para localizações" %}}

Caso esteja criando uma **versão localizada de um anúncio existente**,
certifique-se de usar o **mesmo nome de arquivo** do anúncio em inglês.

{{% /alert %}}

### Lista de anúncios {#announcement-list}

Um determinado anúncio será exibido no site quando a data de compilação cair
estiver entre os campos `date` e `expiryDate` do anúncio. Quando esses campos
estiverem ausentes, os valores padrão serão considerados como "agora" e "para
sempre", respectivamente.

Os anúncios aparecerão na ordem padrão das páginas, determinada através da
função [Regular pages](https://gohugo.io/methods/site/regularpages/) do Hugo. Ou
seja, os os anúncios mais "leves" (por `weight`) aparecerão primeiro; quando os
pesos forem iguais ou não especificados, os anúncios mais recentes (por `date`)
aparecerão primeiro, etc.

Portanto, se você quiser forçar um anúncio ao topo, utilize um valor negativo
para o campo `weight`.

Caso encontre um erro ou problema com o conteúdo deste repositório, ou queira
sugerir uma melhoria, [crie uma _issue_][new-issue].

Caso descubra um problema de segurança, leia a
[Política de Segurança](https://github.com/open-telemetry/opentelemetry.io/security/policy)
antes de abrir uma _issue_.

Antes de relatar uma nova _issue_, certifique-se de que já não foi relatada ou
corrigida anteriormente, pesquisando através da
[lista de _issues_](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

Ao criar uma nova _issue_, inclua um título curto e significativo e uma
descrição clara. Adicione o máximo de informações relevantes possível e, se
possível, um caso de teste.

[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
