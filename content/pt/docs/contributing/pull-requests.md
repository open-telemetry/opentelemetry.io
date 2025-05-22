---
title: Enviando conteúdo
description:
  Aprenda como enviar novos conteúdos ou alterar conteúdos existentes usando a
  interface do GitHub ou a partir de um fork local.
aliases: [new-content]
weight: 15
default_lang_commit: bc14fe46c2f358c8c0b6dc7f394535787bd4fff3
---

Para contribuir com novos conteúdos ou melhorar a documentação existente,
submeta um [pull request][PR] (PR):

- Se sua alteração for pequena ou você não estiver familiarizado com o [Git],
  veja [Usando o GitHub](#changes-using-github) para aprender como editar uma
  página.
- Caso contrário, consulte [Trabalhando localmente](#fork-the-repo) para
  aprender como fazer alterações no seu próprio ambiente de desenvolvimento.

{{% alert title="Contrato de Licença de Contribuidor (CLA)" color=warning %}}

Todos os contribuidores são obrigados a [assinar um Contrato de Licença de
Contribuidor (CLA)][CLA] antes que as alterações possam ser revisadas e
mescladas.

[CLA]: ../prerequisites/#cla

{{% /alert %}}

{{% alert title="Dica: Status de rascunho" %}}

Defina o status do seu pull request como **Rascunho** (_Draft_) para informar
aos mantenedores que o conteúdo ainda não está pronto para revisão. Os
mantenedores ainda podem comentar ou fazer revisões de alto nível, mas não
revisarão o conteúdo completamente até que você remova o status de rascunho.

{{% /alert %}}

A figura a seguir ilustra como contribuir com nova documentação.

```mermaid
flowchart LR
    subgraph first[Como contribuir]
    direction TB
       T[ ] -.-
       B[Fazer cópia _fork_ do repositório no GitHub] --- C[Escrever documentação em markdown<br>e construir o site com Hugo]
       C --- D[Enviar o código-fonte para o fork]
       D --- E[Abrir um pull request]
       E --- F[Assinar o CNCF CLA]
    end

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class A,B,C,D,E,F,G,H grey
class S,T spacewhite
class first,second white
```

_Figura 1. Contribuindo com novo conteúdo._

## Usando o GitHub {#changes-using-github}

### Editar e enviar alterações pelo navegador {#page-edit-from-browser}

Se você tem menos experiência com fluxos de trabalho do Git, aqui está um método
mais fácil de preparar e abrir um novo pull request (PR). A Figura 2 descreve os
passos, e os detalhes seguem abaixo.

```mermaid
flowchart LR
A([fa:fa-user Novo<br>Contribuidor]) --- id1[(open-telemetry/opentelemetry.io<br>GitHub)]
subgraph tasks[Alterações usando o GitHub]
direction TB
    0[ ] -.-
    1[1\. Editar esta página] --> 2[2\. Usar o editor de markdown<br>do GitHub para fazer alterações]
    2 --> 3[3\. Preencher o formulário Propor alteração de arquivo]

end
subgraph tasks2[ ]
direction TB
4[4\. Selecionar Propor alteração de arquivo] --> 5[5\. Selecionar Criar pull request] --> 6[6\. Preencher Abrir um pull request]
6 --> 7[7\. Selecionar Criar pull request]
end

id1 --> tasks --> tasks2

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef k8s fill:#326ce5,stroke:#fff,stroke-width:1px,color:#fff;
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class A,1,2,3,4,5,6,7 grey
class 0 spacewhite
class tasks,tasks2 white
class id1 k8s
```

_Figura 2. Etapas para abrir um PR usando o GitHub._

1. Na página onde você vê o problema, selecione a opção **Editar esta página**
   no painel de navegação à direita.

1. Se você não for membro do projeto, o GitHub oferece a opção de criar um fork
   do repositório. Selecione **Fazer fork deste repositório**.

1. Faça suas alterações no editor do GitHub.

1. Preencha o formulário **Propor alteração de arquivo**.

1. Selecione **Propor alteração de arquivo**.

1. Selecione **Criar pull request**.

1. A tela **Abrir um pull request** aparece. Sua descrição ajuda os revisores a
   entenderem sua alteração.

1. Selecione **Criar pull request**.

Antes de mesclar um pull request, os membros da comunidade OpenTelemetry revisam
e aprovam.

Se um revisor pedir para você fazer alterações:

1. Vá para a aba **Arquivos alterados**.
1. Selecione o ícone de lápis (editar) em qualquer arquivo alterado pelo pull
   request.
1. Faça as alterações solicitadas. Se houver uma sugestão de código, aplique-a.
1. Confirme as alterações.

Quando sua revisão estiver completa, um revisor mescla seu PR e suas alterações
ficam disponíveis alguns minutos depois.

### Corrigindo falhas na verificação do PR {#fixing-prs-in-github}

Depois de enviar um PR, o GitHub executa algumas verificações de compilação.
Certas falhas de verificação, como problemas de formatação, podem ser corrigidas
automaticamente.

Adicione o seguinte comentário ao seu PR:

```text
/fix:all
```

Isso fará com que o bot OpenTelemetry tente corrigir os problemas de compilação.
Ou você pode emitir um dos seguintes comandos de correção para resolver uma
falha específica:

```text
fix:dict
fix:expired
fix:filenames
fix:format
fix:htmltest-config
fix:i18n
fix:markdown
fix:refcache
fix:submodule
fix:text
```

{{% alert title="Pro tip" %}}

Você também pode executar os comandos `fix` localmente. Para a lista completa de
comandos de correção, execute `npm run -s '_list:fix:*'`.

{{% /alert %}}

## Trabalhando localmente {#fork-the-repo}

Se você tem mais experiência com Git, ou se suas alterações são maiores do que
algumas linhas, trabalhe a partir de um fork local.

Certifique-se de que você tenha [`git` instalado] no seu computador. Você também
pode usar uma interface de usuário para o Git.

A Figura 3 mostra os passos a seguir quando você trabalha a partir de um fork
local. Os detalhes de cada etapa seguem abaixo.

```mermaid
flowchart LR
1[Fork the open-telemetry/opentelemetry<br>repository] --> 2[Create local clone<br>and set upstream]
subgraph changes[Suas alterações]
direction TB
S[ ] -.-
3[Crie uma branch<br>exemplo: minha_nova_branch] --> 3a[Faça alterações usando<br>um editor de texto] --> 4["Visualize suas alterações<br>localmente usando Hugo<br>(localhost:1313)"]
end
subgraph changes2[Commit / Push]
direction TB
T[ ] -.-
5[Confirme suas alterações] --> 6[Envie o commit para<br>origin/minha_nova_branch]
end

2 --> changes --> changes2

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef k8s fill:#326ce5,stroke:#fff,stroke-width:1px,color:#fff;
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class 1,2,3,3a,4,5,6 grey
class S,T spacewhite
class changes,changes2 white
```

_Figura 3. Trabalhando a partir de um fork local para fazer suas alterações._

### Fazer fork do repositório

1. Navegue até o repositório
   [`opentelemetry.io`](https://github.com/open-telemetry/opentelemetry.io/).
1. Selecione **Fork**.

### Clonar e definir o repositório de origem (_upstream_)

1. Em uma janela de terminal, clone seu fork e instale as dependências:

   ```shell
   git clone git@github.com:<seu_nome_de_usuario_no_github>/opentelemetry.io.git
   cd opentelemetry.io
   npm install
   ```

1. Defina o repositório `open-telemetry/opentelemetry.io` como o remoto
   `upstream`:

   ```shell
   git remote add upstream https://github.com/open-telemetry/opentelemetry.io.git
   ```

1. Confirme seus repositórios `origin` e `upstream`:

   ```shell
   git remote -v
   ```

   A saída é semelhante a:

   ```none
   origin	git@github.com:<seu_nome_de_usuario_no_github>/opentelemetry.io.git (fetch)
   origin	git@github.com:<seu_nome_de_usuario_no_github>/opentelemetry.io.git (push)
   upstream	https://github.com/open-telemetry/opentelemetry.io.git (fetch)
   upstream	https://github.com/open-telemetry/opentelemetry.io.git (push)
   ```

1. Busque commits do `origin/main` do seu fork e `upstream/main` do repositório
   `open-telemetry/opentelemetry.io`:

   ```shell
   git fetch origin
   git fetch upstream
   ```

   Isso garante que seu repositório local esteja atualizado antes de você
   começar a fazer alterações. Envie alterações do upstream para o origin
   regularmente para manter seu fork sincronizado com o upstream.

### Criar uma ramificação (_branch_)

1. Crie uma nova branch. Este exemplo assume que a branch base é
   `upstream/main`:

   ```shell
   git checkout -b <minha_nova_branch> upstream/main
   ```

1. Faça suas alterações usando um editor de código ou texto.

A qualquer momento, use o comando `git status` para ver quais arquivos você
alterou.

### Confirmar suas alterações

Quando você estiver pronto para enviar um pull request, confirme suas
alterações.

1. No seu repositório local, verifique quais arquivos você precisa confirmar:

   ```shell
   git status
   ```

   A saída é semelhante a:

   ```none
   On branch <minha_nova_branch>
   Your branch is up to date with 'origin/<minha_nova_branch>'.

   Changes not staged for commit:
   (use "git add <file>..." to update what will be committed)
   (use "git checkout -- <file>..." to discard changes in working directory)

   modified:   content/en/docs/file-you-are-editing.md

   no changes added to commit (use "git add" and/or "git commit -a")
   ```

1. Adicione os arquivos listados em **Alterações não preparadas para commit**
   (_Changes not staged for commit_) ao commit:

   ```shell
   git add <nome_do_seu_arquivo>
   ```

   Repita isso para cada arquivo.

1. Depois de adicionar todos os arquivos, crie um commit:

   ```shell
   git commit -m "Sua mensagem de commit"
   ```

1. Envie sua branch local e seu novo commit para seu fork remoto:

   ```shell
   git push origin <minha_nova_branch>
   ```

1. Assim que as alterações forem enviadas, o GitHub avisará que você pode criar
   um PR.

### Abrir um novo PR {#open-a-pr}

A Figura 4 mostra os passos para abrir um PR do seu fork para
[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io).

```mermaid
flowchart LR
subgraph first[ ]
direction TB
1[1\. Ir para o repositório opentelemetry.io] --> 2[2\. Selecionar Novo Pull Request]
2 --> 3[3\. Selecionar comparar entre forks]
3 --> 4[4\. Selecionar seu fork no<br>menu suspenso do repositório de origem]
end
subgraph second [ ]
direction TB
5[5\. Selecionar sua branch no<br>menu suspenso de comparação] --> 6[6\. Selecionar Criar Pull Request]
6 --> 7[7\. Adicionar uma descrição<br>ao seu PR]
7 --> 8[8\. Selecionar Criar pull request]
end

first --> second

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
class 1,2,3,4,5,6,7,8 grey
class first,second white
```

_Figura 4. Etapas para abrir um PR do seu fork para_
[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io).

1. Em um navegador da web, vá para o
   [`opentelemetry.io`](https://github.com/open-telemetry/opentelemetry.io)
   repositório.
1. Selecione **Novo Pull Request**.
1. Selecione **comparar entre forks**.
1. No menu suspenso **repositório de origem**, selecione seu fork.
1. No menu suspenso **comparar**, selecione sua branch.
1. Selecione **Criar Pull Request**.
1. Adicione uma descrição para o seu pull request:

   - **Título** (50 caracteres ou menos): Resuma a intenção da alteração.
   - **Descrição**: Descreva a alteração em mais detalhes.

     - Se houver um problema relacionado no GitHub, inclua `Fixes #12345` ou
       `Closes #12345` na descrição para que a automação do GitHub feche o
       problema mencionado após a mesclagem do PR. Se houver outros PRs
       relacionados, vincule-os também.
     - Se você quiser aconselhamento sobre algo específico, inclua quaisquer
       perguntas que você gostaria que os revisores pensassem na sua descrição.

1. Selecione o botão **Criar pull request**.

Seu pull request está disponível em
[Pull requests](https://github.com/open-telemetry/opentelemetry.io/pulls).

Após a abertura de um PR, o GitHub executa testes automatizados e tenta
implantar uma prévia usando [Netlify](https://www.netlify.com/).

- Se a compilação do Netlify falhar, selecione **Detalhes** (_Details_) para
  mais informações.
- Se a compilação do Netlify for bem-sucedida, selecione **Detalhes** para abrir
  uma versão em estágio do site OpenTelemetry com suas alterações aplicadas. É
  assim que os revisores verificam suas alterações.

Outras verificações também podem falhar. Veja a
[lista de todas as verificações de PR](../pr-checks).

### Corrigir problemas {#fix-issues}

Antes de enviar uma alteração para o repositório, execute o seguinte comando e
(i) resolva quaisquer problemas relatados, (ii) confirme quaisquer arquivos
alterados pelo script:

```sh
npm run test-and-fix
```

Para testar e corrigir separadamente todos os problemas com seus arquivos,
execute:

```sh
npm run test    # Verifica, mas não atualiza nenhum arquivo
npm run fix:all # Pode atualizar arquivos
```

Para listar os scripts NPM disponíveis, execute `npm run`. Veja
[verificações de PR](../pr-checks) para mais informações sobre verificações de
pull request e como corrigir erros automaticamente.

### Visualizar suas alterações {#preview-locally}

Visualize suas alterações localmente antes de enviá-las ou abrir um pull
request. Uma prévia permite que você detecte erros de compilação ou problemas de
formatação do Markdown.

Para construir e servir o site localmente com o Hugo, execute o seguinte
comando:

```shell
npm run serve
```

Navegue até <http://localhost:1313> em seu navegador da web para ver a prévia
local. O Hugo monitora as alterações e reconstrói o site conforme necessário.

Para parar a instância local do Hugo, volte ao terminal e digite `Ctrl+C`, ou
feche a janela do terminal.

### Implantações de site e prévias de PR

Se você enviar um PR, o Netlify criará uma [prévia de implantação][] para que
você possa revisar suas alterações. Assim que seu PR for mesclado, o Netlify
implanta o site atualizado no servidor de produção.

> **Nota**: As prévias de PR incluem _páginas de rascunho_, mas as compilações
> de produção não.

Para ver logs de implantação e mais, visite o [dashboard][] do projeto - login
no Netlify é necessário.

### Diretrizes de PR

Antes que um PR seja mesclado, às vezes são necessárias algumas iterações de
revisão e edição. Para nos ajudar e a si mesmo a tornar esse processo o mais
fácil possível, pedimos que você adira ao seguinte:

- Se o seu PR não for uma correção rápida, **trabalhe a partir de um fork**:
  Clique no botão
  [Fork](https://github.com/open-telemetry/opentelemetry.io/fork) na parte
  superior do repositório e clone o fork localmente. Quando estiver pronto,
  envie um PR para o repositório upstream.
- **Não trabalhe a partir da branch `main`** do seu fork, mas crie uma branch
  específica para o PR.
- Certifique-se de que os mantenedores estão
  [autorizados a aplicar alterações ao seu pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork).

### Alterações dos revisores

Às vezes, os revisores fazem commits no seu pull request. Antes de fazer
qualquer outra alteração, busque esses commits.

1. Busque commits do seu fork remoto e rebase sua branch de trabalho:

   ```shell
   git fetch origin
   git rebase origin/<seu-nome-da-branch>
   ```

1. Após o rebase, force-push as novas alterações para seu fork:

   ```shell
   git push --force-with-lease origin <seu-nome-da-branch>
   ```

Você também pode resolver conflitos de mesclagem pela interface do GitHub.

### Conflitos de mesclagem e rebase

Se outro colaborador fizer alterações no mesmo arquivo em outro PR, isso pode
criar um conflito de mesclagem. Você deve resolver todos os conflitos de
mesclagem em seu PR.

1. Atualize seu fork e rebase sua branch local:

   ```shell
   git fetch origin
   git rebase origin/<seu-nome-da-branch>
   ```

   Em seguida, force-push as alterações para seu fork:

   ```shell
   git push --force-with-lease origin <seu-nome-da-branch>
   ```

1. Busque alterações do `upstream/main` do repositório
   `open-telemetry/opentelemetry.io` e rebase sua branch:

   ```shell
   git fetch upstream
   git rebase upstream/main
   ```

1. Inspecione os resultados do rebase:

   ```shell
   git status
   ```

   Isso resulta em vários arquivos marcados como conflitantes.

1. Abra cada arquivo em conflito e procure os marcadores de conflito: `>>>`,
   `<<<`, e `===`. Resolva o conflito e exclua o marcador de conflito.

   Para mais informações, veja
   [Como os conflitos são apresentados](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented).

1. Adicione os arquivos ao conjunto de alterações:

   ```shell
   git add <nome_do_arquivo>
   ```

1. Continue o rebase:

   ```shell
   git rebase --continue
   ```

1. Repita as etapas 2 a 5 conforme necessário.

   Após aplicar todos os commits, o comando `git status` mostra que o rebase
   está completo.

1. Force-push a branch para seu fork:

   ```shell
   git push --force-with-lease origin <seu-nome-da-branch>
   ```

   O pull request não mostra mais conflitos.

### Requisitos de mesclagem (_merge_)

Os pull requests são mesclados quando cumprem os seguintes critérios:

- Todas as revisões por aprovadores, mantenedores, membros do comitê técnico ou
  especialistas no assunto têm o status "Aprovado".
- Nenhuma conversa não resolvida.
- Aprovado por pelo menos um aprovador.
- Sem falhas nas verificações de PR.
- A branch do PR está atualizada com a branch base.
- As alterações na página do doc [do not span locales][].

[do not span locales]: ../localization/#prs-should-not-span-locales

> **Importante**
>
> Não se preocupe muito com as falhas nas verificações de PR. Os membros da
> comunidade ajudarão você a corrigi-las, fornecendo instruções sobre como
> corrigi-las ou corrigindo-as em seu nome.

[dashboard]: https://app.netlify.com/sites/opentelemetry/overview
[prévia de implantação]:
  https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/
[Git]: https://docs.github.com/en/get-started/using-git/about-git
[`git` instalado]: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
[PR]: https://docs.github.com/en/pull-requests
