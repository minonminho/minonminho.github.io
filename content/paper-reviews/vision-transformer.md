---
{
  "canonicalId": "arxiv:2010.11929",
  "version": "2010.11929v2",
  "reviewStatus": "published",
  "sourceType": "foundational-seed",
  "publishedDate": "2020-10-22",
  "dailyDate": null,
  "dailyRank": null,
  "upvotesAtSelection": null,
  "authors": "Alexey Dosovitskiy, Lucas Beyer, Alexander Kolesnikov, Dirk Weissenborn, Xiaohua Zhai, Thomas Unterthiner, Mostafa Dehghani, Matthias Minderer, Georg Heigold, Sylvain Gelly, Jakob Uszkoreit, Neil Houlsby",
  "slug": "vision-transformer",
  "title": { "en": "An Image Is Worth 16×16 Words: Transformers for Image Recognition at Scale", "ko": "이미지는 16×16 단어만큼 가치 있다: 대규모 이미지 인식을 위한 Transformer" },
  "dek": { "en": "ViT turns image patches into a token sequence and shows that a standard Transformer can be highly effective when pre-trained at scale.", "ko": "ViT는 이미지 패치를 토큰 시퀀스로 바꾸고, 충분한 규모로 사전 학습하면 표준 Transformer가 이미지 인식에도 효과적임을 보입니다." },
  "hero": {
    "url": "https://ar5iv.labs.arxiv.org/html/2010.11929/assets/model_scheme.png",
    "alt": { "en": "Vision Transformer overview: an image is split into patches, embedded, position-encoded, and processed by a Transformer encoder.", "ko": "이미지를 패치로 나누고 임베딩·위치 인코딩한 뒤 Transformer 인코더에 넣는 ViT 구조." },
    "caption": { "en": "The patch sequence follows the standard Transformer interface, with a classification token used for image-level prediction.", "ko": "패치 시퀀스는 표준 Transformer 입력 형태를 따르며, 분류 토큰으로 이미지 전체를 예측합니다." },
    "license": "Author figure, linked from the arXiv HTML paper with source attribution."
  }
}
---
<!-- locale: en -->

## The contribution in one minute

Vision systems had usually relied on convolutional inductive biases. ViT tests a simpler alternative: split an image into fixed-size patches, linearly embed them, add positional embeddings, and feed the sequence to a standard Transformer encoder. The paper’s central condition is scale: the pure Transformer works especially well after large-scale pre-training and transfer.

## Method and evidence

For an image of H×W pixels, patch size P creates a sequence of N = HW/P² patch tokens. A learned classification token represents the whole image. The authors compare pre-training sizes and transfer to ImageNet, CIFAR-100, and VTAB. Large-data ViT models matched or exceeded strong convolutional baselines on multiple transfer tasks and often required less pre-training compute for a target performance.

## Limits and engineering implications

Without convolutional locality and translation biases, ViT needs enough data or a suitable pre-training recipe to learn visual structure. Small-data results are not interchangeable with large-data results. Patch size also controls sequence length and cost. When selecting a vision backbone, test the data regime, resolution, and transfer task that match deployment.

## Terminology

| Term | Plain meaning | Why it matters here |
| --- | --- | --- |
| Vision Transformer | An image model that processes embedded image patches as a Transformer token sequence. | It shows that convolution is not required in every high-performing vision model. |

## References and figure credits

- [Original paper, arXiv:2010.11929](https://arxiv.org/abs/2010.11929) · first submitted 22 October 2020.
- [Google Research implementation](https://github.com/google-research/vision_transformer).
- Figure 1 is linked from the authors’ arXiv HTML paper and credited to the authors.

<!-- locale: ko -->

## 1분 핵심 요약

컴퓨터 비전 모델은 보통 합성곱의 귀납적 편향을 활용했습니다. ViT는 더 단순한 대안을 시험합니다. 이미지를 고정 크기 패치로 나누고 선형 임베딩과 위치 임베딩을 더해 표준 Transformer 인코더에 넣습니다. 핵심 조건은 학습 규모입니다. 대규모 사전 학습과 전이를 거치면 순수 Transformer도 높은 성능을 냅니다.

## 방법과 근거

H×W 이미지에서 패치 크기 P를 쓰면 N = HW/P²개의 패치 토큰이 생깁니다. 학습 가능한 분류 토큰은 이미지 전체 정보를 요약합니다. 저자들은 사전 학습 데이터 크기를 비교하고 ImageNet, CIFAR-100, VTAB으로 전이 성능을 평가했습니다. 큰 데이터로 학습한 ViT는 여러 전이 과제에서 강한 합성곱 기준 모델과 비슷하거나 더 높은 성능을 냈고, 목표 성능에 도달하는 데 사전 학습 계산량이 더 적은 경우도 있었습니다.

## 한계와 엔지니어 관점

합성곱의 지역성·이동 불변 편향이 없으므로 ViT는 시각 구조를 배우기에 충분한 데이터나 적절한 사전 학습이 필요합니다. 소량 데이터 결과를 대규모 데이터 결과와 동일하게 볼 수 없습니다. 패치 크기도 시퀀스 길이와 비용을 바꿉니다. 배포에 맞는 데이터 규모·해상도·전이 과제로 백본을 평가해야 합니다.

## 용어 정리

| 용어 | 쉬운 뜻 | 여기서 중요한 이유 |
| --- | --- | --- |
| Vision Transformer | 이미지 패치를 임베딩해 Transformer 토큰 시퀀스로 처리하는 이미지 모델입니다. | 높은 성능의 모든 비전 모델에 합성곱이 필요한 것은 아님을 보입니다. |

## 참고 자료와 그림 출처

- [논문 원문, arXiv:2010.11929](https://arxiv.org/abs/2010.11929) · 2020년 10월 22일 최초 제출.
- [Google Research 구현](https://github.com/google-research/vision_transformer).
- Figure 1은 저자들의 arXiv HTML 원문에서 연결했으며 저자 출처를 표시했습니다.
