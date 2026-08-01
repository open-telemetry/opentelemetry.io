---
title: Runbooks des alertes Prometheus
default_lang_commit: 1253527a5bea528ae37339692e711925785343b1
---

## Règles du gestionnaire {#manager-rules}

### ReconcileErrors {#reconcileerrors}

|               |                                                                                                                                          |
| ------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Signification | L'opérateur OpenTelemetry ne peut pas réussir l'étape de réconciliation, probablement à cause d'un OpenTelemetryCollector mal configuré. |
|        Impact | Aucun impact sur les déploiements déjà en cours d'exécution ou les nouveaux corrects.                                                    |
|    Diagnostic | Vérifiez les logs du gestionnaire pour les raisons pour lesquelles cela pourrait arriver.                                                |
|    Mitigation | Découvrez quel OpenTelemetryCollector cause les erreurs et corrigez la configuration.                                                    |

### WorkqueueDepth {#workqueuedepth}

|               |                                                                                                                                                    |
| ------------: | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Signification | La file d'attente de travail pour l'opérateur est supérieure à 0.                                                                                  |
|        Impact | Aucun impact si la profondeur de la file d'attente revient à 0 rapidement. De plus amples investigations sont nécessaires si le problème persiste. |
|    Diagnostic | Vérifiez les raisons dans les logs du gestionnaire pour lesquelles cela pourrait se produire.                                                      |
|    Mitigation | Cela pourrait être causé par de nombreuses erreurs. Agissez en fonction de ce que montrent les logs.                                               |
