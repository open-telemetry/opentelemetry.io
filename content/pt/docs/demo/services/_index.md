---
title: Serviços
aliases: [service_table, service-table]
---

Para visualizar os fluxos de requisições, consulte o [Diagrama de Serviços](../architecture/).

| Serviço                               | Linguagem      | Descrição                                                                                                                          |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [accounting](accounting/)             | .NET          | Processa pedidos recebidos e conta a soma de todos os pedidos (simulado/).                                                                   |
| [ad](ad/)                             | Java          | Fornece anúncios de texto baseados em palavras-chave de contexto fornecidas.                                                                                      |
| [cart](cart/)                         | .NET          | Armazena os itens no carrinho de compras do usuário no Valkey e os recupera.                                                             |
| [checkout](checkout/)                 | Go            | Recupera o carrinho do usuário, prepara o pedido e orquestra o pagamento, envio e a notificação por email.                               |
| [currency](currency/)                 | C++           | Converte um valor monetário para outra moeda. Usa valores reais obtidos do Banco Central Europeu. É o serviço com maior QPS.    |
| [email](email/)                       | Ruby          | Envia aos usuários um email de confirmação do pedido (simulado/).                                                                                     |
| [fraud-detection](fraud-detection/)   | Kotlin        | Analisa pedidos recebidos e detecta tentativas de fraude (simulado/).                                                                         |
| [frontend](frontend/)                 | TypeScript    | Expõe um servidor HTTP para servir o site. Não requer cadastro/login e gera IDs de sessão para todos os usuários automaticamente. |
| [load-generator](load-generator/)     | Python/Locust | Envia continuamente requisições imitando fluxos de compra realistas de usuários para o frontend.                                                 |
| [payment](payment/)                   | JavaScript    | Cobra as informações do cartão de crédito fornecido (simulado/) com o valor fornecido e retorna um ID de transação.                                       |
| [product-catalog](product-catalog/)   | Go            | Fornece a lista de produtos de um arquivo JSON e a capacidade de pesquisar produtos e obter produtos individuais.                           |
| [quote](quote/)                       | PHP           | Calcula os custos de envio, baseado no número de itens a serem enviados.                                                           |
| [recommendation](recommendation/)     | Python        | Recomenda outros produtos baseado no que está no carrinho.                                                                         |
| [shipping](shipping/)                 | Rust          | Fornece estimativas de custo de envio baseadas no carrinho de compras. Envia itens para o endereço fornecido (simulado/).                                  |
| [react-native-app](react-native-app/) | TypeScript    | Aplicativo móvel React Native que fornece uma interface sobre os serviços de compras.                                                  |
