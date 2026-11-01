---
title: Runbooks de alertas do Prometheus
default_lang_commit: fe623719bc24346e9dcd77e9769026cf1c720cc5
---

## Regras do Manager {#manager-rules}

### ReconcileErrors

|             |                                                                                                                                            |
| ----------: | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Significado | O OpenTelemetry Operator não consegue concluir a etapa de reconciliação, provavelmente devido a um OpenTelemetryCollector mal configurado. |
|     Impacto | Nenhum impacto nos _deployments_ já em execução ou em novos _deployments_ configurados corretamente.                                       |
| Diagnóstico | Verifique os logs do _manager_ para entender por que isso pode estar acontecendo.                                                          |
|   Mitigação | Descubra qual OpenTelemetryCollector está causando os erros e corrija a configuração.                                                      |

### WorkqueueDepth

|             |                                                                                                                          |
| ----------: | ------------------------------------------------------------------------------------------------------------------------ |
| Significado | A fila de trabalho do operador é maior que 0.                                                                            |
|     Impacto | Nenhum impacto se a profundidade da fila voltar rapidamente a 0. É necessária mais investigação se o problema persistir. |
| Diagnóstico | Verifique os logs do _manager_ para entender por que isso pode estar acontecendo.                                        |
|   Mitigação | Isso pode ser causado por diversos erros. Aja com base no que os logs estão mostrando.                                   |
