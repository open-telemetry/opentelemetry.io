---
title: 培训资源
menu: { main: { weight: 45 } }
description: OpenTelemetry 认证与课程
type: docs
body_class: ot-training
hide_feedback: true
# LF 课程图片来源：
# https://training.linuxfoundation.org/wp-content/uploads/2024/10/LFS148-Course-Badge-300x300.png
params:
  LFS148: https://training.linuxfoundation.org/training/getting-started-with-opentelemetry-lfs148/
default_lang_commit: 662edd797da7c0d65ffb50537187c736a081ba2a
cSpell:ignore: otca
---

本页展示了日益丰富的 OpenTelemetry 培训资源，欢迎常回来查看更新！

## 认证 {#certifications}

通过获得 OpenTelemetry Certified Associate (OTCA) 认证，
展示你在 OpenTelemetry 方面的专业能力。
你可以从[云原生认证][Cloud Native Certifications]页面查询：

<!-- prettier-ignore -->
[![OTCA badge]][OTCA certification]
{.badge--otca .card-and-img-position .hk-no-external-icon}

[Cloud Native Certifications]: https://www.cncf.io/training/certification/
[OTCA badge]: lft-badge-opentelemetry-associate2.svg
[OTCA certification]: https://www.cncf.io/training/certification/otca/

## 课程 {#courses}

你可以查阅 Linux 基金会在 [OpenTelemetry 云原生培训课程][CNTCOT]中推出的**免费**课程：

<div class="card--course-wrapper">
<div class="card card--course" style="width: 20rem">

<!-- prettier-ignore -->
![LFS148 course badge][]
{.border-0 .pt-3 .w-75 .m-auto}

<div class="card-body ps-4 pe-4 bg-light-subtle">
  <div class="h4 card-title pt-2 pb-2">
    <span class="badge text-bg-secondary float-end">FREE</span>
    OpenTelemetry 入门
  </div>
  <p class="card-text">
    本课程专为软件开发人员、DevOps 工程师、站点可靠性工程师（SRE）
    以及希望在各类应用和环境中实施遥测方案的人员设计。
  </p>
  <p class="card-text text-body-secondary small">
    在线，自主进度，8–10 小时，
    <a href="{{% param LFS148 %}}">了解详情</a>。
  </p>
  <p class="text-center m-0 pt-1 pb-2">
    <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary">
      立即注册
    </a>
  </p>
</div>

</div>
</div>

[CNTCOT]: https://www.cncf.io/training/courses/?_sft_lf-project=opentelemetry
[LFS148 course badge]: LFS148-Course-Badge-300x300.avif

{{% comment %}}

<!-- 替代设计，保留以备后用 -->

<div class="card mb-3" style="max-width: 540px; margin: auto">
  <div class="row p-2">
    <div class="col-md-5 d-flex align-items-center">
      <img src="LFS148-Course-Badge-300x300.avif"
        class="img-initial m-auto"
        alt="LFS148 课程徽章">
    </div>
    <div class="col-md-7">
      <div class="card-body p-3">
        <h5 class="card-title">OpenTelemetry 入门</h5>
        <p class="card-text">
          本课程专为软件开发人员、DevOps 工程师、站点可靠性工程师（SRE）
          等人员设计，旨在帮助他们在各类应用和环境中实施遥测方案。
        </p>
        <p class="card-text text-body-secondary small">
          在线，自主进度，8–10 小时，<a href="{{% param LFS148 %}}">了解详情</a>。
        </p>
        <p class="text-center w-100">
          <a href="{{% param LFS148 %}}" target="_blank" rel="noopener" class="btn btn-primary">
            立即注册
          </a>
        </p>
      </div>
    </div>
  </div>
</div>

{{% /comment %}}
