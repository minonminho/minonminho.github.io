---
{
  "canonicalId": "arxiv:2203.02155",
  "version": "2203.02155v1",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2022-03-04",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, Ryan Lowe",
  "slug": "instructgpt-human-feedback",
  "title": { "en": "Training Language Models to Follow Instructions with Human Feedback", "ko": "사람 피드백으로 지시를 따르도록 언어 모델 학습하기" },
  "dek": { "en": "InstructGPT uses demonstrations, preference rankings, and reinforcement learning to make a model more helpful on the authors’ prompt distribution.", "ko": "InstructGPT는 시연 답변, 선호도 순위, 강화학습을 사용해 저자들이 수집한 프롬프트 분포에서 모델의 유용성을 높입니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/2203.02155/assets/InstructGPT_Diagram3.1.png",
    "alt": { "en": "Three-stage InstructGPT process: supervised demonstrations, preference-based reward modeling, then PPO fine-tuning.", "ko": "시연 데이터 지도 학습, 선호도 보상 모델, PPO 미세 조정으로 이어지는 InstructGPT 3단계 절차." },
    "caption": { "en": "Human demonstrations teach a starting behavior; rankings train a reward model; PPO optimizes the policy against that reward.", "ko": "사람의 시연으로 초기 동작을 가르치고, 선호 순위로 보상 모델을 학습한 뒤 PPO로 정책을 최적화합니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Next-token prediction does not directly teach a model to follow a user’s intent.
- **Core idea:** InstructGPT studies a three-stage training recipe: supervised fine-tuning on human demonstrations, reward-model training from human rankings, and reinforcement learning from human feedback using PPO.
- **Why it matters:** InstructGPT uses demonstrations, preference rankings, and reinforcement learning to make a model more helpful on the authors’ prompt distribution.

## Research Problem

Next-token prediction does not directly teach a model to follow a user’s intent.

## Key Contributions

InstructGPT studies a three-stage training recipe: supervised fine-tuning on human demonstrations, reward-model training from human rankings, and reinforcement learning from human feedback using PPO. The target is the preferences represented by the collected labelers and prompts, not a universal definition of human values.

## Method Overview

The authors collect demonstrations and pairwise output comparisons, train a reward model to predict preference, then optimize the language model against that reward. They test 1.3B, 6B, and 175B models on prompts from the OpenAI API distribution.

## Key Results

In human evaluations, outputs from the 1.3B InstructGPT model were preferred to outputs from the 175B GPT-3 baseline on that test distribution. The paper also reports improved truthfulness and reduced toxic output, with small regressions on some public NLP benchmarks.

## Limitations & Implications

Human feedback is shaped by the prompt sample, labeler population, rubric, and trade-offs encoded in the reward model. The paper explicitly notes that InstructGPT still makes simple mistakes and that its alignment target reflects a specific group. For deployment, monitor disagreement, reward hacking, distribution shift, and regressions in capabilities outside preference ratings.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| RLHF | Fine-tuning a model using reward signals learned from human preferences. | It is the final optimization stage in the paper’s recipe. |

## References

- [Original paper, arXiv:2203.02155](https://arxiv.org/abs/2203.02155) · first submitted 4 March 2022.
- Figure 2 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 다음 토큰을 맞히는 학습만으로 사용자의 의도를 잘 따른다고 보장할 수는 없습니다.
- **핵심 아이디어:** InstructGPT는 세 단계 학습법을 살펴봅니다.
- **중요성:** InstructGPT는 시연 답변, 선호도 순위, 강화학습을 사용해 저자들이 수집한 프롬프트 분포에서 모델의 유용성을 높입니다.

## 연구 문제

다음 토큰을 맞히는 학습만으로 사용자의 의도를 잘 따른다고 보장할 수는 없습니다.

## 핵심 기여

InstructGPT는 세 단계 학습법을 살펴봅니다. 사람이 쓴 시연 답변으로 지도 미세 조정을 하고, 사람의 출력 선호 순위로 보상 모델을 만든 뒤, 사람 피드백 기반 강화학습(RLHF)과 PPO로 언어 모델을 최적화합니다. 목표는 수집한 라벨러와 프롬프트에 반영된 선호이며 보편적 가치의 정의는 아닙니다.

## 방법론 개요

저자들은 시연 답변과 출력 쌍 비교를 모아 선호도를 예측하는 보상 모델을 학습하고, 그 보상을 높이도록 언어 모델을 조정합니다. OpenAI API 프롬프트 분포에서 13억, 60억, 1,750억 파라미터 모델을 비교했습니다.

## 주요 실험 결과

사람 평가에서 13억 InstructGPT 출력은 해당 테스트 분포의 1,750억 GPT-3 출력보다 선호됐습니다. 논문은 진실성 향상과 유해 출력 감소, 일부 공개 NLP 벤치마크에서 작은 성능 저하도 보고합니다.

## 한계와 시사점

사람 피드백은 프롬프트 표본, 라벨러 집단, 평가 기준, 보상 모델에 담긴 절충을 반영합니다. 논문도 InstructGPT가 여전히 단순한 실수를 하며 특정 집단의 선호를 목표로 삼는다고 밝힙니다. 배포 시 평가자 간 불일치, 보상 해킹, 분포 변화, 선호 평가 밖의 능력 저하를 계속 살펴야 합니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| RLHF | 사람의 선호에서 학습한 보상 신호로 모델을 미세 조정하는 방법입니다. | 논문의 학습 절차에서 마지막 최적화 단계입니다. |

## 참고 자료

- [논문 원문, arXiv:2203.02155](https://arxiv.org/abs/2203.02155) · 2022년 3월 4일 최초 제출.
- Figure 2는 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
