---
{
  "canonicalId": "arxiv:2005.14165",
  "version": "2005.14165v4",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2020-05-28",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Sigler, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei",
  "slug": "language-models-few-shot-learners",
  "title": { "en": "Language Models are Few-Shot Learners", "ko": "언어 모델은 Few-shot 학습자다" },
  "dek": { "en": "GPT-3 showed that scaling an autoregressive model could improve task performance from examples placed directly in the prompt, without gradient updates.", "ko": "GPT-3는 프롬프트에 예시를 넣는 것만으로, 가중치 업데이트 없이 과제를 수행하는 능력이 모델 규모에 따라 커질 수 있음을 보였습니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/2005.14165/assets/figures/metalearning.png",
    "alt": { "en": "The paper’s meta-learning diagram: broad pre-training supports rapid in-context adaptation at inference.", "ko": "대규모 사전 학습이 추론 시 문맥 내 빠른 적응을 돕는다는 논문의 메타 학습 그림." },
    "caption": { "en": "In-context examples act as task demonstrations inside the forward pass; model parameters are not updated for each task.", "ko": "문맥 안의 예시가 순전파 중 과제 시연 역할을 하며, 과제마다 모델 파라미터를 갱신하지 않습니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** The paper studies in-context learning: give a language model a task description and a few demonstrations, then ask it to continue the pattern.
- **Core idea:** GPT-3 is a 175-billion-parameter autoregressive Transformer.
- **Why it matters:** GPT-3 showed that scaling an autoregressive model could improve task performance from examples placed directly in the prompt, without gradient updates.

## Research Problem

The paper studies in-context learning: give a language model a task description and a few demonstrations, then ask it to continue the pattern.

## Key Contributions

GPT-3 is a 175-billion-parameter autoregressive Transformer. At evaluation time, the authors change the prompt examples, not the model weights. The main claim is a scaling result: larger models become more capable in zero-shot, one-shot, and few-shot settings.

## Method Overview

GPT-3 was trained on a mixture of web, book, and reference text, with filtering and sampling choices intended to improve quality and reduce benchmark overlap.

## Key Results

The authors evaluate 42 benchmarks and compare zero-shot, one-shot, and few-shot prompts. Performance generally improves with scale, but the size of the gain differs substantially by task; few-shot does not dominate fine-tuning everywhere.

## Limitations & Implications

In-context learning is adaptation through the prompt, not evidence that the model updates its weights or forms a durable new skill. The paper reports weaknesses in arithmetic, calibration, and some datasets, and discusses possible contamination from web training data. A product should test prompt sensitivity and data leakage, and should not treat a convincing completion as proof of reasoning.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| In-context learning | A model uses examples inside the prompt to infer the task for the current response. | GPT-3’s central capability is measured without per-task gradient updates. |

## References

- [Original paper, arXiv:2005.14165](https://arxiv.org/abs/2005.14165) · first submitted 28 May 2020.
- Figure 1.1 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 이 논문은 과제 설명과 몇 개의 예시를 프롬프트에 넣어 모델이 패턴을 이어가게 하는 In-context learning을 다룹니다.
- **핵심 아이디어:** GPT-3는 1,750억 파라미터의 자기회귀 Transformer입니다.
- **중요성:** GPT-3는 프롬프트에 예시를 넣는 것만으로, 가중치 업데이트 없이 과제를 수행하는 능력이 모델 규모에 따라 커질 수 있음을 보였습니다.

## 연구 문제

이 논문은 과제 설명과 몇 개의 예시를 프롬프트에 넣어 모델이 패턴을 이어가게 하는 In-context learning을 다룹니다.

## 핵심 기여

GPT-3는 1,750억 파라미터의 자기회귀 Transformer입니다. 평가할 때 저자들은 모델 가중치가 아니라 프롬프트 예시를 바꿉니다. 핵심 주장은 모델 규모가 커질수록 Zero-shot, One-shot, Few-shot 성능이 향상된다는 점입니다.

## 방법론 개요

GPT-3는 웹·도서·참고 자료 텍스트를 섞어 학습했으며, 데이터 품질과 벤치마크 중복을 고려한 필터링·샘플링을 사용했습니다.

## 주요 실험 결과

저자들은 42개 벤치마크에서 세 가지 예시 설정을 비교했습니다. 성능은 대체로 모델 규모와 함께 올라가지만 과제별 차이가 크고, Few-shot이 모든 과제에서 미세 조정보다 좋은 것은 아닙니다.

## 한계와 시사점

In-context learning은 프롬프트를 통한 적응이지, 가중치가 갱신되거나 새로운 능력이 지속적으로 저장된다는 증거는 아닙니다. 논문은 산술, 확신도 조절, 일부 데이터셋에서의 약점을 보고하고 웹 학습 데이터에 평가 문제가 섞일 가능성도 논의합니다. 실제 제품에서는 프롬프트 민감성과 데이터 누출을 확인하고, 그럴듯한 답을 추론의 증거로 취급하지 않아야 합니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| In-context learning | 프롬프트 안의 예시로 현재 과제를 파악해 응답하는 방식입니다. | GPT-3의 중심 능력을 과제별 가중치 업데이트 없이 평가합니다. |

## 참고 자료

- [논문 원문, arXiv:2005.14165](https://arxiv.org/abs/2005.14165) · 2020년 5월 28일 최초 제출.
- Figure 1.1은 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
