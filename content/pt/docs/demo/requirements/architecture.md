---
title: Requisitos de Arquitetura
linkTitle: Arquitetura
aliases: [architecture_requirements]
cSpell:ignore: dockerstatsreceiver
---

## Resumo

A aplicação Demo da Comunidade OpenTelemetry tem a intenção de apresentar a API,
o SDK e as ferramentas do OpenTelemetry em uma aplicação cloud native próxima à
produção. O objetivo geral não é apenas fornecer um “demo” canônico dos
componentes do OpenTelemetry, mas também atuar como um framework para
personalizações por usuários finais, fornecedores e outras partes interessadas.

### Requisitos

- [Requisitos de Aplicação](../application/)
- [Requisitos de OpenTelemetry](../opentelemetry/)
- [Requisitos de Sistema](../system/)

### Objetivos da Aplicação

- Oferecer aos desenvolvedores uma aplicação de exemplo robusta para aprender
  instrumentação com OpenTelemetry.
- Fornecer aos fornecedores de observabilidade uma única plataforma de demo bem
  suportada que possam customizar (ou simplesmente usar pronta para uso).
- Fornecer à comunidade OpenTelemetry um artefato vivo que demonstre os
  recursos e capacidades das APIs, SDKs e ferramentas do OTel.
- Oferecer aos mantenedores do OpenTelemetry e grupos de trabalho uma plataforma
  para demonstrar novos recursos/conceitos “no mundo real”.

A seguir está uma descrição geral dos componentes lógicos da aplicação de demo.

## Aplicação Principal

A maior parte do app de demo é uma aplicação baseada em microsserviços
autocontida que realiza “trabalho do mundo real”, como um site de e-commerce. A
aplicação é composta por múltiplos serviços que se comunicam via gRPC e HTTP e
rodam em Kubernetes (ou Docker, localmente).

Cada serviço deve ser instrumentado com OpenTelemetry para traces, métricas e
logs (conforme aplicável/disponível).

Cada serviço deve ser intercambiável por outro que execute a mesma lógica de
negócio, implementando os mesmos endpoints gRPC, mas escrito em outra linguagem.

Cada serviço deve ser capaz de se comunicar com um serviço de feature flags para
habilitar/desabilitar falhas que possam ser usadas para ilustrar como telemetria
ajuda a resolver problemas em aplicações distribuídas.

## Componente de Feature Flags

Feature flags são parte crucial do desenvolvimento cloud native. O demo usa
OpenFeature, um projeto incubado na CNCF, para gerenciar feature flags.

As feature flags podem ser definidas através da interface do configurador do
flagd.

## Orquestração e Implantação

Todos os serviços rodam em Kubernetes. O OpenTelemetry Collector deve ser
implantado via OpenTelemetry Operator e executado nos modos sidecar + gateway.
A telemetria de cada pod deve ser roteada de agentes para um gateway, e o
gateway deve exportar telemetria por padrão para um visualizador open source de
traces + métricas.

Para implantação local/não-Kubernetes, o Collector deve ser implantado via
arquivo compose e monitorar não apenas traces/métricas das aplicações, mas
também os containers docker via `dockerstatsreceiver`.

Um objetivo de design deste projeto é incluir um pipeline de CI/CD para
autopublicação em ambientes de nuvem. Isso pode ser omitido em desenvolvimento
local.
