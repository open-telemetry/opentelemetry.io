---
title: 교육
menu: { main: { weight: 45 } }
description: 오픈텔레메트리 인증과 강좌
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

이 페이지는 오픈텔레메트리(OpenTelemetry) 교육 자료를 소개한다. 자료는 계속
추가되므로 최신 내용은 이 페이지에서 확인할 수 있다.

## 인증 {#certifications}

오픈텔레메트리 Certified Associate(OTCA)를 취득하면 오픈텔레메트리 전문성을
입증할 수 있다. [Cloud Native Certifications][]에서 확인할 수 있다.

<!-- prettier-ignore -->
[![OTCA badge]][OTCA certification]
{.badge--otca .card-and-img-position .hk-no-external-icon}

[Cloud Native Certifications]: https://www.cncf.io/training/certification/
[OTCA badge]: lft-badge-opentelemetry-associate2.svg
[OTCA certification]: https://www.cncf.io/training/certification/otca/

## 강좌 {#courses}

[Cloud Native Training Courses for OpenTelemetry][CNTCOT]에서 제공하는 Linux
Foundation의 **무료** 강좌이다.

<div class="card--course-wrapper">
<div class="card card--course" style="width: 20rem">

<!-- prettier-ignore -->
![LFS148 course badge][]
{.border-0 .pt-3 .w-75 .m-auto}

<div class="card-body ps-4 pe-4 bg-light-subtle">
  <div class="h4 card-title pt-2 pb-2">
    <span class="badge text-bg-secondary float-end">무료</span>
    Getting Started with OpenTelemetry
  </div>
  <p class="card-text">
    소프트웨어 개발자, DevOps 엔지니어, 사이트 신뢰성 엔지니어(SRE)뿐만 아니라
    다양한 애플리케이션과 여러 환경에 걸쳐 텔레메트리 솔루션을 구현하려는 모든
    사람을 위한 강좌이다.
  </p>
  <p class="card-text text-body-secondary small">
    온라인, 자기 주도 학습, 8–10시간,
    <a href="{{% param LFS148 %}}">자세히 알아보기</a>.
  </p>
  <p class="text-center m-0 pt-1 pb-2">
    <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary">
      등록
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
        alt="LFS148 강좌 배지">
    </div>
    <div class="col-md-7">
      <div class="card-body p-3">
        <h5 class="card-title">Getting Started with OpenTelemetry</h5>
        <p class="card-text">
          소프트웨어 개발자, DevOps 엔지니어, 사이트 신뢰성 엔지니어(SRE)뿐만
          아니라 다양한 애플리케이션과 여러 환경에 걸쳐 텔레메트리 솔루션을
          구현하려는 모든 사람을 위한 강좌이다.
        </p>
        <p class="card-text text-body-secondary small">
          온라인, 자기 주도 학습, 8–10시간,
          <a href="{{% param LFS148 %}}">자세히 알아보기</a>.
        </p>
        <p class="text-center w-100">
          <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary ">
            등록
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

{{% /comment %}}
