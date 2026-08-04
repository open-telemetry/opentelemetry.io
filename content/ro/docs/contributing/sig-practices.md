---
title: Practici SIG pentru aprobatori și administratori
linkTitle: Practici SIG
description:
  Află cum aprobatorii și administratorii gestionează problemele și
  contribuțiile.
weight: 999
default_lang_commit: db8337edbbac824aebbb330acea18a7042b38806 # patched
drifted_from_default: true
cSpell:ignore: Comms contribfest hotfixes triager triagers
---

Această pagină include îndrumări și câteva practici comune folosite de
aprobatori și administratori.

## Integrare {#onboarding}

Dacă un contribuitor își asumă un rol cu mai multă responsabilitate față de
documentație (aprobator, administrator), acesta va fi integrat de aprobatorii și
administratorii existenți:

- Este adăugat în grupul `docs-approvers` (sau `docs-maintainers`).
- Este adăugat în canalele Slack `#otel-comms` și `#otel-maintainers`, precum și
  în cele private ale echipei.
- I se cere să se înscrie pentru invitațiile de calendar la
  [întâlnirea SIG Comms](https://groups.google.com/a/opentelemetry.io/g/calendar-comms)
  și la
  [întâlnirea administratorilor](https://groups.google.com/a/opentelemetry.io/g/calendar-maintainer-meeting).
- I se cere să verifice dacă ora actuală a întâlnirii SIG Comms i se potrivește,
  iar dacă nu, să colaboreze cu aprobatorii și administratorii existenți pentru
  a găsi o oră care convine tuturor.
- I se cere să consulte diferitele resurse disponibile pentru contribuitori:
  - [Resurse pentru comunitate](https://github.com/open-telemetry/community/),
    în special documentul despre
    [Apartenența la comunitate](https://github.com/open-telemetry/community/blob/main/community-membership.md)
    și
    [ghidul pentru rețelele sociale](https://github.com/open-telemetry/community/blob/main/social-media-guide.md).
  - [Îndrumări pentru contribuții](/docs/contributing). Ca parte a acestui
    proces, va consulta aceste documente și va oferi feedback pentru
    îmbunătățirea lor prin probleme (issues) sau cereri de integrare (pull
    requests).

Resurse suplimentare valoroase de consultat sunt:

- [Documentația Hugo](https://gohugo.io/documentation/)
- [Documentația Docsy](https://www.docsy.dev/docs/)
- [Îndrumări de marketing](/community/marketing-guidelines/), inclusiv
  îndrumările privind branding-ul Linux Foundation și
  [utilizarea mărcilor comerciale](https://www.linuxfoundation.org/legal/trademark-usage).
  Acestea sunt deosebit de valoroase la revizuirea intrărilor în registru,
  integrări, furnizori, adoptatori sau distribuții.

## Colaborare {#collaboration}

- Aprobatorii și administratorii au programe de lucru și circumstanțe diferite.
  De aceea, se presupune că întreaga comunicare este asincronă și nimeni nu ar
  trebui să se simtă obligat să răspundă în afara programului său obișnuit.
- Atunci când un aprobator sau un administrator nu va putea contribui pentru o
  perioadă mai lungă (mai mult de câteva zile sau o săptămână), acesta ar trebui
  să comunice acest lucru pe canalul
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) și să își
  actualizeze statusul pe GitHub.
- Aprobatorii și administratorii respectă
  [Codul de conduită OTel](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  și [Valorile comunității](/community/mission/#community-values). Ei sunt
  prietenoși și de ajutor pentru contribuitori. În cazul unui conflict, al unei
  neînțelegeri sau al oricărei alte situații care îi face să se simtă
  inconfortabil, se pot retrage dintr-o conversație, un issue sau un PR și pot
  solicita intervenția unui alt aprobator sau administrator.

## Triere {#triage}

### Probleme (Issues) {#issues}

- Problemele primite sunt triate de echipa `@open-telemetry/docs-triagers`.
- Ca prim pas, persoana responsabilă cu trierea citește titlul și descrierea
  problemei și aplică următoarele etichete:
  - **Obligatoriu:** o etichetă `sig:*`, `lang:*` sau `docs:*` pentru a stabili
    responsabilitatea (sau co-responsabilitatea) pentru problemă:
    - O etichetă `sig:*` dacă problema este legată de conținut sau de o
      întrebare aflată în responsabilitatea unui SIG (de exemplu, o întrebare
      despre Colector va fi etichetată `sig:collector`).
    - O etichetă `lang:*` dacă problema este legată de conținut sau de o
      întrebare specifică unei anumite localizări.
    - O etichetă `docs:*` dacă problema este legată de conținut sau de o
      întrebare aflată exclusiv în responsabilitatea echipei de documentație
      (SIG Comms):
      - `docs`
      - `docs:admin`
      - `docs:accessibility`
      - `docs:analytics-and-seo`
      - `docs:IA`
      - `docs:blog`
      - `docs:cleanup/refactoring`
      - `docs:upstream`, `docs:upstream/docsy`
      - `docs:javascript`
      - `docs:mobile`
      - `docs:registry`
      - `docs:ux`
  - **Obligatoriu:** o etichetă `triage:*`:
    - `triage:accepted`, `triage:accepted:needs-pr`
    - `triage:deciding`, `triage:deciding:blocked`, `triage:deciding:needs-info`
    - `triage:rejected`, `triage:rejected:duplicate`, `triage:rejected:invalid`,
      `triage:rejected:wontfix`
  - **Obligatoriu:** stabilirea tipului problemei:
    - tipul de problemă `bug` pentru defecte;
    - tipul de problemă `enhancement` pentru cereri de îmbunătățiri;
    - eticheta `type:question` pentru întrebări;
    - eticheta `type:copyedit` pentru corecturi de text;
    - mutarea problemei în „Discussions” dacă aceasta pare a fi o discuție
      deschisă fără un rezultat acționabil clar.
  - **Opțional:** o etichetă de estimare, dacă este cazul:
    - `e0-minutes`
    - ...
    - `e4-months`
  - **Opțional (doar pentru administratori):** o etichetă de prioritate:
    - `p0-critical`
    - `p1-high`
    - `p2-medium`
    - `p3-low`
  - **Opțional:** una dintre următoarele etichete speciale:
    - `good first issue`
    - `help wanted`
    - `contribfest`
    - `maintainers only`
    - `forever`
    - `stale`
- Automatizarea va marca o problemă aflată în starea `triage:deciding` cu
  eticheta `triage:followup` pentru re-triere după 14 zile de inactivitate.
  Eticheta `triage:followup` ar trebui eliminată în termen de 7 zile.
  Menționarea participanților și eliminarea etichetei reprezintă o activitate
  suficientă.

### PR-uri {#prs}

- PR-urile trebuie să aibă o problemă asociată etichetată `triage:accepted`, cu
  următoarele excepții:
  - PR-uri automate;
  - remedieri urgente (_hotfixes_) efectuate de administratori sau aprobatori.
- Automatizarea se va asigura că PR-urile sunt
  [etichetate](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml)
  și
  [atribuite](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml)
  SIG-ului co-responsabil sau echipei de localizare corespunzătoare.
- PR-urile ar trebui să aibă aceleași etichete de co-responsabilitate ca
  problemele asociate.
- Dacă PR-ul este în responsabilitatea comună a unui SIG, acest grup este
  responsabil de efectuarea unei prime revizuiri pentru a se asigura că
  informațiile sunt corecte din punct de vedere tehnic.
- Dacă PR-ul este în responsabilitatea comună a unei echipe de localizare, acest
  grup este responsabil de verificarea corectitudinii traducerii.
- Principala responsabilitate a echipei de documentație este să se asigure că
  PR-ul este în concordanță cu obiectivele generale ale proiectului, este plasat
  în locul potrivit în cadrul structurii și respectă ghidurile de stil și de
  conținut ale proiectului.
- PR-urilor cărora le lipsesc elemente necesare pentru a putea fi integrate
  trebuie să li se aplice etichetele corespunzătoare:
  - `missing:cla`
  - `missing:docs-approval`
  - `missing:sig-approval`
  - `blocked`
- Automatizarea va marca un PR cu eticheta `stale` pentru a solicita o nouă
  revizuire după 21 de zile de inactivitate. Eticheta `stale` ar trebui
  eliminată în termen de 14 zile. Menționarea participanților și eliminarea
  etichetei reprezintă o activitate suficientă.
- PR-urile nu sunt niciodată închise automat.

## Revizuiri de cod {#code-reviews}

### Generalități {#general}

- Dacă ramura unui PR nu este actualizată față de ramura de bază (_base
  branch_), nu este necesar să fie sincronizată în mod continuu: fiecare
  actualizare declanșează rularea tuturor verificărilor CI ale PR-ului. De multe
  ori este suficient să fie actualizată chiar înainte de integrare.
- Un PR creat de o persoană care nu este administrator nu ar trebui
  **niciodată** să actualizeze submodule Git. Acest lucru se întâmplă ocazional
  din greșeală. Informează autorul PR-ului că nu trebuie să își facă griji,
  deoarece problema va fi remediată înainte de integrare, însă pe viitor ar
  trebui să se asigure că lucrează dintr-un fork actualizat.
- Dacă un contribuitor întâmpină dificultăți la semnarea CLA-ului sau a utilizat
  din greșeală o adresă de e-mail incorectă într-unul dintre commiturile sale,
  roagă-l să remedieze problema sau să refacă istoricul PR-ului printr-un
  rebase. În cel mai rău caz, închide și redeschide PR-ul pentru a declanșa o
  nouă verificare a CLA-ului.
- Cuvintele necunoscute pentru cSpell pot fi adăugate la lista de ignorare în
  unul dintre următoarele trei locuri:
  - **Antetul paginii**: în general preferat pentru cuvinte izolate care este
    puțin probabil să apară în alte pagini. Vezi [Verificarea ortografiei][].
  - **Dicționarul localizării**: preferat pentru cuvinte care sunt susceptibile
    să fie utilizate în mai multe pagini ale aceleiași limbi, de exemplu
    `.cspell/en-words.txt`.
  - **Lista comună de cuvinte (pentru toate localizările)**:
    `.cspell/all-words.txt`. Este preferată pentru termeni a căror ortografie
    este validă în toate limbile, cum ar fi numele de produse sau numele
    persoanelor. Vezi [Verificarea ortografiei][].

  Revizorii și aprobatorii pot stabili în timpul procesului de revizuire dacă
  locul ales este adecvat.

[Verificarea ortografiei]: ../style-guide/#spell-checking

### PR-uri în coproprietate {#co-owned-prs}

PR-urile care conțin modificări ale documentației aflate în responsabilitatea
comună a unui SIG (Colector, Demo, documentație specifică unui limbaj etc.) ar
trebui să obțină două aprobări: una din partea unui aprobator al echipei de
documentație și una din partea unui aprobator al SIG-ului.

- Aprobatorul de documentație etichetează astfel de PR-uri cu `sig:<nume>` și
  menționează grupul SIG `-approvers` în acel PR.
- După ce un aprobator de documentație a revizuit și aprobat PR-ul, acesta poate
  adăuga eticheta
  [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing).
  Aceasta semnalează SIG-ului că trebuie să revizuiască și să aprobe PR-ul.
- Dacă nu este acordată nicio aprobare din partea SIG-ului într-o perioadă de
  grație rezonabilă (în general două săptămâni, dar mai puțin în cazurile
  urgente), un administrator al documentației poate decide, pe baza propriei
  evaluări, integrarea PR-ului.

### PR-uri de la roboți {#prs-from-bots}

PR-urile create de roboți pot fi integrate conform următoarei practici:

- PR-urile care actualizează automat versiunile din registru pot fi corectate,
  aprobate și integrate imediat.
- PR-urile care actualizează automat versiunile SDK-urilor, ale instrumentărilor
  fără cod sau ale Colectorului pot fi aprobate și integrate, cu excepția
  cazului în care SIG-ul corespunzător semnalează că integrarea ar trebui
  amânată.
- PR-urile care actualizează automat versiunea unei specificații necesită adesea
  actualizarea unor scripturi pentru ca verificările CI să fie finalizate cu
  succes. În acest caz, [@chalin](https://github.com/chalin/) se va ocupa de PR.
  În caz contrar, aceste PR-uri pot fi de asemenea aprobate și integrate, cu
  excepția cazului în care SIG-ul corespunzător semnalează că integrarea ar
  trebui amânată.

### PR-uri de traducere {#translation-prs}

PR-urile care conțin modificări ale traducerilor ar trebui să obțină două
aprobări: una din partea unui aprobator al echipei de documentație și una din
partea unui aprobator al echipei de traducere. Se aplică practici similare celor
recomandate pentru PR-urile aflate în responsabilitate comună.

## Integrarea PR-urilor {#merging-prs}

Următorul flux de lucru poate fi utilizat de administratori pentru integrarea
PR-urilor:

- Asigură-te că PR-ul are toate aprobările necesare și că toate verificările CI
  sunt finalizate cu succes.
- Dacă ramura nu este actualizată față de ramura de bază, actualizeaz-o prin
  rebase folosind interfața GitHub.
- Actualizarea va declanșa din nou rularea tuturor verificărilor CI. Așteaptă
  finalizarea lor cu succes sau execută un script precum cel de mai jos pentru
  ca acest lucru să se întâmple în fundal:

  ```shell
  export PR=<ID-UL PR-ULUI>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```

## PR-uri de specificație și ramuri de integrare {#spec-integration-branches}

Site-ul integrează continuu modificările nelansate din depozitele
[opentelemetry-specification][] și [semantic-conventions][]. Două fluxuri de
lucru programate ([detalii][ci-section]) rulează zilnic și mențin un PR de
„integrare” în stare de ciornă actualizat cu următoarea versiune de dezvoltare:

- Tipar de ramură: `otelbot/spec-integration-vX.Y.Z-dev` și
  `otelbot/semconv-integration-vX.Y.Z-dev`.
- Lista ramurilor active: [spec][spec-branches] · [semconv][semconv-branches].

[opentelemetry-specification]:
  https://github.com/open-telemetry/opentelemetry-specification
[semantic-conventions]: https://github.com/open-telemetry/semantic-conventions
[ci-section]: /site/build/ci-workflows/#spec-integration-branches
[spec-branches]:
  https://github.com/open-telemetry/opentelemetry.io/branches/all?query=spec-integration
[semconv-branches]:
  https://github.com/open-telemetry/opentelemetry.io/branches/all?query=semconv-integration

### Administratori SIG spec / semconv {#spec--semconv-sig-maintainers}

Chiar înainte de a pregăti o lansare:

1. Găsește cea mai recentă ramură de integrare pentru specificația ta la
   link-urile date în secțiunea anterioară (de exemplu,
   `otelbot/spec-integration-v1.56.0-dev`).
2. Deschide PR-ul asociat (link în pagina ramurii).
3. Declanșează o rulare nouă a fluxului de lucru corespunzător pentru a prelua
   cele mai recente modificări ale tale:
   - [update-spec-integration-branch.yml][]
   - [update-semconv-integration-branch.yml][]
4. Dacă verificările PR-ului sunt verzi, specificația poate fi lansată în
   siguranță. Dacă nu, notifică `@open-telemetry/docs-maintainers` pentru a
   putea remedia defecțiunea înainte de lansare.

### Administratori SIG Comms {#comms-sig-maintainers}

Pe parcursul lunii, verifică periodic PR-urile de integrare și aplică remedieri
incrementale pentru a menține verificările CI „verzi”. Identificarea problemelor
din timp - câtă vreme setul de modificări din amonte (_upstream_) este încă
redus - este mult mai ușoară decât stingerea incendiilor în ziua lansării.

[update-spec-integration-branch.yml]:
  https://github.com/open-telemetry/opentelemetry.io/actions/workflows/specs-integration.yml
[update-semconv-integration-branch.yml]:
  https://github.com/open-telemetry/opentelemetry.io/actions/workflows/specs-integration.yml
