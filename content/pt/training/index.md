---
title: Treinamento
menu: { main: { weight: 45 } }
description: OpenTelemetry certificações e cursos
type: docs
body_class: ot-training
default_lang_commit: fa827427ce31631a0b11d5c0151cb8c8e43d8f5b
hide_feedback: true
# LF course image from:
# https://training.linuxfoundation.org/wp-content/uploads/2024/10/LFS148-Course-Badge-300x300.png
params:
  LFS148: https://training.linuxfoundation.org/training/getting-started-with-opentelemetry-lfs148/
cSpell:ignore: otca
---

Está página apresenta recursos de treinamento cada vez mais amplos sobre
OpenTelemetry. Volte sempre para verificar atualizações!

## Certificações {#certifications}

Evidencie sua experiência em OpenTelemetry obtendo a certificação OpenTelemetry
Certified Associate (OTCA), disponível em [Cloud Native Certifications][]:

<!-- prettier-ignore -->
[![OTCA badge]][OTCA certification]
{.badge--otca .card-and-img-position .hk-no-external-icon}

[Cloud Native Certifications]: https://www.cncf.io/training/certification/
[OTCA badge]: lft-badge-opentelemetry-associate2.svg
[OTCA certification]: https://www.cncf.io/training/certification/otca/

## Cursos {#courses}

Você pode obter um curso **Gratuito** de OpenTelemetry através da plataforma
[Cloud Native Training Courses for OpenTelemetry][CNTCOT] oferecido pela Linux
Foundation:

<div class="card--course-wrapper">
<div class="card card--course" style="width: 20rem">

<!-- prettier-ignore -->
![LFS148 course badge][]
{.img-initial .pt-3 .w-75 .m-auto}

<div class="card-body ps-4 pe-4 bg-light-subtle">
  <div class="h4 card-title pt-2 pb-2">
    <span class="badge text-bg-secondary float-end">Grátis</span>
    Introdução ao OpenTelemetry
  </div>
  <p class="card-text">
  Um curso elaborado para desenvolvedores de software, engenheiros DevOps, SREs e qualquer pessoa que deseje implementar soluções de telemetria em ambientes e aplicações.
  </p>
  <p class="card-text text-body-secondary small">
    Disponível, ritmo individual, 8-10 hrs,
    <a href="{{% param LFS148 %}}">saiba mais</a>.
  </p>
  <p class="text-center m-0 pt-1 pb-2">
    <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary">
      Registrar
    </a>
  </p>
</div>

</div>
</div>

[CNTCOT]: https://www.cncf.io/training/courses/?_sft_lf-project=opentelemetry
[LFS148 course badge]: LFS148-Course-Badge-300x300.avif

{{% comment %}}

<!-- Alternative design. Keeping for possible use later -->

<div class="card mb-3" style="max-width: 540px; margin: auto">
  <div class="row p-2">
    <div class="col-md-5 d-flex align-items-center">
      <img src="LFS148-Course-Badge-300x300.avif"
        class="img-initial m-auto"
        alt="LFS148 course badge">
    </div>
    <div class="col-md-7">
      <div class="card-body p-3">
        <h5 class="card-title">Introdução ao OpenTelemetry</h5>
        <p class="card-text">
          Um curso elaborado para desenvolvedores de software, engenheiros DevOps, SREs e qualquer pessoa que deseje implementar soluções de telemetria em ambientes e aplicações.
        </p>
        <p class="card-text text-body-secondary small">
          Disponível, ritmo individual, 8-10 hrs,
          <a href="{{% param LFS148 %}}">saiba mais</a>.
        </p>
        <p class="text-center w-100">
          <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary ">
            Registrar
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

{{% /comment %}}
