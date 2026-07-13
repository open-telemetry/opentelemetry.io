---
title: Servicios
aliases: [service_table, service-table]
default_lang_commit: 4d367048a304df51f35b33ca51cfb0d3703de230
---

Para visualizar los flujos de peticiones, consulta el [Diagrama de
servicios].(../architecture/).

| Descripción del servicio              | Lenguaje      | Descripción                                                                                                                                                                |
| ------------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [accounting](accounting/)             | .NET          | Procesa los pedidos entrantes y calcula la suma de todos los pedidos (mock/).                                                                                              |
| [ad](ad/)                             | Java          | Proporciona anuncios de texto basado en un contexto determinado.                                                                                                           |
| [cart](cart/)                         | .NET          | Almacena los artículos en el carrito de compras del usuario en Valkey y los recupera.                                                                                      |
| [checkout](checkout/)                 | Go            | Recupera el carrito del usuario, prepara el pedido y gestiona el pago, el envío y la notificación por correo electrónico.                                                  |
| [currency](currency/)                 | C++           | Convierte una cantidad de dinero a otra divisa. Utiliza valores reales obtenidos del Banco Central Europeo. Es el servicio con mayor número de QPS _(queries per second)_. |
| [email](email/)                       | Ruby          | Envía a los usuarios un correo electrónico de confirmación del pedido (mock/).                                                                                             |
| [flagd-ui](flagd-ui/)                 | Elixir        | Permite conmutar y editar las flags de funcionalidad _(feature flags)_ .                                                                                                   |
| [fraud-detection](fraud-detection/)   | Kotlin        | Analiza los pedidos entrantes y detecta intentos de fraude (mock/).                                                                                                        |
| [frontend](frontend/)                 | TypeScript    | Expone un servidor HTTP para servir el sitio web. No requiere registro ni inicio de sesión y genera automáticamente IDs de sesión para todos los usuarios.                 |
| [load-generator](load-generator/)     | Python/Locust | Envía continuamente solicitudes que imitan flujos de compra de usuarios reales al frontend.                                                                                |
| [payment](payment/)                   | JavaScript    | Realiza el cargo en la tarjeta de crédito facilitada (mock/) por el importe especificado y devuelve un ID de transacción.                                                  |
| [product-catalog](product-catalog/)   | Go            | Proporciona la lista de productos a partir de un archivo JSON y la capacidad de buscar productos u obtener productos individuales.                                         |
| [product-reviews](product-reviews/)   | Python        | Devuelve reseñas de productos y responde preguntas sobre un producto específico, basándose en su descripción y en las reseñas.                                             |
| [quote](quote/)                       | PHP           | Calcula el coste de envío en función del número de artículos a enviar.                                                                                                     |
| [recommendation](recommendation/)     | Python        | Recomienda otros productos en función de los artículos que aparecen en el carrito.                                                                                         |
| [shipping](shipping/)                 | Rust          | Proporciona estimaciones de costes de envío basadas en el carrito de la compra. Envía los artículos a la dirección indicada (mock/).                                       |
| [react-native-app](react-native-app/) | TypeScript    | Aplicación móvil React Native que proporciona una interfaz de usuario sobre los servicios de compra.                                                                       |
