---
title:
  Configurarea mediului de dezvoltare și comenzi pentru build, servire și altele
linkTitle: Configurare dev și altele
description:
  Află cum să configurezi un mediu de dezvoltare pentru acest site web.
what-next: >
  Acum ești pregătit să [construiești](#build), [servești](#serve) și să faci
  actualizări fișierelor site-ului. Pentru detalii despre cum să trimiți
  modificări, consultă [Trimiterea conținutului](../pull-requests).
weight: 60
default_lang_commit: f184d8b9305065730fc78d4038b0120848e2d385
drifted_from_default: true
cSpell:ignore: TOCSS
---

> [!WARNING] Supported build environments
>
> Builds are officially supported on Linux-based environments and macOS. Other
> environments, such as [DevContainers](#devcontainers), are supported on a
> best-effort basis. For builds on Windows, you can follow steps similar to
> those for Linux using Windows Subsystem for Linux command line [WSL][].

Următoarele instrucțiuni explică pașii de configurare a un mediu de dezvoltare
pentru acest site web.

## Configurare Cloud-IDE

### Gitpod

Pentru a lucra prin [Gitpod.io][]:

1.  Fă un fork al acestui repertoriu. Pentru ajutor, consultă [Crearea unui
    fork][fork].
2.  Din [gitpod.io/workspaces][], creează un spațiu de lucru nou (fă acest lucru
    doar o dată) sau deschide un spațiu de lucru existent peste fork-ul tău.
    Poți accesa și un link de forma:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Notă**: Dacă ai permisiunile necesare pentru a lucra din acest
    > repertoriu sau dorești doar să explorezi, deschide
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod instalează automat pachetele specifice repertoriului tău.
{{% param what-next %}}

### Codespaces

Pentru a lucra prin GitHub [Codespaces][]:

1. Fă un [Fork][] repertoriului de site web.
2. Deschide un Codespace din fork-ul tău.

Mediul de dezvoltare va fi inițializat prin configurația
[DevContainer](#devcontainers). {{% param what-next %}}

## Configurare locală

1.  Fă un [Fork][] și apoi [clonați][clone] repertoriul site-ului web la
    <{{% param github_repo %}}>.
2.  Navighează în directorul repertoriului:

```sh
cd opentelemetry.io
```

1.  Instalează sau actualizează la versiunea [**LTS activă**][nodejs-rel] a
    Node.js. Recomandăm utilizarea [nvm][] pentru a gestiona instalarea
    runtime-ului pentru Node. Pe Linux, rulează următoarea comandă, care va
    instala și actualiza la versiunea specificată în fișierul .nvmrc:

```sh
nvm install
```

Pentru [instalarea pe Windows][nodejs-win], utilizează [nvm-windows][]. Recomandăm
folosirea `cmd` și nu Windows PowerShell pentru comanda de mai jos:

```cmd
nvm install lts && nvm use lts
```

1.  Obține pachetele npm și alte cerințe preliminare:

```sh
npm install
```

Lansează IDE-ul preferat. {{% param what-next %}}

### Build

Pentru a construi site-ul, rulează:

```sh
npm run build
```

Fișierele generate ale site-ului se află în directorul `public`.

> [!IMPORTANT]
>
> Dacă întâmpini **erori** la comenzile de build sau servire similare cu
> următoarele:
>
> ```log
> ERROR error building site: ...[mesaj lung]... TOCSS: failed to transform "/scss/main.scss" (text/x-scss)
> ```
>
> Sau:
>
> ```log
> ERROR failed to load modules: module "github.com/FortAwesome/Font-Awesome" not found
> ```
>
> Aceasta se datorează de obicei faptului că nu ai finalizat toți pașii din
> [configurarea locală](#local-setup). În special, rulează din nou această
> comandă:
>
> ```sh
> npm install
> ```

### Servire

Pentru a servi site-ul, rulează:

```sh
npm run serve
```

Site-ul este servit la [localhost:1313][].

Dacă trebuie să testezi redirecționările [Netlify][], utilizează următoarea
comandă și accesează site-ul la [localhost:8888][]:

```sh
npm run serve:netlify
```

Comanda de servire servește fișierele din memorie, nu de pe disc.

Dacă întâlnești o eroare de tipul `too many open files` sau `pipe failed` pe
macOS, este posibil să fie nevoie să mărești limita descriptorilor de fișiere.
Consultă [problema Hugo #6109](https://github.com/gohugoio/hugo/issues/6109).

### Conținut și submodule

Site-ul web este construit din următoarele conținuturi:

- Fișiere din `content/`, `static/` etc., conform configurărilor implicite
  [Hugo][].
- Puncte de montare, definite de [config][] Hugo în
  `config/_default/module-template.yaml`. Montările provin fie direct din
  submodule git din [content-modules][], fie din conținut procesat din
  `content-modules` (plasat în `tmp/`), și de nicăieri altundeva.

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Modificări ale submodulelor

Dacă modifici orice conținut dintr-un submodul [content-modules][], trebuie mai
întâi să trimiți un PR (conținând modificările submodulului) către repertoriul
submodulului. Abia după ce PR-ul submodulului a fost acceptat, poți actualiza
submodulul și modificările vor apărea pe acest site web.

Cel mai simplu este să gestionezi modificările din `content-modules` lucrând cu
repertoriul la care este legat submodulul corespunzător, în loc să lucrezi
direct în interiorul submodulului.

Contribuitorii experimentați pot lucra direct în submodul, putând astfel
construi și servi direct modificările (din submodul). În mod implicit,
scripturile CI obțin submodulele la fiecare invocare. Pentru a preveni acest
comportament în timp ce lucrezi într-un submodul, setează variabila de mediu
`GET=no`. De asemenea, trebuie să rulezi `git fetch --unshallow` în submodul
înainte de a putea trimite un PR. Alternativ, setează `DEPTH=100` și reobține
submodulele.

## Suport DevContainer {#devcontainers}

Acest repertoriu este configurat pentru utilizare în [Development
Containers][devcontainers], care sunt acceptate de diverse IDE-uri cloud și
locale, precum (în ordine alfabetică):

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://ona.com/docs/ona/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

## Unelte

### Code-excerpter

Utilizează [code-excerpter][] pentru fragmente de cod care ar trebui să fie
sincronizate cu fișierele sursă din acest repertoriu. Pagini ale site-ului web
pot conține fragmente de cod pentru orice setare regională, dar conținutul
original care le folosește este redactat în `content/en` apoi este actualizat de
către echipele de traducere în limba proprie.

În pagina sursă scrisă în limba engleză, plasează o directivă de extragere a
fișierului imediat înainte de blocul de cod închis pe care îl actualizează:

````md
<?code-excerpt path-base="examples/java/getting-started"?>

<?code-excerpt "src/main/java/otel/DiceApplication.java" from="@SpringBootApplication"?>

```java
@SpringBootApplication
public class DiceApplication {
  public static void main(String[] args) {
    SpringApplication app = new SpringApplication(DiceApplication.class);
    app.setBannerMode(Banner.Mode.OFF);
    app.run(args);
  }
}
```
````

Folosește o directivă opțională `path-base` o dată când ești aproape de
începutul paginii atunci când mai multe fragmente de cod provin din același
director. Pentru detalii legat de sintaxa directivei `code-excerpt`, accesează
fișierul readme [code-excerpter][].

Modifică fișierul sursă sau directiva, **nu și blocul de cod închis**. Apoi
rulează următoarea comandă[npm script](/site/build/npm-scripts/):

```sh
npm run fix:code-excerpts
```

Pentru a verifica dacă fragmentele de cod sunt actualizate, rulează:

```sh
npm run check:code-excerpts
```

[code-excerpter]: https://github.com/chalin/code-excerpter

<!-- prettier-ignore-start -->
[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]: https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]: https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[WSL]: https://learn.microsoft.com/en-us/windows/wsl/install
<!-- prettier-ignore-end -->
