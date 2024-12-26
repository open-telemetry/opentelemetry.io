---
title: Дистрибутиви
weight: 25
---

Проєкт OpenTelemetry наразі пропонує [попередньо зібрані дистрибутиви][] колектора. Компоненти, включені в [дистрибутиви][], можна знайти в `manifest.yaml` кожного дистрибутиву.

[попередньо зібрані дистрибутиви]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/releases
[дистрибутиви]:
  https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% docs/latest-release collector-releases /%}}

## Власні дистрибутиви {#custom-distributions}

З різних причин наявні дистрибутиви, надані проєктом OpenTelemetry, можуть не відповідати вашим потребам. Незалежно від того, чи хочете ви меншу версію, чи маєте потребу реалізувати власну функціональність, таку як [розширення автентифікатора](../building/authenticator-extension), [приймачі](../building/receiver), процесори, експортери або [конектори](../building/connector). Інструмент, який використовується для створення дистрибутивів [ocb](../custom-collector) (OpenTelemetry Collector Builder) доступний для створення власних дистрибутивів.
