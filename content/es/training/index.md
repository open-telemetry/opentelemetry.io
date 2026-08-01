---
title: Capacitación
menu: { main: { weight: 45 } }
description: Certificaciones y cursos de OpenTelemetry
type: docs
body_class: ot-training
hide_feedback: true
# LF course image from:
# https://training.linuxfoundation.org/wp-content/uploads/2024/10/LFS148-Course-Badge-300x300.png
params:
  LFS148: https://training.linuxfoundation.org/training/getting-started-with-opentelemetry-lfs148/
default_lang_commit: 662edd797da7c0d65ffb50537187c736a081ba2a
cSpell:ignore: otca
---

Esta página muestra los recursos de capacitación en constante crecimiento para
OpenTelemetry. ¡Vuelve a visitarla con frecuencia para ver las actualizaciones!

## Certificaciones

Demuestra tu experiencia en OpenTelemetry obteniendo la certificación
**OpenTelemetry Certified Associate (OTCA)**, disponible en [Cloud Native
Certifications][]:

<!-- prettier-ignore -->
[![OTCA badge]][OTCA certification]
{.badge--otca .card-and-img-position .hk-no-external-icon}

[Cloud Native Certifications]: https://www.cncf.io/training/certification/
[OTCA badge]: lft-badge-opentelemetry-associate2.svg
[OTCA certification]: https://www.cncf.io/training/certification/otca/

## Cursos

Un curso **GRATUITO** disponible en [Cloud Native Training Courses for
OpenTelemetry][CNTCOT] y ofrecido por la Linux Foundation:

<div class="card--course-wrapper">
<div class="card card--course" style="width: 20rem">

<!-- prettier-ignore -->
![LFS148 course badge][]
{.border-0 .pt-3 .w-75 .m-auto}

<div class="card-body ps-4 pe-4 bg-light-subtle">
  <div class="h4 card-title pt-2 pb-2">
    <span class="badge text-bg-secondary float-end">FREE</span>
    Getting Started with OpenTelemetry
  </div>
  <p class="card-text">
    Un curso diseñado para desarrolladores de software, ingenieros DevOps, ingenieros de confiabilidad del sitio (SRE) y cualquier persona que desee implementar soluciones de telemetría en aplicaciones y entornos.
  </p>
  <p class="card-text text-body-secondary small">
    Online, self-paced, 8-10 hrs,
    <a href="{{% param LFS148 %}}">Más información</a>.
  </p>
  <p class="text-center m-0 pt-1 pb-2">
    <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary">
      Registrarse
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
        <h5 class="card-title">Primeros pasos con OpenTelemetry</h5>
        <p class="card-text">
          Un curso diseñado para desarrolladores de software, ingenieros DevOps, ingenieros de confiabilidad del sitio (SRE) y otros profesionales que deseen implementar soluciones de telemetría en aplicaciones y entornos.
        </p>
        <p class="card-text text-body-secondary small">
          Online, self-paced, 8-10 hrs,
          <a href="{{% param LFS148 %}}">Más información</a>.
        </p>
        <p class="text-center w-100">
          <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary ">
            Register
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

{{% /comment %}}
