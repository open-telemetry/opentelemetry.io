---
title: Componente
description: Componentele principale care alcătuiesc OpenTelemetry
aliases: [data-collection]
weight: 20
default_lang_commit: d8f5ed285d009cc6baac6d7141bfde8d0956a756
---

OpenTelemetry este alcătuit în prezent din mai multe componente principale:

- [Specificație](#specification)
- [Colector](#collector)
- [Implementări API și SDK specifice limbajului](#language-specific-api--sdk-implementations)
  - [Biblioteci de instrumentație](#instrumentation-libraries)
  - [Exportatori](#exporters)
  - [Instrumentarea fără cod](#zero-code-instrumentation)
  - [Detectoare de resurse](#resource-detectors)
  - [Propagatori între servicii](#cross-service-propagators)
  - [Eșantioane](#samplers)
- [Operator Kubernetes](#kubernetes-operator)
- [Elementele funcției ca serviciu](#function-as-a-service-assets)

OpenTelemetry îți permite să înlocuiești nevoia de SDK-uri și instrumente
specifice furnizorului pentru generarea și exportarea datelor de telemetrie.

## Specificație {#specification}

Descrie cerințele și așteptările interlingvistice pentru toate implementările.
Dincolo de o definiție a termenilor, specificația definește următoarele:

- **API:** Definește tipurile de date și operațiunile pentru generarea și
  corelarea datelor de urmărire, metrici și înregistrare în jurnal.
- **SDK:** Definește cerințele pentru o implementare specifică limbii a
  API-ului. Conceptele de configurare, procesare a datelor și exportare sunt, de
  asemenea, definite aici.
- **Data:** Definește protocolul OpenTelemetry (OTLP) și convențiile semantice
  agnostice față de furnizor pentru care un backend de telemetrie poate oferi
  suport.

Pentru mai multe informații, consultă [specificații](/docs/specs/).

## Colector {#collector}

Colectorul OpenTelemetry este un proxy agnostic față de furnizor care poate
primi, procesa și exporta date de telemetrie. Acceptă primirea de date de
telemetrie în formate multiple (de exemplu, OTLP, Jaeger, Prometheus, precum și
multe instrumente comerciale/proprietare) și trimiterea de date către unul sau
mai multe backend-uri. De asemenea, acceptă procesarea și filtrarea datelor de
telemetrie înainte de a fi exportate.

Pentru mai multe informații, consultă [Colector](/docs/collector/).

## Implementări API și SDK specifice limbajului {#language-specific-api--sdk-implementations}

OpenTelemetry are, de asemenea, SDK-uri de limbaj care îți permit să utilizezi
API-ul OpenTelemetry pentru a genera date de telemetrie în limba aleasă și a
exporta aceste date către un backend preferat. Aceste SDK-uri îți permit, de
asemenea, să încorporezi biblioteci de instrumentație pentru biblioteci și
framework-uri comune pe care le poți utiliza pentru a te conecta la
instrumentație manuală în aplicația ta.

Pentru mai multe informații, consultă
[Instrumentare](/docs/concepts/instrumentation/).

### Biblioteci de instrumentație {#instrumentation-libraries}

OpenTelemetry acceptă un număr larg de componente care generează date de
telemetrie relevante din biblioteci și framework-uri populare pentru limbajele
acceptate. De exemplu, cererile HTTP de intrare și de ieșire dintr-o bibliotecă
HTTP generează date despre aceste cereri.

Un obiectiv aspirațional al OpenTelemetry este ca toate bibliotecile populare să
fie construite pentru a fi observabile în mod implicit, astfel încât să nu fie
necesare dependențe separate.

Pentru mai multe informații, consultă
[Instrumentare biblioteci](/docs/concepts/instrumentation/libraries/).

### Exportatori {#exporters}

{{% docs/languages/exporters/intro %}}

### Instrumentarea fără cod {#zero-code-instrumentation}

Dacă este cazul, o implementare specifică limbajului OpenTelemetry oferă o
modalitate de a instrumenta aplicația ta fără a atinge codul sursă. În timp ce
mecanismul de bază depinde de limbaj, instrumentarea fără cod adaugă
capacitățile API și SDK OpenTelemetry aplicației tale. În plus, aceasta ar putea
adăuga un set de biblioteci de instrumentație și dependențe de exportator.

Pentru mai multe informații, consultă
[Instrumentarea fără cod](/docs/concepts/instrumentation/zero-code/).

### Detectoare de resurse {#resource-detectors}

O [resursă](/docs/concepts/resources/) reprezintă entitatea care produce
telemetrie ca atribute de resursă. De exemplu, un proces care produce telemetrie
care rulează într-un container pe Kubernetes are un nume Pod, un spațiu de nume
și eventual un nume de implementare. Poți include toate aceste atribute în
resursă.

Implementările specifice limbajului OpenTelemetry oferă detectarea resurselor
din variabila de mediu `OTEL_RESOURCE_ATTRIBUTES` și pentru multe entități
comune, cum ar fi timpul de execuție al procesului, serviciul, gazda sau
sistemul de operare.

Pentru mai multe informații, consultă [Resurse](/docs/concepts/resources/).

### Propagatori între servicii {#cross-service-propagators}

Propagarea este mecanismul care mută datele între servicii și procese. Deși nu
se limitează la urmărire, propagarea permite urmărilor să construiască
informații cauzale despre un sistem între servicii care sunt distribuite
arbitrar între limitele proceselor și rețelei.

Pentru marea majoritate a cazurilor de utilizare, propagarea contextului are loc
prin biblioteci de instrumentație. Dacă este necesar, poți utiliza propagatori
pentru a serializa și deserializa aspecte transversale, cum ar fi contextul unui
interval și [bagaj](/docs/concepts/signals/bagage/).

### Eșantioane {#samplers}

Eșantionarea este un proces care restricționează cantitatea de urme generate de
un sistem. Fiecare implementare specifică limbajului OpenTelemetry oferă mai
multe [eșantioane principale](/docs/concepts/sampling/#head-sampling)

Pentru mai multe informații, consultă [Eșantionare](/docs/concepts/sampling).

## Operatorul Kubernetes {#kubernetes-operator}

Operatorul OpenTelemetry este o implementare a unui Operator Kubernetes.
Operatorul gestionează OpenTelemetry Collector și auto-instrumentarea sarcinilor
de lucru folosind OpenTelemetry.

Pentru mai multe informații, consultă
[operator K8s](/docs/platforms/kubernetes/operator/).

## Elementele funcției ca serviciu {#function-as-a-service-assets}

OpenTelemetry acceptă diverse metode de monitorizare funcție ca serviciu
furnizate de diferiți furnizori de cloud. Comunitatea OpenTelemetry oferă în
prezent straturi Lambda predefinite capabile să instrumenteze automat aplicația
ta, precum și opțiunea unui strat Lambda Collector independent care poate fi
utilizat la instrumentarea manuală sau automată a aplicațiilor.

Pentru mai multe informații, consultă
[Funcții ca serviciu](/docs/platforms/faas/).
