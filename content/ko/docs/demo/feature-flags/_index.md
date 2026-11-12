---
title: 피처 플래그
aliases:
  - feature_flags
  - scenarios
  - services/feature-flag
  - services/featureflagservice
default_lang_commit: cf0b6444239b5245ca21f9d34ceeb3996241decb
cSpell:ignore: loadgenerator OLJCESPC7Z
---

데모는 다양한 시나리오를 시뮬레이션하는 데 사용할 수 있는 여러 피처
플래그(feature flag)를 제공한다. 이 플래그는
[오픈피처(OpenFeature)](https://openfeature.dev)를 지원하는 간단한 피처 플래그
서비스인 [`flagd`](https://flagd.dev)로 관리한다.

데모 실행 중 <http://localhost:8080/feature>에서 제공하는 사용자 인터페이스를
통해 플래그 값을 변경할 수 있다. 이 사용자 인터페이스에서 값을 변경하면 flagd
서비스에 반영된다.

사용자 인터페이스를 통해 피처 플래그를 변경하는 방법에는 두 가지가 있다.

- **기본 보기**: 각 피처 플래그에 기본으로 적용할 선택 항목(default variant)을
  손쉽게 선택하고 저장할 수 있는 화면이다. 여기서 선택하는 항목은 설정 파일을
  직접 편집할 때 변경하는 옵션과 같다. 현재 기본 보기에서는 비율 기반
  타기팅(fractional targeting)을 지원하지 않는다.

- **고급 보기**: JSON 형식의 원본 설정 파일을 불러와 브라우저에서 편집할 수 있는
  화면이다. 이 화면은 원본 JSON 파일을 직접 편집할 때 얻을 수 있는 유연성을
  제공한다. 동시에 스키마 검사 기능도 제공하여 JSON이 유효한지, 입력한 설정값이
  올바른지 확인한다.

## 구현된 피처 플래그 {#implemented-feature-flags}

| 피처 플래그                    | 서비스               | 설명                                                                                                                                                                                                    |
| ------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adFailure`                    | 광고                 | `GetAds` 호출의 10%에서 오류를 발생시킨다.                                                                                                                                                              |
| `adHighCpu`                    | 광고                 | 광고 서비스에 높은 CPU 부하를 발생시킨다. CPU 스로틀링을 시연하려면 CPU 리소스 제한을 설정한다.                                                                                                         |
| `adManualGc`                   | 광고                 | 광고 서비스에서 전체 가비지 컬렉션을 수동으로 실행한다.                                                                                                                                                 |
| `aiRunawayAgent`               | 에이전트             | 에이전트가 작업을 마치는 대신 도구를 계속 호출하도록 유도하여, 폭주하거나 루프에 빠진 에이전트를 시뮬레이션한다.                                                                                        |
| `aiSlowResponse`               | 에이전트             | 에이전트의 LLM 모델 호출을 지연시켜 LLM 제공자의 응답 지연 증가를 시뮬레이션한다.                                                                                                                       |
| `cartFailure`                  | 장바구니             | 선택한 비율의 `EmptyCart` 호출을 장애가 발생하는 장바구니 저장소로 보낸다.                                                                                                                              |
| `emailMemoryLeak`              | 이메일               | `email` 서비스의 메모리 누수를 시뮬레이션한다. 선택 항목에 따라 각 확인 이메일 본문에 추가되는 데이터의 양을 설정한다.                                                                                  |
| `failedReadinessProbe`         | 장바구니             | 준비성(readiness) 프로브가 비정상 상태로 실패하도록 강제하여 파드의 "NotReady" 상태를 시뮬레이션한다. 쿠버네티스 배포에만 적용된다.                                                                     |
| `imageSlowLoad`                | 프론트엔드           | Envoy 장애 주입을 사용하여 프론트엔드에서 상품 이미지 로딩을 지연시킨다. 선택 항목에 따라 지연 시간을 설정한다.                                                                                         |
| `intlShippingSlowdown`         | 배송                 | 미국 외 지역의 배송 요청을 선택한 시간(초)만큼 지연시켜 해외 배송의 지연을 시뮬레이션한다. 미국 주소는 영향을 받지 않는다.                                                                              |
| `kafkaConsumerDead`            | 사기 탐지            | 사기 탐지 서비스가 주문 컨슈머 그룹에서 이탈한다(구독을 해제하고 폴링을 중지한다). 주문 처리 서비스는 계속 메시지를 생성하므로 컨슈머 그룹이 비고 랙(lag)이 누적된다. 플래그를 전환하여 되돌릴 수 있다. |
| `kafkaQueueProblems`           | 주문 처리, 사기 탐지 | 레코드마다 N밀리초 동안 대기하여 사기 탐지 컨슈머를 제한한다. 컨슈머의 처리 속도가 프로듀서의 기록 속도보다 느려져 랙이 증가한다. 플래그에서 레코드별 지연 시간을 실시간으로 조정한다.                  |
| `loadGeneratorTraffic`         | 부하 생성기          | 부하 생성기의 합성 트래픽을 활성화한다. 비활성화하면 모든 부하 생성기 시나리오가 일시 중지된다.                                                                                                         |
| `loadGeneratorVUs`             | 부하 생성기          | 부하 생성기의 HTTP 시나리오를 실행하는 동시 가상 사용자 수이다. 값을 변경하면 다음 폴링 시 k6가 재시작된다.                                                                                             |
| `paymentFailure`               | 결제                 | 선택한 비율의 `charge` 호출에서 오류를 발생시킨다.                                                                                                                                                      |
| `paymentUnreachable`           | 주문 처리            | 결제 서비스를 호출할 때 잘못된 주소를 사용하여 결제 서비스를 사용할 수 없는 것처럼 보이게 한다.                                                                                                         |
| `productCatalogFailure`        | 상품 카탈로그        | 상품 ID가 `OLJCESPC7Z`인 `GetProduct` 요청에서 오류를 발생시킨다.                                                                                                                                       |
| `productCatalogLockContention` | 상품 카탈로그        | `catalog.products` 테이블에 `ACCESS EXCLUSIVE` 잠금을 유지하고 다른 상품 카탈로그 쿼리를 차단함으로써 데이터베이스 잠금 경합을 시뮬레이션한다.                                                          |
| `recommendationCacheFailure`   | 추천                 | 기하급수적으로 증가하는 캐시로 인한 메모리 누수를 발생시킨다. 대략 절반의 요청이 캐시 증가를 유발한다.                                                                                                  |

## 단계별 디버깅 시나리오 {#guided-debugging-scenario}

`recommendationCacheFailure` 시나리오에는 오픈텔레메트리(OpenTelemetry)로 메모리
누수를 디버깅하는 방법을 이해하는 데 도움이 되는
[단계별 안내 문서](recommendation-cache/)가 있다.

## 피처 플래그 아키텍처 {#feature-flag-architecture}

flagd의 동작 방식에 대한 자세한 내용은 [flagd 문서](https://flagd.dev)를
참고한다. 오픈피처의 동작 방식에 대한 자세한 내용과 오픈피처 API 문서는
[오픈피처](https://openfeature.dev) 웹사이트를 참고한다.
