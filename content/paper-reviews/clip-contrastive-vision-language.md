---
{
  "canonicalId": "arxiv:2103.00020",
  "version": "2103.00020v1",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2021-02-26",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, Ilya Sutskever",
  "slug": "clip-contrastive-vision-language",
  "title": { "en": "Learning Transferable Visual Models From Natural Language Supervision", "ko": "자연어 감독으로 전이 가능한 시각 모델 학습하기" },
  "dek": { "en": "CLIP trains image and text encoders to match captions with images, then uses natural-language class descriptions for zero-shot transfer.", "ko": "CLIP은 이미지와 설명 문장의 짝을 맞추도록 두 인코더를 학습한 뒤, 자연어 클래스 설명으로 Zero-shot 전이를 수행합니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/2103.00020/assets/main-diagrams.png",
    "alt": { "en": "CLIP dual-encoder and contrastive pre-training overview from the original paper.", "ko": "원 논문에 실린 CLIP 이중 인코더 및 대조 학습 개요." },
    "caption": { "en": "A batch of image-text pairs trains both encoders so matched pairs are close and mismatched pairs are far apart.", "ko": "이미지-텍스트 배치에서 짝이 맞는 쌍은 가까워지고 맞지 않는 쌍은 멀어지도록 두 인코더를 학습합니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->

## The contribution in one minute

Most vision models are trained against a fixed label set. CLIP instead learns from image-caption pairs collected from the web. A text encoder and an image encoder are trained together so that the correct caption is ranked above other captions in the batch. At test time, class names or descriptions become text prompts that can be compared with an image embedding.

## Method and evidence

The authors train on 400 million image-text pairs and evaluate transfer across more than 30 datasets. CLIP supports zero-shot classification without task-specific gradient updates. On ImageNet, the paper reports zero-shot accuracy comparable to the original ResNet-50, without using that model’s 1.28 million labeled training examples.

## Limits and engineering implications

Web captions are noisy and reflect gaps and biases in their source. Zero-shot scores can depend on class wording, prompt templates, and benchmark overlap. CLIP’s representation is not a guarantee of robust understanding, and the paper documents uneven performance across tasks. In practice, test prompt variants, out-of-distribution data, and subgroup performance before relying on a single aggregate score.

## Terminology

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Contrastive image-text learning | Train two encoders to assign higher similarity to matched image-caption pairs than mismatched pairs. | It creates a shared space that supports text-based zero-shot classification. |

## References and figure credits

- [Original paper, arXiv:2103.00020](https://arxiv.org/abs/2103.00020) · first submitted 26 February 2021.
- [OpenAI CLIP code and checkpoints](https://github.com/openai/CLIP).
- Figure 1 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->

## 1분 핵심 요약

대부분의 비전 모델은 고정된 라벨 집합을 예측하도록 학습합니다. CLIP은 웹에서 모은 이미지-설명 문장 쌍으로 학습합니다. 텍스트 인코더와 이미지 인코더를 함께 학습해 배치 안에서 올바른 설명이 다른 설명보다 높은 점수를 받게 합니다. 추론 시에는 클래스 이름이나 설명을 텍스트 프롬프트로 만들어 이미지 임베딩과 비교합니다.

## 방법과 근거

저자들은 이미지-텍스트 쌍 4억 개로 학습하고 30개가 넘는 데이터셋에서 전이를 평가했습니다. CLIP은 과제별 가중치 업데이트 없이 Zero-shot 분류를 지원합니다. ImageNet에서 원 ResNet-50과 비슷한 Zero-shot 정확도를 보였으며, ResNet-50 학습에 사용된 라벨 이미지 128만 장을 사용하지 않았다고 보고합니다.

## 한계와 엔지니어 관점

웹 설명은 잡음이 있고 출처의 공백과 편향을 반영합니다. Zero-shot 점수는 클래스 문구, 프롬프트 템플릿, 벤치마크 중복에 영향을 받을 수 있습니다. CLIP의 표현이 견고한 이해를 보장하는 것은 아니며, 논문도 과제별 성능 차이를 기록합니다. 실제 적용에서는 프롬프트 변형, 분포 밖 데이터, 집단별 성능을 확인해야 합니다.

## 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Contrastive image-text learning | 짝이 맞는 이미지-설명은 가깝게, 맞지 않는 쌍은 멀게 학습하는 방식입니다. | 텍스트로 Zero-shot 분류를 할 수 있는 공유 표현 공간을 만듭니다. |

## 참고 자료와 그림 출처

- [논문 원문, arXiv:2103.00020](https://arxiv.org/abs/2103.00020) · 2021년 2월 26일 최초 제출.
- [OpenAI CLIP 코드와 체크포인트](https://github.com/openai/CLIP).
- Figure 1은 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
