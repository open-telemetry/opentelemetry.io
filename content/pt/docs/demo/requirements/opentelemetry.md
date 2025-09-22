---
title: Requisitos de OpenTelemetry
linkTitle: Requisitos OTel
aliases: [opentelemetry_requirements]
---

Os seguintes requisitos foram definidos para estabelecer quais sinais de
OpenTelemetry (OTel) a aplicação produzirá e quando suporte para futuros SDKs
deve ser adicionado:

1. O demo deve produzir logs, traces e métricas de OTel prontos para uso para
   linguagens que tenham SDK GA.
2. Linguagens com SDK Beta podem ser incluídas, mas não são obrigatórias como os
   SDKs GA.
3. Métricas nativas do OTel devem ser produzidas quando possível.
4. Tanto instrumentação manual quanto bibliotecas de instrumentação
   (auto-instrumentação) devem ser demonstradas em cada linguagem.
5. Todos os dados devem ser exportados primeiro para o Collector.
6. O Collector deve ser configurável para permitir uma variedade de experiências
   de consumo, mas ferramentas padrão devem ser selecionadas para cada sinal.
7. A arquitetura da aplicação usando o Collector deve ser projetada como
   referência de melhores práticas.
