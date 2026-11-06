---
title: Bazată pe cod
description:
  Află care sunt pașii esențiali pentru configurarea instrumentării bazate pe
  cod
weight: 20
aliases: [manual]
default_lang_commit: 8d7aa298d2b42f64f118526e7a1189b1b9dffd0d
---

## Importă API-ul și SDK-ul OpenTelemetry {#import-the-opentelemetry-api-and-sdk}

Primul pas este să imporți OpenTelemetry în codul serviciului tău. Dacă dezvolți
o bibliotecă sau o altă componentă care urmează să fie folosită de un program
executabil, ai nevoie doar de API ca dependență. Dacă artefactul tău este un
proces sau un serviciu de sine stătător, vei avea nevoie atât de API, cât și de
SDK. Pentru mai multe informații despre API-ul și SDK-ul OpenTelemetry, consultă
[specificația](/docs/specs/otel/).

## Configurează API-ul OpenTelemetry {#configure-the-opentelemetry-api}

Pentru a crea urme sau metrici, trebuie mai întâi să creezi un furnizor de
tracer și/sau de meter. În general, recomandăm ca SDK-ul să ofere un singur
furnizor implicit pentru aceste obiecte. De la acest furnizor obții apoi o
instanță de tracer sau de meter, căreia îi atribui un nume și o versiune. Numele
ales ar trebui să identifice exact ce anume este instrumentat -- de exemplu,
dacă scrii o bibliotecă, ar trebui să folosești numele bibliotecii tale (cum ar
fi `com.example.myLibrary`), deoarece acest nume va fi folosit ca spațiu de nume
pentru toate span-urile sau evenimentele metrice produse. Se recomandă, de
asemenea, să specifici un șir de versiune (de exemplu, `semver:1.0.0`) care
corespunde versiunii curente a bibliotecii sau a serviciului tău.

## Configurează SDK-ul OpenTelemetry {#configure-the-opentelemetry-sdk}

Dacă dezvolți un proces de tip serviciu, va trebui să configurezi și SDK-ul cu
opțiunile potrivite pentru exportul datelor de telemetrie către un backend de
analiză. Recomandăm ca această configurare să fie gestionată programatic,
printr-un fișier de configurare sau printr-un alt mecanism. Fiecare limbaj
oferă, de asemenea, opțiuni de ajustare proprii, pe care le poți folosi la
nevoie.

## Creează date de telemetrie {#create-telemetry-data}

După ce ai configurat API-ul și SDK-ul, poți crea urme și evenimente metrice
folosind obiectele tracer și meter obținute de la furnizor. Pentru dependențele
tale, folosește biblioteci de instrumentare -- consultă
[registrul](/ecosystem/registry/) sau depozitul limbajului tău pentru mai multe
informații despre acestea.

## Exportă datele {#export-data}

După ce ai creat date de telemetrie, vei dori să le trimiți undeva.
OpenTelemetry suportă două metode principale de export al datelor din procesul
tău către un backend de analiză: fie direct din proces, fie prin intermediul
[Colectorului OpenTelemetry](/docs/collector), care are rol de proxy.

Exportul din proces presupune să imporți ca dependență unul sau mai mulți
_exportatori_, adică biblioteci care convertesc obiectele span și metricile
păstrate în memorie de OpenTelemetry în formatul potrivit pentru instrumentele
de analiză a telemetriei, precum Jaeger sau Prometheus. În plus, OpenTelemetry
suportă un protocol de transmisie numit `OTLP`, disponibil în toate SDK-urile
OpenTelemetry. Acest protocol poate fi folosit pentru a trimite date către
Colectorul OpenTelemetry, un proces binar de sine stătător care poate rula ca
proxy sau sidecar pe lângă instanțele serviciului tău ori pe o gazdă separată.
Colectorul poate fi apoi configurat să transmită mai departe și să exporte
aceste date către instrumentele de analiză alese de tine.

Pe lângă instrumentele open source precum Jaeger sau Prometheus, tot mai multe
companii suportă preluarea datelor de telemetrie din OpenTelemetry. Pentru
detalii, consultă [furnizori](/ecosystem/vendors/).
