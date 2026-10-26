---
{
  "canonicalId": "arxiv:1512.03385",
  "version": "1512.03385v1",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2015-12-10",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun",
  "slug": "deep-residual-learning",
  "title": { "en": "Deep Residual Learning for Image Recognition", "ko": "이미지 인식을 위한 심층 잔차 학습" },
  "dek": { "en": "ResNet makes very deep networks easier to optimize by asking stacked layers to learn a correction to their input.", "ko": "ResNet은 층이 입력 자체가 아니라 입력에 더할 보정값을 학습하게 해, 매우 깊은 네트워크의 최적화를 돕습니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/1512.03385/assets/figure2.png",
    "alt": { "en": "Residual block diagram from the authors’ paper, with an identity shortcut added to a learned residual mapping.", "ko": "학습된 잔차 함수에 항등 지름길 연결을 더하는 논문 속 잔차 블록 구조." },
    "caption": { "en": "The shortcut carries x forward while stacked layers learn F(x), producing F(x) + x.", "ko": "지름길이 x를 전달하고 층들이 F(x)를 학습해 F(x) + x를 만듭니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Simply adding more layers had begun to hurt training accuracy as well as test accuracy.
- **Core idea:** The paper calls this the degradation problem and distinguishes it from ordinary overfitting.
- **Why it matters:** ResNet makes very deep networks easier to optimize by asking stacked layers to learn a correction to their input.

## Research Problem

Simply adding more layers had begun to hurt training accuracy as well as test accuracy.

## Key Contributions

The paper calls this the degradation problem and distinguishes it from ordinary overfitting. ResNet reformulates a block to learn a residual, F(x), and adds the block input through a shortcut: F(x) + x. If identity is the desired mapping, the layers can approach it by learning a small residual.

## Method Overview

Identity shortcuts add no parameters when the dimensions match; projection shortcuts handle dimension changes. The design allows networks to be stacked to 152 layers while remaining easier to optimize than the plain counterparts. The authors evaluate on ImageNet and CIFAR-10 and also use the representations in detection and localization systems.

## Key Results

An ensemble of residual networks achieved 3.57% ImageNet test error and won the ILSVRC 2015 classification task. On CIFAR-10, the paper studies networks with 100 and 1,000 layers. These results support the optimization value of the residual formulation in the reported setups; the headline ensemble score is not a single model result.

## Limitations & Implications

Residual connections do not make arbitrary depth free: compute, memory, normalization, initialization, and data still matter. The paper’s strongest results use carefully designed convolutional networks and benchmark-specific training. In a new system, compare a plain baseline and a residual version at matched compute rather than attributing every gain to skip connections alone.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Residual learning | A block learns the difference between its desired output and its input. | The shortcut makes identity-like behavior easier to represent and optimize. |

## References

- [Original paper, arXiv:1512.03385](https://arxiv.org/abs/1512.03385) · first submitted 10 December 2015.
- [Microsoft Research repository](https://github.com/KaimingHe/deep-residual-networks).
- Figure 2 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 층을 계속 쌓았을 때 테스트 정확도뿐 아니라 학습 정확도까지 나빠지는 현상이 나타났습니다.
- **핵심 아이디어:** 논문은 이를 단순한 과적합과 구분해 Degradation 문제라고 부릅니다.
- **중요성:** ResNet은 층이 입력 자체가 아니라 입력에 더할 보정값을 학습하게 해, 매우 깊은 네트워크의 최적화를 돕습니다.

## 연구 문제

층을 계속 쌓았을 때 테스트 정확도뿐 아니라 학습 정확도까지 나빠지는 현상이 나타났습니다.

## 핵심 기여

논문은 이를 단순한 과적합과 구분해 Degradation 문제라고 부릅니다. ResNet은 블록이 목표 출력 전체가 아니라 잔차 F(x)를 학습하고, 지름길 연결로 입력을 더해 F(x) + x를 만들도록 합니다. 항등 함수가 목표라면 작은 잔차를 학습하면 됩니다.

## 방법론 개요

입력과 출력 차원이 같으면 항등 지름길은 파라미터를 추가하지 않습니다. 차원이 바뀌는 경우에는 투영 지름길을 사용합니다. 이 설계로 저자들은 최적화가 더 쉬운 152층 네트워크를 구성하고 ImageNet, CIFAR-10, 객체 검출·위치 추정 작업에서 평가했습니다.

## 주요 실험 결과

잔차 네트워크 앙상블은 ImageNet 테스트 오류율 3.57%를 기록해 ILSVRC 2015 분류 대회에서 1위를 했습니다. CIFAR-10에서는 100층과 1,000층 모델도 조사했습니다. 이 결과는 해당 설정에서 잔차 구조의 최적화 효과를 뒷받침하지만, 대표 오류율은 단일 모델이 아니라 앙상블 결과입니다.

## 한계와 시사점

잔차 연결이 임의의 깊이를 공짜로 만들지는 않습니다. 계산량, 메모리, 정규화, 초기화, 데이터가 여전히 중요합니다. 논문의 대표 성과는 잘 설계된 합성곱 네트워크와 벤치마크별 학습에 기반합니다. 새 시스템에서는 계산량을 맞춘 plain 모델과 ResNet을 비교해 지름길 연결의 효과를 분리해야 합니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Residual learning | 블록이 입력과 목표 출력의 차이를 학습합니다. | 지름길 연결이 항등 동작을 표현하고 최적화하기 쉽게 합니다. |

## 참고 자료

- [논문 원문, arXiv:1512.03385](https://arxiv.org/abs/1512.03385) · 2015년 12월 10일 최초 제출.
- [Microsoft Research 공개 저장소](https://github.com/KaimingHe/deep-residual-networks).
- Figure 2는 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
