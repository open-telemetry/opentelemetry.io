---
title: Documentația demo-ului OpenTelemetry
linkTitle: Demo
cascade:
  repo: https://github.com/open-telemetry/opentelemetry-demo
weight: 180
default_lang_commit: a459c277ddca991f34713849f13328de01222930
---

Bun venit la documentația demo-ului [OpenTelemetry](/ecosystem/demo/), care
detaliază modul de instalare și rulare a acestuia, precum și câteva scenarii
prin care poți vedea OpenTelemetry în acțiune.

## Rularea demo-ului {#running-the-demo}

Vrei să implementezi demo-ul și să îl vezi în acțiune? Începe de aici.

- [Docker](docker-deployment/)
- [Kubernetes](kubernetes-deployment/)

## Referință privind funcționalitățile specifice limbajelor {#language-feature-reference}

Vrei să înțelegi cum funcționează instrumentarea pentru un anumit limbaj? Începe
de aici.

| Limbaj     | Instrumentare automaticǎ                                                                                                                                                  | Instrumentarea librǎriilor                                                                              | Instrumentare manualǎ                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| .NET       | [Serviciu de contabilitate](services/accounting/)                                                                                                                         | [Serviciu de coș](services/cart/)                                                                       | [Serviciu de coș](services/cart/)                                                                       |
| C++        |                                                                                                                                                                           |                                                                                                         | [Serviciu de schimb valutar](services/currency/)                                                        |
| Elixir     |                                                                                                                                                                           | [Serviciu Flagd-UI](services/flagd-ui/)                                                                 |                                                                                                         |
| Go         |                                                                                                                                                                           | [Serviciu de checkout](services/checkout/), [Serviciu de catalog de produse](services/product-catalog/) | [Serviciu de checkout](services/checkout/), [Serviciu de catalog de produse](services/product-catalog/) |
| Java       | [Serviciu de publicitate](services/ad/)                                                                                                                                   |                                                                                                         | [Serviciu de publicitate](services/ad/)                                                                 |
| JavaScript | [Serviciu de plată](services/payment/)                                                                                                                                    |                                                                                                         | [Serviciu de plată](services/payment/)                                                                  |
| TypeScript |                                                                                                                                                                           | [Frontend](services/frontend/), [Aplicație React Native](services/react-native-app/)                    | [Frontend](services/frontend/)                                                                          |
| Kotlin     |                                                                                                                                                                           | [Serviciu de detectare a fraudelor](services/fraud-detection/)                                          |                                                                                                         |
| PHP        |                                                                                                                                                                           | [Serviciu de ofertare](services/quote/)                                                                 | [Serviciu de ofertare](services/quote/)                                                                 |
| Python     | [Serviciu de recomandare](services/recommendation/), [Serviciu de reprezentare](services/agent/), [Serviciu de chatbot](services/chatbot/), [Serviciu MCP](services/mcp/) |                                                                                                         | [Serviciu de recomandare](services/recommendation/)                                                     |
| Ruby       |                                                                                                                                                                           | [Serviciu de email](services/email/)                                                                    | [Serviciu de email](services/email/)                                                                    |
| Rust       |                                                                                                                                                                           | [Serviciu de expediere](services/shipping/)                                                             | [Serviciu de expediere](services/shipping/)                                                             |

## Documentația serviciului {#service-documentation}

Informații specifice despre modul în care OpenTelemetry este implementat în
fiecare serviciu pot fi găsite aici:

- [Serviciu de contabilitate](services/accounting/)
- [Serviciu de publicitate](services/ad/)
- [Serviciu de reprezentare](services/agent/)
- [Serviciu de coș](services/cart/)
- [Serviciu de chatbot](services/chatbot/)
- [Serviciu de checkout](services/checkout/)
- [Serviciu de email](services/email/)
- [Frontend](services/frontend/)
- [Load Generator](services/load-generator/)
- [Serviciu MCP](services/mcp/)
- [Serviciu de plată](services/payment/)
- [Serviciu de catalog de produse](services/product-catalog/)
- [Serviciu de ofertare](services/quote/)
- [Serviciu de recomandare](services/recommendation/)
- [Serviciu de expediere](services/shipping/)
- [Serviciu de furnizare a imaginilor](services/image-provider/)
- [Aplicație React Native](services/react-native-app/)

## Scenarii cu feature flags {#feature-flag-scenarios}

Cum poți rezolva probleme folosind OpenTelemetry? Aceste
[scenarii bazate pe feature flags](feature-flags/) te ghidează prin câteva
probleme preconfigurate și îți arată cum să interpretezi datele OpenTelemetry
pentru a le rezolva.

## Referinţă {#reference}

Documentație de referință a proiectului, precum cerințe și matrici de
funcționalități.

- [Arhitectură](architecture/)
- [Dezvoltare](development/)
- [Referință pentru feature flags](feature-flags/)
- [Matrice de caracteristici bazată pe metrici](telemetry-features/metric-coverage/)
- [Cerințe](./requirements/)
- [Capturi de ecran](screenshots/)
- [Servicii](services/)
- [Referință pentru atributele de tip span](telemetry-features/manual-span-attributes/)
- [Teste](tests/)
- [Matricea de caracteristici ale urmelor](telemetry-features/trace-coverage/)
