---
title: Configurarea mediului de dezvoltare și comenzi pentru build, servire și altele
linkTitle: Configurare dev și altele
description: Aflați cum să configurați un mediu de dezvoltare pentru acest site web.
what-next: >
  Acum ești pregătit să [construiești](#build), [servești](#serve) și să faci actualizări
  fișierelor site-ului. Pentru detalii despre cum să trimiți modificări, consultați [Trimiterea
  conținutului](../pull-requests).
weight: 60
cSpell:ignore: TOCSS
---

> [!WARNING] Medii de build acceptate
>
> Build-urile sunt oficial acceptate pe medii bazate pe Linux și macOS. Alte
> medii, precum [DevContainers](#devcontainers), sunt acceptate în limita
> posibilităților. Pentru build-uri pe Windows, puteți urma pași similari celor
> pentru Linux folosind Windows Subsystem for Linux [WSL][].

Următoarele instrucțiuni explică cum să configurați un mediu de dezvoltare pentru
acest site web.

## Configurare Cloud-IDE

### Gitpod

Pentru a lucra prin [Gitpod.io][]:

1.  Faceți un fork acestui repository. Pentru ajutor, consultați [Crearea unui fork][fork].
2.  Din [gitpod.io/workspaces][], creați un spațiu de lucru nou (faceți acest lucru doar o dată) sau
    deschideți un spațiu de lucru existent peste fork-ul dumneavoastră. Puteți accesa și un link de forma:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Notă**: Dacă aveți permisiunile necesare pentru a lucra din acest
    > repository sau doriți doar să explorați, deschideți
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod instalează automat pachetele specifice repository-ului pentru dumneavoastră.
{{% param what-next %}}

### Codespaces

Pentru a lucra prin GitHub [Codespaces][]:

1. Faceți un [Fork][] repository-ului de site web.
2. Deschideți un Codespace din fork-ul dumneavoastră.

Mediul de dezvoltare va fi inițializat prin
configurația [DevContainer](#devcontainers). {{% param what-next %}}

## Configurare locală

1.  Faceți un [Fork][] și apoi [clonați][clone] repository-ul site-ului web la
    <{{% param github_repo %}}>.
2.  Navigați în directorul repository-ului:

```sh
    cd opentelemetry.io
```

3.  Instalați sau actualizați la versiunea [**LTS activă**][nodejs-rel] a Node.js.
    Recomandăm utilizarea [nvm][] pentru a gestiona instalarea runtime-ului pentru Node. Pe Linux,
    rulați următoarea comandă, care va instala și actualiza la versiunea
    specificată în fișierul .nvmrc:

```sh
    nvm install
```

    Pentru [instalare pe Windows][nodejs-win], utilizați [nvm-windows][]. Recomandăm
    folosirea `cmd` și nu Windows PowerShell pentru comanda de mai jos:

```cmd
    nvm install lts && nvm use lts
```

4.  Obțineți pachetele npm și alte cerințe preliminare:

```sh
    npm install
```

Lansați IDE-ul preferat. {{% param what-next %}}

### Build

Pentru a construi site-ul, rulați:

```sh
npm run build
```

Fișierele generate ale site-ului se află în directorul `public`.

> [!IMPORTANT]
>
> Dacă întâlniți **erori** la comenzile de build sau servire similare cu următoarele:
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
> Aceasta se datorează de obicei faptului că nu ați finalizat toți pașii din
> [configurarea locală](#local-setup). În special, rulați din nou această comandă:
>
> ```sh
> npm install
> ```

### Servire

Pentru a servi site-ul, rulați:

```sh
npm run serve
```

Site-ul este servit la [localhost:1313][].

Dacă trebuie să testați redirecționările [Netlify][], utilizați următoarea comandă și
accesați site-ul la [localhost:8888][]:

```sh
npm run serve:netlify
```

Comanda de servire servește fișierele din memorie, nu de pe disc.

Dacă întâlniți o eroare de tipul `too many open files` sau `pipe failed` pe macOS,
este posibil să fie nevoie să măriți limita descriptorilor de fișiere. Consultați
[problema Hugo #6109](https://github.com/gohugoio/hugo/issues/6109).

### Conținut și submodule

Site-ul web este construit din următoarele conținuturi:

- Fișiere din `content/`, `static/` etc., conform configurărilor implicite [Hugo][].
- Puncte de montare, definite de [config][] Hugo în
  `config/_default/module-template.yaml`. Montările provin fie direct din submodule
  git din [content-modules][], fie din conținut procesat din
  `content-modules` (plasat în `tmp/`), și de nicăieri altundeva.

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]:
https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Modificări ale submodulelor

Dacă modificați orice conținut dintr-un submodul [content-modules][], trebuie mai întâi
să trimiteți un PR (conținând modificările submodulului) către repository-ul submodulului.
Abia după ce PR-ul submodulului a fost acceptat, puteți actualiza submodulul și
modificările vor apărea pe acest site web.

Cel mai simplu este să gestionați modificările `content-modules` lucrând cu
repository-ul la care este legat submodulul corespunzător, în loc să lucrați direct
în interiorul submodulului.

Contribuitorii experimentați pot lucra direct în submodul, putând astfel construi și
servi direct modificările (din submodul). În mod implicit, scripturile CI obțin
submodulele la fiecare invocare. Pentru a preveni acest comportament în timp ce
lucrați într-un submodul, setați variabila de mediu `GET=no`. De asemenea, trebuie
să rulați `git fetch --unshallow` în submodul înainte de a putea trimite un PR.
Alternativ, setați `DEPTH=100` și reobțineți submodulele.

## Suport DevContainer {#devcontainers}

Acest repository este configurat pentru utilizare în [Development
Containers][devcontainers], care sunt acceptate de diverse IDE-uri cloud și locale,
precum (în ordine alfabetică):

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://ona.com/docs/ona/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

## Unelte

### Code-excerpter

Utilizați [code-excerpter][] pentru fragmente de cod care ar trebui să fie sincronizate cu fișierele sursă din acest repository .
Pagini ale site-ului web pot conține fragmente de cod pentru orice setare regională, dar conținutul original care le
folosește este redactat în `content/en` apoi este actualizat de către echipele de traducere în limba proprie.

În pagina sursă scrisă în limba engleză, plasează o directivă de extragere a fișierului imediat înainte de
blocul de cod închis pe care îl actualizează:

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

Folosește o directivă opțională `path-base` o dată când sunteți aproape de începutul paginii atunci când mai multe
fragmente de cod provin din același director. Pentru detalii legat de sintaxa directivei `code-excerpt`,
accesați fișierul readme [code-excerpter][].

Modificați fișierul sursă sau directiva, **nu și blocul de cod închis**. Apoi rulați următoarea comandă[npm script](/site/build/npm-scripts/):

```sh
npm run fix:code-excerpts
```

Pentru a verificat dacă fragmentele de cod sunt actualizate, rulați:

```sh
npm run check:code-excerpts
```

[code-excerpter]: https://github.com/chalin/code-excerpter

<!-- prettier-ignore-start -->
[clone]:
https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]:
https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]:
https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[WSL]: https://learn.microsoft.com/en-us/windows/wsl/install
<!-- prettier-ignore-end -->
