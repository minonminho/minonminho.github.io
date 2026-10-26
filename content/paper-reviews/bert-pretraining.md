---
{
  "canonicalId": "arxiv:1810.04805",
  "version": "1810.04805v2",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2018-10-11",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova",
  "slug": "bert-pretraining",
  "title": { "en": "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", "ko": "BERT: 언어 이해를 위한 심층 양방향 Transformer 사전 학습" },
  "dek": { "en": "BERT trains a Transformer encoder to use both left and right context, then fine-tunes the same model for many language tasks.", "ko": "BERT는 Transformer 인코더가 왼쪽과 오른쪽 문맥을 함께 사용하도록 사전 학습하고, 같은 모델을 여러 언어 과제에 맞게 미세 조정합니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/1810.04805/assets/bert_pretraining_finetuning.png",
    "alt": { "en": "BERT pre-training and fine-tuning workflow from the original paper.", "ko": "원 논문에 실린 BERT 사전 학습 및 미세 조정 절차." },
    "caption": { "en": "The same bidirectional encoder initializes downstream tasks; each task adds a small output head and fine-tunes the model.", "ko": "같은 양방향 인코더로 여러 과제를 초기화하고, 과제별 출력층을 붙여 모델 전체를 미세 조정합니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Earlier language models commonly read text in one direction, limiting how each token could use its full context.
- **Core idea:** BERT uses a masked language modeling objective: selected tokens are hidden, and the model predicts them from both left and right context.
- **Why it matters:** BERT trains a Transformer encoder to use both left and right context, then fine-tunes the same model for many language tasks.

## Research Problem

Earlier language models commonly read text in one direction, limiting how each token could use its full context.

## Key Contributions

BERT uses a masked language modeling objective: selected tokens are hidden, and the model predicts them from both left and right context. A second objective, next sentence prediction, trains representations for sentence pairs. The result is a reusable encoder that can be fine-tuned for many tasks.

## Method Overview

The authors pre-train a deep bidirectional Transformer on BooksCorpus and English Wikipedia, then add a small task-specific output layer and fine-tune all parameters.

## Key Results

They report results across eleven NLP tasks, including GLUE, MultiNLI, and SQuAD. On the paper’s reported settings, BERT Base reached 80.5 GLUE and BERT Large reached 84.3; BERT Large reached 93.2 F1 on SQuAD 1.1.

## Limitations & Implications

The results depend on English pre-training data, the original task definitions, and substantial pre-training compute. BERT is an encoder for contextual representations; by itself it is not an autoregressive text generator. The paper’s two pre-training objectives are a historical design, not a claim that every later encoder needs both objectives.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Masked language modeling | Predict tokens hidden from an input sentence using the visible context. | It lets each representation use context from both directions. |

## References

- [Original paper, arXiv:1810.04805](https://arxiv.org/abs/1810.04805) · first submitted 11 October 2018.
- [Google Research BERT code and checkpoints](https://github.com/google-research/bert).
- Figure 1 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 기존 언어 모델은 흔히 한 방향으로 텍스트를 읽어 각 토큰이 활용할 수 있는 문맥이 제한됐습니다.
- **핵심 아이디어:** BERT는 Masked language modeling으로 일부 토큰을 가리고, 왼쪽과 오른쪽 문맥을 모두 사용해 이를 맞히도록 학습합니다.
- **중요성:** BERT는 Transformer 인코더가 왼쪽과 오른쪽 문맥을 함께 사용하도록 사전 학습하고, 같은 모델을 여러 언어 과제에 맞게 미세 조정합니다.

## 연구 문제

기존 언어 모델은 흔히 한 방향으로 텍스트를 읽어 각 토큰이 활용할 수 있는 문맥이 제한됐습니다.

## 핵심 기여

BERT는 Masked language modeling으로 일부 토큰을 가리고, 왼쪽과 오른쪽 문맥을 모두 사용해 이를 맞히도록 학습합니다. 문장 쌍 표현을 위한 Next sentence prediction도 함께 사용합니다. 이렇게 만든 인코더를 여러 과제에 재사용합니다.

## 방법론 개요

저자들은 BooksCorpus와 영어 Wikipedia로 심층 양방향 Transformer를 사전 학습한 뒤, 과제별 출력층을 더하고 모델 전체를 미세 조정했습니다.

## 주요 실험 결과

GLUE, MultiNLI, SQuAD를 포함한 11개 NLP 과제를 평가했습니다. 논문 설정에서 BERT Base의 GLUE는 80.5, BERT Large는 84.3이었고, BERT Large는 SQuAD 1.1에서 F1 93.2를 기록했습니다.

## 한계와 시사점

결과는 영어 사전 학습 데이터, 당시 과제 정의, 상당한 사전 학습 계산량에 기대고 있습니다. BERT는 문맥 표현을 만드는 인코더이며 그 자체가 다음 토큰을 이어 쓰는 생성 모델은 아닙니다. 두 사전 학습 목표는 당시 설계의 일부이지, 이후의 모든 인코더가 두 목표를 모두 써야 한다는 뜻은 아닙니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Masked language modeling | 입력에서 가린 토큰을 주변 문맥으로 맞히는 학습 방식입니다. | 양방향 문맥을 각 토큰 표현에 반영하게 합니다. |

## 참고 자료

- [논문 원문, arXiv:1810.04805](https://arxiv.org/abs/1810.04805) · 2018년 10월 11일 최초 제출.
- [Google Research BERT 코드와 체크포인트](https://github.com/google-research/bert).
- Figure 1은 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
