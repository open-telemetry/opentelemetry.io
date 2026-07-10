---
title: Servicios
aliases: [service_table, service-table]
default_lang_commit: 4d367048a304df51f35b33ca51cfb0d3703de230
---

Para visualizar los flujos de solicitudes, consulta el [Diagrama de
servicio].(../architecture/).

| Descripción del servicio                  | Lenguaje      |                                                                                                                                                         |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [contabilidad](accounting/)               | .NET          | Procesa los pedidos entrantes y calcula la suma de todos los pedidos (mock/).                                                                           |
| [ad](ad/)                                 | Java          | Proporciona anuncios de texto basado en un contexto determinado.                                                                                        |
| [carrito](cart/)                          | .NET          | Almacena los artículos en el carrito de compras del usuario en Valkey y los recupera.                                                                   |
| [salida](checkout/)                       | Go            | Recupera el carrito del usuario, prepara el pedido y gestiona el pago, el envío y la notificación por correo electrónico.                               |
| [divisa](currency/)                       | C++           | Convierte una cantidad de dinero a otra divisa. Utiliza valores reales obtenidos del Banco Central Europeo. Es el servicio con mayor número de QPS.     |
| [correo](email/)                          | Ruby          | Envía a los usuarios un correo electrónico de confirmación de pedido (mock/).                                                                           |
| [flagd-ui](flagd-ui/)                     | Elixir        | Permite activar y editar indicadores de funciones.                                                                                                      |
| [detección de fraude](fraud-detection/)   | Kotlin        | Analiza los pedidos entrantes y detecta intentos de fraude (mock/).                                                                                     |
| [frontend](frontend/)                     | TypeScript    | Expone un servidor HTTP para servir el sitio web. No requiere registrarse/iniciar sesión y genera ID de sesión para todos los usuarios automáticamente. |
| [generador de carga](load-generator/)     | Python/Locust | Envía continuamente solicitudes que imitan flujos de compra de usuarios reales al frontend.                                                             |
| [pago](payment/)                          | JavaScript    | Realiza un cargo a la información de la tarjeta de crédito proporcionada (mock/) con el importe especificado y devuelve un ID de transacción.           |
| [catálogo de productos](product-catalog/) | Go            | Proporciona la lista de productos desde un archivo JSON y la capacidad de buscar productos y obtener productos individuales.                            |
| [reseñas de productos](product-reviews/)  | Python        | Devuelve reseñas de productos y responde preguntas sobre un producto específico basándose en la descripción del producto y las reseñas.                 |
| [cita](quote/)                            | PHP           | Calcula los gastos de envío en función del número de artículos a enviar.                                                                                |
| [recomendación](recommendation/)          | Python        | Recomienda otros productos en función de los artículos que aparecen en el carrito.                                                                      |
| [envío](shipping/)                        | Rust          | Proporciona estimaciones de costos de envío basadas en el carrito de compras. Envía los artículos a la dirección indicada (mock/).                      |
| [react-native-app](react-native-app/)     | TypeScript    | Aplicación móvil React Native que proporciona una interfaz de usuario sobre los servicios de compra.                                                    |
