---
title: 수동 스팬 속성
aliases: [manual_span_attributes, ../manual-span-attributes]
default_lang_commit: 3735e2ce87957c968083ea53aa8eb0d50f4c3fbe
cSpell:ignore: enduser
---

이 페이지는 데모 전반에서 수동으로 설정하는 스팬 속성을 나열한다.

## 광고 {#ad}

| 이름                         | 자료형 | 설명                                |
| ---------------------------- | ------ | ----------------------------------- |
| `demo.ad.context_keys`       | string | 광고 타기팅에 사용되는 컨텍스트 키  |
| `demo.ad.context_keys.count` | number | 컨텍스트 키 수                      |
| `demo.ad.count`              | number | 제공된 광고 수                      |
| `demo.ad.request_type`       | string | 광고 요청 유형                      |
| `demo.ad.response_type`      | string | 광고 응답 유형                      |
| `demo.ad.category`           | string | 광고 카테고리                       |
| `session.id`                 | string | 세션의 고유 식별자                  |
| `enduser.id`                 | string | 시스템 내 최종 사용자의 고유 식별자 |

## 장바구니 {#cart}

| 이름                    | 자료형 | 설명                    |
| ----------------------- | ------ | ----------------------- |
| `user.id`               | string | 사용자 식별자           |
| `demo.product.id`       | string | 상품 식별자             |
| `demo.product.quantity` | number | 상품 수량               |
| `demo.cart.items.count` | number | 장바구니에 담긴 상품 수 |

## 주문 처리 {#checkout}

| 이름                                   | 자료형  | 설명                                                                  |
| -------------------------------------- | ------- | --------------------------------------------------------------------- |
| `demo.cart.items.count`                | number  | 장바구니에 담긴 총 상품 수                                            |
| `demo.order.amount`                    | number  | 주문 금액                                                             |
| `demo.order.id`                        | string  | 주문 ID                                                               |
| `demo.order.items.count`               | number  | 주문에 포함된 서로 다른 상품 수                                       |
| `user_agent.synthetic.type`            | string  | `test`와 같은 합성 트래픽의 범주                                      |
| `demo.payment.card_cvv`                | number  | 카드 CVV. `emitRawPii` 피처 플래그가 활성화된 경우에만 해당한다.      |
| `demo.payment.card_number`             | string  | 카드 번호. `emitRawPii` 피처 플래그가 활성화된 경우에만 해당한다.     |
| `demo.payment.transaction.id`          | string  | 결제 거래 ID                                                          |
| `demo.shipping.amount`                 | number  | 배송 금액                                                             |
| `demo.shipping.tracking.id`            | string  | 배송 추적 ID                                                          |
| `demo.user_context.selected_currency`  | string  | 사용자 통화                                                           |
| `messaging.kafka.producer.duration_ms` | number  | 카프카(Kafka) 프로듀서의 확인 응답을 받는 데 걸린 시간(밀리초)        |
| `messaging.kafka.producer.success`     | boolean | 메시지가 카프카에 성공적으로 기록되었는지 여부                        |
| `user.email`                           | string  | 사용자 이메일. `emitRawPii` 피처 플래그가 활성화된 경우에만 해당한다. |
| `user.id`                              | string  | 사용자 ID                                                             |

## 통화 {#currency}

| 이름                 | 자료형 | 설명              |
| -------------------- | ------ | ----------------- |
| `demo.exchange.from` | string | 변환 전 통화 코드 |
| `demo.exchange.to`   | string | 변환 후 통화 코드 |

## 이메일 {#email}

| 이름            | 자료형 | 설명        |
| --------------- | ------ | ----------- |
| `demo.order.id` | string | 주문 식별자 |

## 프론트엔드 {#frontend}

| 이름                     | 자료형 | 설명                                |
| ------------------------ | ------ | ----------------------------------- |
| `demo.synthetic_request` | string | 요청이 합성/테스트 트래픽인지 여부  |
| `session.id`             | string | 세션의 고유 식별자                  |
| `enduser.id`             | string | 시스템 내 최종 사용자의 고유 식별자 |

## 부하 생성기 {#load-generator}

| 이름                       | 자료형 | 설명                                 |
| -------------------------- | ------ | ------------------------------------ |
| `session.id`               | string | 세션의 고유 식별자                   |
| `demo.synthetic_request`   | string | 요청이 합성/테스트 트래픽인지 여부   |
| `user.id`                  | string | 사용자 식별자                        |
| `demo.request.flood.count` | number | 대량 요청 시 반복해서 전송한 요청 수 |
| `demo.product.id`          | string | 상품 식별자                          |
| `demo.product.quantity`    | number | 상품 수량                            |
| `demo.ad.category`         | string | 광고 카테고리                        |
| `demo.cart.items.count`    | number | 장바구니에 담긴 상품 수              |
| `gen_ai.input.messages`    | string | 모델에 입력으로 제공된 채팅 기록     |

## 결제 {#payment}

| 이름                              | 자료형  | 설명                                |
| --------------------------------- | ------- | ----------------------------------- |
| `user_agent.synthetic.type`       | string  | `test`와 같은 합성 트래픽의 범주    |
| `enduser.id`                      | string  | 시스템 내 최종 사용자의 고유 식별자 |
| `demo.user_context.loyalty_level` | string  | 고객 충성도 수준                    |
| `demo.payment.card_type`          | string  | 신용 카드 유형                      |
| `demo.payment.card_valid`         | boolean | 카드 유효성 검사 상태               |
| `demo.payment.card_number`        | string  | 신용 카드 번호                      |
| `demo.payment.card_cvv`           | number  | 신용 카드 CVV                       |
| `demo.payment.charged`            | boolean | 결제가 성공적으로 청구되었는지 여부 |
| `demo.payment.amount`             | string  | 결제 금액                           |

## 상품 카탈로그 {#product-catalog}

| 이름                        | 자료형 | 설명                   |
| --------------------------- | ------ | ---------------------- |
| `demo.product.count`        | number | 이용 가능한 총 상품 수 |
| `demo.product.id`           | string | 상품 식별자            |
| `demo.product.name`         | string | 상품 이름              |
| `demo.product.search.count` | number | 검색 결과 수           |

## 견적 {#quote}

| 이름                              | 자료형 | 설명                  |
| --------------------------------- | ------ | --------------------- |
| `demo.shipping.quote.items_count` | number | 견적에 포함된 상품 수 |
| `demo.shipping.quote.cost.total`  | number | 총 견적 비용          |

## 추천 {#recommendation}

| 이름                                     | 자료형   | 설명                            |
| ---------------------------------------- | -------- | ------------------------------- |
| `demo.product.recommended.count`         | number   | 추천된 상품 수                  |
| `demo.feature_flag.recommendation_cache` | boolean  | 추천 캐싱이 활성화되었는지 여부 |
| `demo.recommendation.cache_hit`          | boolean  | 추천 캐시에 적중했는지 여부     |
| `demo.product.count`                     | number   | 이용 가능한 총 상품 수          |
| `demo.product.filtered.count`            | number   | 필터링 후 상품 수               |
| `demo.product.filtered.list`             | string[] | 필터링된 상품 ID 목록           |

## 배송 {#shipping}

| 이름                       | 자료형 | 설명         |
| -------------------------- | ------ | ------------ |
| `demo.shipping.cost.total` | string | 총 배송 비용 |
