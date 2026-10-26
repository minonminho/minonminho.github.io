---
{
  "canonicalId": "arxiv:1706.03762",
  "version": "1706.03762v7",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2017-06-12",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin",
  "slug": "attention-is-all-you-need",
  "title": { "en": "Attention Is All You Need", "ko": "Attention Is All You Need: 어텐션만으로 충분하다" },
  "dek": { "en": "The Transformer removes recurrence from sequence transduction and makes global self-attention the main route for mixing information.", "ko": "Transformer는 순차 변환 모델에서 순환 구조를 없애고, 전역 Self-attention을 정보 결합의 중심에 둡니다." },
  "hero": {
    "url": "https://arxiv.org/html/1706.03762v7/Figures/ModalNet-21.png",
    "alt": { "en": "Original Transformer encoder-decoder architecture from Figure 1.", "ko": "논문 Figure 1의 Transformer 인코더-디코더 구조." },
    "caption": { "en": "The encoder and decoder are built from attention and position-wise feed-forward layers, with residual paths and positional information.", "ko": "인코더와 디코더는 어텐션 및 위치별 피드포워드 층으로 구성되며, 잔차 경로와 위치 정보를 사용합니다." },
    "license": "Figure 1; the arXiv HTML paper grants Google permission to reproduce figures in journalistic or scholarly works."
  }
}
---
<!-- locale: en -->



## TL;DR

- **Problem:** Before this paper, strong sequence-to-sequence systems commonly used recurrent networks, with attention added around them.
- **Core idea:** The Transformer asks whether attention can do the sequence mixing by itself.
- **Why it matters:** The Transformer removes recurrence from sequence transduction and makes global self-attention the main route for mixing information.

## Research Problem

Before this paper, strong sequence-to-sequence systems commonly used recurrent networks, with attention added around them.

## Key Contributions

The Transformer asks whether attention can do the sequence mixing by itself. It replaces step-by-step recurrence with parallel self-attention over the sequence, while retaining an encoder-decoder shape for translation.

## Method Overview

Each layer combines multi-head self-attention with a position-wise feed-forward network. The decoder adds masked self-attention and attention over encoder outputs. Since attention alone does not say which token came first, positional encodings are added to token embeddings. The scaled dot-product operation compares queries with keys, normalizes the weights, and uses them to mix values.

## Key Results

On WMT 2014, the base model reached 27.3 BLEU for English–German and 38.1 for English–French; the larger model reached 28.4 and 41.8 respectively. The paper also reports faster parallel training than the recurrent baselines and a successful constituency-parsing experiment.

## Limitations & Implications

The evidence is strongest for translation and the paper’s parsing experiment. Self-attention computes interactions across token pairs, so its memory and compute grow sharply with sequence length. Later long-context designs address that engineering cost; the original paper does not establish that dense attention is economical at arbitrary lengths.

### Terminology for Knowledge

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Transformer self-attention | A token builds its representation by weighting information from other tokens in the same sequence. | It replaces recurrence as the main mechanism for connecting distant positions. |

## References

- [Original paper, arXiv:1706.03762](https://arxiv.org/abs/1706.03762) · first submitted 12 June 2017.
- Figure 1 is linked from the authors’ arXiv HTML paper. The paper grants permission for figure reproduction in journalistic or scholarly works; attribution is retained here.

<!-- locale: ko -->



## 핵심 요약 (TL;DR)

- **문제:** 이 논문 이전의 강력한 시퀀스-투-시퀀스 시스템은 주로 순환 신경망에 어텐션을 더했습니다.
- **핵심 아이디어:** Transformer는 어텐션만으로 시퀀스 정보를 섞을 수 있는지 묻습니다.
- **중요성:** Transformer는 순차 변환 모델에서 순환 구조를 없애고, 전역 Self-attention을 정보 결합의 중심에 둡니다.

## 연구 문제

이 논문 이전의 강력한 시퀀스-투-시퀀스 시스템은 주로 순환 신경망에 어텐션을 더했습니다.

## 핵심 기여

Transformer는 어텐션만으로 시퀀스 정보를 섞을 수 있는지 묻습니다. 토큰을 한 단계씩 처리하는 순환 구조를 병렬 Self-attention으로 바꾸면서 번역을 위한 인코더-디코더 형태는 유지합니다.

## 방법론 개요

각 층은 Multi-head self-attention과 위치별 피드포워드 네트워크를 결합합니다. 디코더에는 미래 토큰을 보지 않게 하는 마스크드 Self-attention과 인코더 출력에 대한 어텐션이 추가됩니다. 어텐션 자체에는 토큰 순서가 없으므로 토큰 임베딩에 위치 인코딩을 더합니다. Scaled dot-product는 Query와 Key의 관련도를 계산해 가중치를 만들고, 이를 Value에 적용합니다.

## 주요 실험 결과

WMT 2014에서 Base 모델은 영어-독일어 27.3 BLEU, 영어-프랑스어 38.1 BLEU를 기록했습니다. 큰 모델은 각각 28.4와 41.8을 기록했습니다. 논문은 순환 기준 모델보다 병렬 학습이 빠르다는 점과 문장 구문 분석 실험도 보고합니다.

## 한계와 시사점

근거는 기계 번역과 논문에 포함된 구문 분석 실험에 가장 직접적으로 적용됩니다. Self-attention은 토큰 쌍 사이의 관계를 계산하므로 시퀀스가 길어질수록 메모리와 계산량이 빠르게 늘어납니다. 원 논문이 임의로 긴 입력에서도 비용 효율적임을 입증한 것은 아닙니다.

### Knowledge 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Transformer self-attention | 각 토큰이 같은 시퀀스의 다른 토큰 정보를 가중합해 표현을 만듭니다. | 먼 위치의 정보를 연결하는 주된 방법으로 순환 구조를 대체합니다. |

## 참고 자료

- [논문 원문, arXiv:1706.03762](https://arxiv.org/abs/1706.03762) · 2017년 6월 12일 최초 제출.
- Figure 1은 저자들의 arXiv HTML 원문에서 가져왔습니다. 논문은 학술·저널리즘 목적의 그림 재사용을 허용한다고 밝히며, 이 페이지에도 출처를 표시했습니다.
