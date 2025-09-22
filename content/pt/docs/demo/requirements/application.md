---
title: Requisitos de Aplicação
aliases: [application_requirements]
---

Os seguintes requisitos foram definidos para estabelecer quais sinais de
OpenTelemetry (OTel) a aplicação produzirá e quando suporte para futuros SDKs
deve ser adicionado:

1. Cada linguagem suportada que tenha SDK GA de Traces ou Métricas deve ter ao
   menos 1 serviço de exemplo.
   - Suporte mobile (Swift) não é prioridade inicial e não está incluído no
     requisito acima.

2. Processos da aplicação devem ser independentes de linguagem.
   - gRPC é preferido quando disponível e HTTP deve ser usado quando não for.

3. Os serviços devem ser arquitetados como componentes modulares que podem ser
   trocados.
   - Serviços individuais podem e devem incentivar a existência de múltiplas
     opções de linguagem.

4. A arquitetura deve permitir a possível integração de componentes genéricos de
   plataforma como banco de dados, fila ou armazenamento de blobs.
   - Não há requisito por um tipo específico — ao menos 1 componente genérico
     deve estar presente em geral.

5. Deve ser fornecido um gerador de carga para simular carga de usuários contra
   o demo.
