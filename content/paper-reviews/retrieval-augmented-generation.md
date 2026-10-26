---
{
  "canonicalId": "arxiv:2005.11401",
  "version": "2005.11401v4",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2020-05-22",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela",
  "slug": "retrieval-augmented-generation",
  "title": { "en": "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", "ko": "지식 집약형 NLP 과제를 위한 검색 증강 생성" },
  "dek": { "en": "RAG joins a retriever and a generator so an answer can depend on both model parameters and passages retrieved from an external index.", "ko": "RAG는 검색기와 생성기를 결합해 모델 파라미터에 저장된 지식과 외부 색인에서 찾은 문서를 함께 활용합니다." },
  "hero": {
    "url": "https://arxiv.org/html/2005.11401v4/posterior_plot.png",
    "alt": { "en": "The authors’ visualization of token-level document posteriors in RAG-Token.", "ko": "RAG-Token에서 생성 토큰별 문서 사후확률을 보여주는 저자 그림." },
    "caption": { "en": "Different retrieved passages can receive high probability for different generated tokens.", "ko": "생성하는 토큰에 따라 서로 다른 검색 문서가 높은 확률을 얻을 수 있습니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Parametric language models contain useful knowledge, but it is difficult to inspect, revise, or cite that knowledge.
- **Core idea:** RAG pairs a neural retriever with a sequence-to-sequence generator.
- **Why it matters:** RAG joins a retriever and a generator so an answer can depend on both model parameters and passages retrieved from an external index.

## Research Problem

Parametric language models contain useful knowledge, but it is difficult to inspect, revise, or cite that knowledge.

## Key Contributions

RAG pairs a neural retriever with a sequence-to-sequence generator. The retriever selects passages from a non-parametric index; the generator conditions on those passages and the user input. The index can be replaced without retraining the full generator.

## Method Overview

The paper uses a dense passage retriever and a BART generator over a 2018 Wikipedia index. It compares RAG-Sequence, which marginalizes over documents for a whole output, with RAG-Token, which can use different passages for different output tokens. Both components are fine-tuned together, while the document index is fixed.

## Key Results

RAG reached the then state of the art on Natural Questions, WebQuestions, and CuratedTrec. On generation tasks, human evaluations found outputs more specific and factual than a BART-only baseline. The paper also demonstrates index replacement as a way to update the external knowledge source.

## Limitations & Implications

The retriever can miss the needed passage, and the generator can misread or ignore retrieved evidence. The experiments use a particular Wikipedia dump, passage size, retriever, and generator; they do not guarantee reliable citations in every domain. In production, log retrieved passages, evaluate retrieval and answer quality separately, and make index freshness explicit.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Retrieval-augmented generation | Generation conditioned on passages retrieved for the current input. | It separates updateable external memory from the generator’s learned parameters. |

## References

- [Original paper, arXiv:2005.11401](https://arxiv.org/abs/2005.11401) · first submitted 22 May 2020.
- Figure 2 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 파라미터에 저장된 언어 모델 지식은 유용하지만 확인·수정·인용하기 어렵습니다.
- **핵심 아이디어:** RAG는 신경망 검색기와 시퀀스-투-시퀀스 생성기를 결합합니다.
- **중요성:** RAG는 검색기와 생성기를 결합해 모델 파라미터에 저장된 지식과 외부 색인에서 찾은 문서를 함께 활용합니다.

## 연구 문제

파라미터에 저장된 언어 모델 지식은 유용하지만 확인·수정·인용하기 어렵습니다.

## 핵심 기여

RAG는 신경망 검색기와 시퀀스-투-시퀀스 생성기를 결합합니다. 검색기가 비파라미터 색인에서 문단을 찾고, 생성기는 입력과 문단을 함께 참고합니다. 전체 생성기를 다시 학습하지 않고도 색인을 교체할 수 있습니다.

## 방법론 개요

논문은 Dense Passage Retriever와 BART 생성기를 2018년 Wikipedia 색인에 연결합니다. RAG-Sequence는 한 답변 전체에 대해 문서 후보를 합산하고, RAG-Token은 생성 토큰마다 다른 문서를 사용할 수 있습니다. 두 모델 구성요소는 함께 미세 조정하지만 문서 색인은 고정합니다.

## 주요 실험 결과

RAG는 Natural Questions, WebQuestions, CuratedTrec에서 당시 최고 성능을 기록했습니다. 생성 과제의 사람 평가에서는 BART 단독 기준 모델보다 더 구체적이고 사실에 가까운 결과가 나왔습니다. 외부 지식 색인을 바꿔 지식을 갱신하는 방법도 보여줍니다.

## 한계와 시사점

검색기가 필요한 문서를 놓칠 수 있고, 생성기가 찾은 근거를 잘못 읽거나 무시할 수도 있습니다. 실험은 특정 Wikipedia 덤프·문단 크기·검색기·생성기를 사용했으므로 모든 분야에서 신뢰할 수 있는 인용을 보장하지 않습니다. 실제 서비스에서는 검색 문서 로그를 남기고 검색 품질과 답변 품질을 따로 평가하며 색인의 최신성을 관리해야 합니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Retrieval-augmented generation | 현재 입력에 맞는 문단을 검색해 답변 생성에 함께 쓰는 방법입니다. | 외부에서 갱신 가능한 기억과 생성기 파라미터를 분리합니다. |

## 참고 자료

- [논문 원문, arXiv:2005.11401](https://arxiv.org/abs/2005.11401) · 2020년 5월 22일 최초 제출.
- Figure 2는 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
