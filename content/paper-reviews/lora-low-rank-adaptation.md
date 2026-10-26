---
{
  "canonicalId": "arxiv:2106.09685",
  "version": "2106.09685v2",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2021-06-17",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen",
  "slug": "lora-low-rank-adaptation",
  "title": { "en": "LoRA: Low-Rank Adaptation of Large Language Models", "ko": "LoRA: 대규모 언어 모델의 저랭크 적응" },
  "dek": { "en": "LoRA freezes a pretrained model and learns a small low-rank update, reducing task-specific training and storage costs.", "ko": "LoRA는 사전 학습 모델을 고정하고 작은 저랭크 업데이트만 학습해 과제별 학습·저장 비용을 줄입니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/2106.09685/assets/figure1.png",
    "alt": { "en": "The paper’s LoRA reparameterization: two low-rank matrices represent the update to frozen weights.", "ko": "고정 가중치의 업데이트를 두 저랭크 행렬로 표현하는 논문의 LoRA 재매개화 그림." },
    "caption": { "en": "Only the low-rank matrices are trained; their update can be merged into the base weight matrix at deployment.", "ko": "저랭크 행렬만 학습하며, 배포 시 업데이트를 기본 가중치에 합칠 수 있습니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Full fine-tuning stores a complete copy of a large model for every task.
- **Core idea:** LoRA freezes the pretrained weights and represents a task-specific weight change as the product of two smaller matrices.
- **Why it matters:** LoRA freezes a pretrained model and learns a small low-rank update, reducing task-specific training and storage costs.

## Research Problem

Full fine-tuning stores a complete copy of a large model for every task.

## Key Contributions

LoRA freezes the pretrained weights and represents a task-specific weight change as the product of two smaller matrices. This is a form of parameter-efficient fine-tuning: the shared base stays fixed, while each task stores a compact update.

## Method Overview

For a pretrained matrix W, LoRA adds a low-rank update ΔW = B·A and trains A and B while keeping W frozen. The authors apply the update to Transformer projections, evaluate across RoBERTa, DeBERTa, GPT-2, and GPT-3, and show that chosen low ranks can match or exceed full fine-tuning on the reported tasks. For GPT-3 175B, the paper reports up to 10,000× fewer trainable parameters and 3× lower GPU memory use than full Adam fine-tuning.

## Key Results

At inference, the update can be merged into the frozen weight matrix, so the paper’s linear formulation adds no extra model depth. The savings depend on which matrices receive LoRA and on the chosen rank.

## Limitations & Implications

Low rank is an empirical assumption about useful updates, not a guarantee for every task or layer. The paper evaluates a set of architectures and datasets; it does not establish one rank or target-module recipe for all models. Measure adapter quality, memory, optimizer state, and serving behavior on the intended workload.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| LoRA | A low-rank trainable update applied while the pretrained model weights remain frozen. | It lets many task adapters share one large base model. |

## References

- [Original paper, arXiv:2106.09685](https://arxiv.org/abs/2106.09685) · first submitted 17 June 2021.
- [Microsoft LoRA implementation](https://github.com/microsoft/LoRA).
- Figure 1 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 전체 미세 조정은 과제마다 대형 모델 사본을 저장해야 합니다.
- **핵심 아이디어:** LoRA는 사전 학습 가중치를 고정하고, 과제별 가중치 변화를 두 개의 작은 행렬 곱으로 표현합니다.
- **중요성:** LoRA는 사전 학습 모델을 고정하고 작은 저랭크 업데이트만 학습해 과제별 학습·저장 비용을 줄입니다.

## 연구 문제

전체 미세 조정은 과제마다 대형 모델 사본을 저장해야 합니다.

## 핵심 기여

LoRA는 사전 학습 가중치를 고정하고, 과제별 가중치 변화를 두 개의 작은 행렬 곱으로 표현합니다. 즉, 공유 기본 모델은 그대로 두고 각 과제는 작은 업데이트만 보관하는 파라미터 효율적 미세 조정입니다.

## 방법론 개요

사전 학습 행렬 W에 저랭크 업데이트 ΔW = B·A를 더하고 A와 B만 학습합니다. 저자들은 Transformer 투영 행렬에 적용하고 RoBERTa, DeBERTa, GPT-2, GPT-3에서 평가했습니다. 보고된 과제들에서 적절한 랭크는 전체 미세 조정과 비슷하거나 더 나은 성능을 보였습니다. GPT-3 1,750억 파라미터를 Adam으로 미세 조정하는 설정과 비교해 학습 파라미터를 최대 10,000배 줄이고 GPU 메모리를 3배 낮췄다고 보고합니다.

## 주요 실험 결과

추론 시 업데이트를 기본 가중치 행렬에 합칠 수 있어, 논문의 선형 설계는 모델 깊이를 추가하지 않습니다. 절감량은 LoRA를 어느 행렬에 적용하는지와 랭크 선택에 따라 달라집니다.

## 한계와 시사점

저랭크 가정은 유용한 업데이트에 대한 경험적 가설이지 모든 과제·층에서 보장되는 규칙은 아닙니다. 논문은 일부 모델과 데이터셋을 평가했을 뿐, 모든 모델에 적용할 단일 랭크나 대상 모듈을 제시하지 않습니다. 실제 업무에서 어댑터 품질, 메모리, 옵티마이저 상태, 서빙 동작을 함께 측정해야 합니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| LoRA | 사전 학습 가중치를 고정한 채 저랭크 업데이트를 학습하는 방법입니다. | 여러 과제의 작은 어댑터가 하나의 대형 기본 모델을 공유하게 합니다. |

## 참고 자료

- [논문 원문, arXiv:2106.09685](https://arxiv.org/abs/2106.09685) · 2021년 6월 17일 최초 제출.
- [Microsoft LoRA 구현](https://github.com/microsoft/LoRA).
- Figure 1은 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
