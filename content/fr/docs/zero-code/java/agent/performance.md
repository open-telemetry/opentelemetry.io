---
title: Performance
description: Informations sur la performance pour l'agent Java OpenTelemetry
weight: 400
aliases:
  - /docs/languages/java/performance/
default_lang_commit: 3d179dbe1270b83aafff0d3b6aa3311afd482649
cSpell:ignore: Dotel
---

L'agent Java OpenTelemetry instrumente votre application en s'exécutant à
l'intérieur de la même Machine Virtuelle Java (JVM). Comme tout autre agent
logiciel, l'agent Java nécessite des ressources système comme le CPU, la mémoire
et la bande passante réseau. L'utilisation des ressources par l'agent est
appelée "impact" en ressources de l'agent. L' agent Java OpenTelemetry a un
impact minimal sur les performances du système lors de l'instrumentation des
applications JVM, bien que dépendant de plusieurs facteurs.

Certains facteurs qui pourraient augmenter l'impact de l'agent sont liés à
l'environnement d'exécution, tels que l'architecture de la machine physique, la
fréquence du CPU, la quantité et la vitesse de la mémoire, la température du
système et la contention des ressources. D'autres facteurs incluent la
virtualisation et la conteneurisation, le système d'exploitation et ses
bibliothèques, la version et le fournisseur de la JVM, les paramètres de la JVM,
la conception algorithmique du logiciel surveillé, et les dépendances
logicielles.

En raison de la complexité des logiciels modernes et de la grande diversité des
scénarios de déploiement, il est impossible de donner une estimation unique de
l'impact de l'agent. Pour trouver l'impact de tout agent d'instrumentation dans
un déploiement donné, vous devez mener des tests en conditions réelles et
collecter des mesures directement. Par conséquent, traitez toutes les
déclarations sur les performances comme des informations générales et des lignes
directrices qui sont sujettes à évaluation dans un système spécifique.

Les sections suivantes décrivent les exigences minimales de l'agent Java
OpenTelemetry, ainsi que les contraintes potentielles ayant un impact sur les
performances, et des lignes directrices pour optimiser les performances de
l'agent.

## Lignes directrices pour réduire l'impact de l'agent {#guidelines-to-reduce-agent-overhead}

Les bonnes pratiques et les techniques suivantes peuvent aider à réduire la
consommation en ressources de l'agent Java.

### Configurer l'échantillonnage des traces {#configure-trace-sampling}

Le volume de spans traités par l'instrumentation peut avoir un impact sur la
consommation de ressources de l'agent. Vous pouvez configurer l'échantillonnage
des traces pour ajuster le volume de spans et réduire l'utilisation des
ressources. Voir [Échantillonnage](/docs/languages/java/sdk/#sampler).

### Désactiver des instrumentations spécifiques {#turn-off-specific-instrumentations}

Vous pouvez réduire davantage l'impact de l'agent en désactivant les
instrumentations qui ne sont pas nécessaires ou qui produisent trop de spans.
Pour désactiver une instrumentation, utilisez
`-Dotel.instrumentation.<name>.enabled=false` ou la variable d'environnement
`OTEL_INSTRUMENTATION_<NAME>_ENABLED`, où `<name>` est le nom de
l'instrumentation.

Par exemple, l'option suivante désactive l'instrumentation JDBC :
`-Dotel.instrumentation.jdbc.enabled=false`

### Allouer plus de mémoire pour l'application {#allocate-more-memory-for-the-application}

Augmenter la taille maximale du tas de la JVM en utilisant l'option `-Xmx<size>`
peut aider à atténuer les problèmes de consommation de ressources de l'agent,
car les instrumentations peuvent générer un grand nombre d'objets à courte durée
de vie en mémoire.

### Réduire l'instrumentation manuelle à ce dont vous avez besoin {#reduce-manual-instrumentation-to-what-you-need}

Trop d'instrumentation manuelle pourrait introduire des inefficacités qui
augmentent l'impact de l'agent. Par exemple, utiliser `@WithSpan` sur chaque
méthode entraîne un volume élevé de spans, ce qui à son tour augmente le bruit
dans les données et consomme plus de ressources système.

### Provisionner des ressources adéquates {#provision-adequate-resources}

Assurez-vous de provisionner suffisamment de ressources pour votre
instrumentation et pour le Collecteur. La quantité de ressources telles que la
mémoire ou le disque dépend de l'architecture de votre application et de vos
besoins. Par exemple, une configuration courante consiste à exécuter l'
application instrumentée sur le même hôte que le Collecteur OpenTelemetry. Dans
ce cas, envisagez de dimensionner correctement les ressources pour le Collecteur
et d'optimiser ses paramètres. Voir
[Mise à l'échelle](/docs/collector/scaling/).

## Contraintes ayant un impact sur les performances de l'agent Java {#constraints-impacting-the-performance-of-the-java-agent}

En général, plus vous collectez de télémétrie de votre application, plus l'
impact de l'agent est important. Par exemple, générer les traces de méthodes qui
ne sont pas pertinentes pour votre application peut produire une surcharge
considérable de l'agent car les traces pour de telles méthodes sont plus
coûteuse en calcul que l'exécution de la méthode elle-même. De même, les labels
à haute cardinalité dans les métriques peuvent augmenter l'utilisation de la
mémoire. La journalisation de débogage, si elle est activée, augmente également
les opérations d'écriture sur le disque et l'utilisation de la mémoire.

Certaines instrumentations, par exemple JDBC ou Redis, produisent des volumes
élevés de spans qui augmentent l'impact de l'agent. Pour plus d'informations sur
la façon de désactiver les instrumentations inutiles, voir
[Désactiver des instrumentations spécifiques](#turn-off-specific-instrumentations).

{{% alert title="Note" %}}

Les fonctionnalités expérimentales de l'agent Java peuvent augmenter l'impact de
l'agent en raison de l'accent mis sur le développement des fonctionnalités
plutôt que sur les performances de celles-ci. Les fonctionnalités stables sont
plus sûres en termes de performance de l'agent.

{{% /alert %}}

## Dépannage des problèmes de l'impact de l'agent {#troubleshooting-agent-overhead-issues}

Lors du dépannage des problèmes d'impact de l'agent, procédez comme suit :

- Vérifiez les exigences minimales. Voir
  [Prérequis](/docs/languages/java/getting-started/#prerequisites).
- Utilisez la dernière version compatible de l'agent Java.
- Utilisez la dernière version compatible de votre JVM.

Envisagez de prendre les mesures suivantes pour diminuer l'impact de l'agent :

- Si votre application approche des limites de mémoire, envisagez de lui donner
  plus de mémoire.
- Si votre application utilise tout le CPU, vous pourriez vouloir la mettre à
  l'échelle horizontalement.
- Essayez de désactiver ou de procéder à des réglages sur les métriques.
- Ajustez les paramètres d'échantillonnage des traces pour réduire le volume de
  spans.
- Désactivez des instrumentations spécifiques.
- Contrôlez l'instrumentation manuelle pour vérifier qu'il n'y a pas de
  génération inutile de spans.

## Lignes directrices pour mesurer l'impact de l'agent {#guidelines-for-measuring-agent-overhead}

Mesurer l'impact de l'agent dans votre propre environnement fournit des données
précises sur l'impact de l'instrumentation sur les performances de votre
application. Les lignes directrices suivantes décrivent les étapes générales
pour collecter et comparer des mesures fiables des performances de l'agent.

### Décidez de ce que vous voulez mesurer {#decide-what-you-want-to-measure}

Différents utilisateurs de votre application peuvent remarquer différents
aspects de l'impact de l'agent. Par exemple, alors que les utilisateurs finaux
peuvent remarquer une dégradation de la latence du service, les utilisateurs
intensifs avec de lourdes charges de travail accordent plus d'attention à la
surcharge du CPU. D'un autre côté, les utilisateurs qui déploient fréquemment,
par exemple en raison de charges de travail élastiques, se soucient davantage du
temps de démarrage.

Réduisez vos mesures aux facteurs qui ont un impact sur l'expérience
utilisateur, afin que vos ensembles de données ne contiennent pas d'informations
non pertinentes. Quelques exemples de mesures :

- Utilisation du CPU: moyenne par l'utilisateur, maximale par l'utilisateur et
  moyenne de l'ensemble de la machine
- Mémoire totale allouée et tas maximum utilisé
- Temps de pause de la collecte des déchets
- Temps de démarrage en millisecondes
- Latence de service moyenne et au 95e centile (p95)
- Débit moyen de lecture et d'écriture réseau

### Préparez un environnement de test approprié {#prepare-a-suitable-test-environment}

En mesurant l'impact de l'agent dans un environnement de test contrôlé, vous
pouvez mieux identifier les facteurs affectant les performances. Lors de la
préparation d'un environnement de test, procédez comme suit :

1.  Assurez-vous que la configuration de l'environnement de test ressemble à la
    production.
2.  Isolez l'application testée des autres services qui pourraient interférer.
3.  Désactivez ou supprimez tous les services système inutiles sur l'hôte de
    l'application.
4.  Assurez-vous que l'application dispose de suffisamment de ressources système
    pour gérer la charge de travail de test.

### Créez une batterie de tests réalistes {#create-a-battery-of-realistic-tests}

Concevez les tests que vous exécuterez sur l'environnement de test pour qu'ils
ressemblent autant que possible aux charges de travail nominales. Par exemple,
si certains points de terminaison de l'API REST de votre service sont
susceptibles de recevoir des volumes de requêtes élevés, créez un test qui
simule un trafic réseau intense.

Pour les applications Java, utilisez une phase d'échauffement avant de commencer
les mesures. La JVM est une machine très dynamique qui effectue un grand nombre
d'optimisations grâce à la compilation juste-à-temps (JIT). La phase
d'échauffement aide l'application à terminer la plupart de ses chargements de
classes et donne au compilateur JIT le temps d'exécuter la majorité des
optimisations.

Assurez-vous d'exécuter un grand nombre de requêtes et de répéter le passage de
test plusieurs fois. Cette répétition aide à garantir un échantillon de données
représentatif. Incluez des scénarios d'erreur dans vos données de test. Simulez
un taux d'erreur similaire à celui d'une charge de travail normale, généralement
entre 2 % et 10 %.

{{% alert title="Note" %}}

Les tests peuvent augmenter les coûts lorsqu'ils ciblent des backends
d'observabilité et d'autres services commerciaux. Planifiez vos tests en
conséquence ou envisagez d'utiliser des solutions alternatives, telles que des
backends auto-hébergés ou exécutés localement.

{{% /alert %}}

### Collectez des mesures comparables {#collect-comparable-measurements}

Pour identifier les facteurs qui pourraient affecter les performances et causer
une surconsommation de ressources de l'agent, collectez des mesures dans le même
environnement après avoir modifié un seul facteur ou une seule condition.

### Analysez les données de consommation de l'agent {#analyze-the-agent-overhead-data}

Après avoir collecté des données de plusieurs passages, vous pouvez tracer les
résultats dans un graphique ou comparer les moyennes en utilisant des tests
statistiques pour vérifier les différences significatives.

Considérez que différentes piles, applications et environnements peuvent
entraîner des caractéristiques opérationnelles différentes et des résultats de
mesure de l'impact de l'agent différents.
