---
title:
  Directrices de marketing de OpenTelemetry para organizaciones colaboradoras
linkTitle: Directrices de marketing
weight: 999
default_lang_commit: 0d2d9199b446cc9d208303533453e575603870ea
cSpell:ignore: devstats
---

OpenTelemetry (también conocido como OTel) es una colaboración entre usuarios
finales, proyectos OSS adyacentes y proveedores que, en última instancia, venden
productos y servicios basados ​​en datos o componentes de OTel. Al igual que
muchos proyectos orientados a estándares, los proveedores que colaboran en OTel
también compiten en el mercado, por lo que es importante establecer algunas
reglas básicas y expectativas sobre cómo las organizaciones participantes
interactúan y cómo comunican sobre OTel.

De hecho, el éxito de OTel depende tanto de la realidad como de la percepción de
una colaboración sincera entre las diversas partes (y proveedores) involucradas.
Se está realizando un excelente trabajo técnico en OTel, y queremos asegurarnos
de que no se vea eclipsado por algún departamento oportunista de marketing.

Este documento se divide en dos secciones:

- **Objetivos y directrices:** ¿Qué buscamos lograr? ¿Cuál es nuestra
  orientación?
- **Inquietudes y consecuencias:** ¿Cómo determinamos si se ha infringido una
  directriz? ¿Y qué hacemos al respecto?

## Objetivos y directrices {#goals-and-guidelines}

Estos objetivos y directrices se centran en tres áreas de alto nivel.

### I: OpenTelemetry es un esfuerzo conjunto {#i-open-telemetry-is-a-joint-effort}

- Consejos:
  - Usar materiales del proyecto, como el logotipo y el nombre, en consonancia
    con la imagen de marca de la Linux Foundation y
    [las directrices de uso de la marca registrada](https://www.linuxfoundation.org/legal/trademark-usage)
  - Enfatizar que OTel no sería posible sin las contribuciones de muchos
    colaboradores que trabajan para proveedores de la competencia
  - Citar los nombres de otros colaboradores y proveedores involucrados en las
    iniciativas de OTel
  - Enfatizar nuestros objetivos comunes como comunidad para mejorar las
    experiencias de los usuarios finales/desarrolladores y empoderarlos
- Qué no hacer:
  - Dar a entender que un único proveedor es responsable de OTel o de alguno de
    sus componentes.
  - Menospreciar las contribuciones de otra organización o persona.

### II: No es una competición {#ii-its-not-a-competition}

- Consejos:
  - Enfatizar que todas las contribuciones son valiosas y que son de diversas
    formas y tamaños, incluyendo:
  - Contribuciones al código principal del proyecto o a los SDK para lenguajes o
    frameworks específicos
  - Crear y compartir recursos educativos (videos, talleres, artículos) o
    recursos compartidos que puedan usarse con fines educativos (por ejemplo,
    una aplicación de ejemplo que use un lenguaje o framework específico)
  - Actividades para fomentar la comunidad, como organizar un evento o un grupo
    de comunidad
  - Reconocer y agradecer públicamente a otras organizaciones por sus
    contribuciones a OTel
- Qué no hacer:
  - Comparar directamente el volumen o el valor de los diferentes contribuidores
    a OTel (por ejemplo, a través de [CNCF devstats](https://devstats.cncf.io/))
  - Insinuar que quienes contribuyen poco o con poca frecuencia a OTel son
    necesariamente ciudadanos de segunda clase, y/o que, por ello, su propia
    compatibilidad con OTel debería cuestionarse como resultado (de hecho, no
    hay razón para que un proveedor deba contribuir a OTel para apoyarlo)

### III: Promover la concienciación sobre la interoperabilidad y modularización de OTel {#iii-promote-awareness-of-otel-interoperability-and-modularization}

- Consejos:
  - Dar a conocer la compatibilidad con OTel: cuanto mejor comprendan los
    usuarios finales lo que pueden hacer con los datos de OTel, mejor.
  - Enfatizar la neutralidad del proveedor y la portabilidad de cualquier
    integración con OTel.
- Qué no hacer:
  - Insinuar que un usuario final no está "usando OTel" a menos que utilice un
    conjunto específico de componentes dentro de OTel (OTel es un proyecto
    "amplio" con muchos componentes desacoplados).
  - Denigrar públicamente el soporte de OTel de otro proveedor, especialmente
    sin pruebas objetivas.

## Inquietudes y consecuencias {#concerns-and-consequences}

Inevitablemente, habrá casos en los que los proveedores (o al menos sus
departamentos de Marketing) incumplan estas directrices. Hasta la fecha, esto no
ha sucedido con frecuencia, por lo que no queremos complicar demasiado el
proceso para gestionar estas inquietudes.

Así es como gestionamos estas circunstancias:

1. Quien detecte contenido público (de marketing) relevante debe escribir un
   correo electrónico a <cncf-opentelemetry-governance@lists.cncf.io> e incluir
   una explicación de por qué el contenido es problemático, idealmente haciendo
   referencia a las
   [directrices relevantes mencionadas anteriormente](#goals-and-guidelines).
2. El Comité de Gobernanza de OTel (CG) analizará el caso durante su próxima
   reunión (semanal) o, de ser posible, de forma asíncrona por correo
   electrónico. El CG de OTel garantiza una respuesta por correo electrónico
   **en un plazo de dos semanas** tras el informe inicial.
3. Si el GC considera que existe un problema, recomendará una medida correctiva
   al autor del contenido en cuestión y solicitará que la organización que
   publicó el contenido capacite a los empleados pertinentes sobre el contenido
   de este documento como medida preventiva adicional.

Si se observa un patrón de comportamiento recurrente con un proveedor en
particular, el GC se reunirá para discutir consecuencias más significativas, por
ejemplo, eliminar el nombre de ese proveedor de las listas de proveedores
compatibles que mantiene OTel o simplemente documentar públicamente el patrón de
comportamiento inapropiado en la comunidad.
