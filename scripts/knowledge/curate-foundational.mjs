import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseReviewMetadata } from "../paper-reviews/history.mjs";

const root = process.cwd();
const contentRoot = path.join(root, "content/knowledge");
const paperRoot = path.join(root, "content/paper-reviews");
const updatedAt = "2026-10-25";
const timestamp = `${updatedAt}T00:00:00.000Z`;

const concepts = [
  {
    id: "concept:transformer-self-attention", slug: "transformer-self-attention",
    canonicalName: { en: "Transformer self-attention", ko: "Transformer Self-attention" },
    aliases: ["Transformer self-attention", "Self-attention", "Multi-head attention", "셀프 어텐션", "멀티헤드 어텐션"],
    domain: ["Deep Learning", "Natural Language Processing"],
    dek: { en: "A Transformer lets each token gather information from other positions through parallel attention, without recurrent state.", ko: "Transformer는 순환 상태 없이 병렬 어텐션으로 각 토큰이 다른 위치의 정보를 모으게 합니다." },
    paperIds: ["arxiv:1706.03762"],
    paperTitle: { en: "Attention Is All You Need", ko: "Attention Is All You Need" },
    figureUrl: "https://arxiv.org/html/1706.03762v7/Figures/ModalNet-21.png",
    figureAlt: { en: "Transformer encoder and decoder built from self-attention and feed-forward layers.", ko: "Self-attention과 피드포워드 층으로 구성된 Transformer 인코더와 디코더." },
    figureCaption: { en: "The original architecture pairs self-attention with position-wise feed-forward layers and residual paths.", ko: "원 논문 구조는 Self-attention, 위치별 피드포워드 층, 잔차 경로를 결합합니다." },
    referenceUrl: "https://github.com/tensorflow/tensor2tensor",
    referenceLabel: { en: "Tensor2Tensor implementation", ko: "Tensor2Tensor 구현" },
    definition: { en: "Self-attention builds each token representation by taking a learned weighted sum of information from other tokens.", ko: "Self-attention은 다른 토큰의 정보를 학습된 가중합으로 모아 각 토큰 표현을 만듭니다." },
    architecture: { en: "Queries score keys, softmax turns scores into weights, and those weights mix values. Multiple heads perform this operation in parallel across learned subspaces.", ko: "Query가 Key를 평가하고 Softmax가 점수를 가중치로 바꾸며, 가중치로 Value를 섞습니다. 여러 Head는 서로 다른 표현 공간에서 이를 병렬 수행합니다." },
    visualization: { en: "The paper’s encoder-decoder diagram shows attention replacing recurrence in both stacks; positional encodings provide sequence order.", ko: "논문의 인코더-디코더 그림은 두 스택에서 순환 구조를 어텐션으로 대체하며, 위치 인코딩이 순서를 보완함을 보여줍니다." },
    comparison: { en: "Unlike an RNN, self-attention can connect distant positions in one layer and process positions in parallel, but dense attention compares token pairs.", ko: "RNN과 달리 한 층에서 먼 위치를 연결하고 병렬 처리할 수 있지만, Dense attention은 토큰 쌍을 계산합니다." },
    implementation: { en: "Track sequence length, attention memory, masking, and positional information. The original translation system uses encoder-decoder attention; decoder-only models use causal masking.", ko: "시퀀스 길이, 어텐션 메모리, 마스킹, 위치 정보를 관리해야 합니다. 원 번역 모델은 인코더-디코더 어텐션을 쓰고, Decoder-only 모델은 인과 마스크를 씁니다." },
    limitations: { en: "Attention weights are part of a computation, not a guaranteed human-readable explanation. Standard dense self-attention has quadratic pairwise work in sequence length.", ko: "어텐션 가중치는 계산의 일부이지 사람이 읽을 수 있는 설명을 보장하지 않습니다. 표준 Dense self-attention은 시퀀스 길이에 대해 쌍별 계산량이 제곱으로 늘어납니다." },
    takeaway: { en: "Self-attention is a flexible token-mixing operation; the Transformer is the full architecture that organizes it with feed-forward blocks, residual paths, normalization, and positions.", ko: "Self-attention은 토큰을 섞는 연산이고, Transformer는 이를 피드포워드 블록·잔차 경로·정규화·위치 정보와 결합한 전체 구조입니다." },
    flow: ["토큰 임베딩", "Query / Key / Value", "가중 정보 결합", "새 토큰 표현"],
    onePager: ["무엇을 계산하나", "Query-Key 유사도로 토큰 간 가중치를 만들고 Value를 섞습니다.", "무엇이 달라지나", "순환 상태 없이 먼 토큰 관계를 병렬 계산합니다.", "구현 점검", "길이에 따른 메모리, 마스크, 위치 정보를 확인합니다.", "주의할 점", "어텐션 가중치를 곧바로 설명이나 인과로 해석하지 않습니다.", "활용", "번역·언어 이해·생성 등 시퀀스 표현의 기본 연산입니다."],
  },
  {
    id: "concept:residual-learning", slug: "residual-learning",
    canonicalName: { en: "Residual learning", ko: "Residual learning (잔차 학습)" },
    aliases: ["Residual learning", "Residual connection", "Identity shortcut", "잔차 학습", "지름길 연결"],
    domain: ["Deep Learning", "Computer Vision"],
    dek: { en: "Residual blocks learn a correction to their input and add the input back through a shortcut.", ko: "잔차 블록은 입력에 더할 보정값을 학습하고 지름길로 원래 입력을 다시 더합니다." },
    paperIds: ["arxiv:1512.03385"], paperTitle: { en: "Deep Residual Learning for Image Recognition", ko: "이미지 인식을 위한 심층 잔차 학습" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/1512.03385/assets/figure2.png",
    figureAlt: { en: "Residual block in which an identity shortcut is added to the learned residual function.", ko: "학습된 잔차 함수에 항등 지름길을 더하는 잔차 블록." },
    figureCaption: { en: "A shortcut carries x around the stacked layers, which learn F(x); the output is F(x) + x.", ko: "지름길은 x를 층들 너머로 전달하고 층들은 F(x)를 학습해 출력 F(x) + x를 만듭니다." },
    referenceUrl: "https://github.com/KaimingHe/deep-residual-networks",
    referenceLabel: { en: "Authors’ ResNet repository", ko: "저자 ResNet 저장소" },
    definition: { en: "A residual block learns the difference between its desired mapping and its input, then adds the input back.", ko: "잔차 블록은 원하는 변환과 입력의 차이를 학습한 뒤 입력을 다시 더합니다." },
    architecture: { en: "For input x, stacked layers produce F(x), and an identity shortcut forms F(x) + x. Projection shortcuts handle shape changes.", ko: "입력 x에 대해 층들이 F(x)를 만들고 항등 지름길이 F(x) + x를 구성합니다. 모양이 달라질 때는 투영 지름길을 씁니다." },
    visualization: { en: "The block diagram makes the bypass explicit: information and gradients can travel along a short path around nonlinear layers.", ko: "블록 그림은 우회 경로를 보여줍니다. 정보와 그래디언트가 비선형 층을 돌아 짧은 경로로 전달될 수 있습니다." },
    comparison: { en: "A plain stack must learn the whole mapping. A residual stack can represent identity by driving F(x) toward zero.", ko: "일반 층 쌓기는 전체 변환을 학습하지만, 잔차 구조는 F(x)를 0에 가깝게 해 항등 변환을 표현할 수 있습니다." },
    implementation: { en: "Keep shortcut and residual tensor shapes compatible; use a projection when channels or stride change. Compare models at matched depth and compute.", ko: "지름길과 잔차 텐서의 형태를 맞추고 채널·Stride가 바뀌면 투영을 사용합니다. 깊이와 계산량을 맞춰 비교합니다." },
    limitations: { en: "Shortcuts ease optimization but do not remove compute, memory, data, or training-dynamics constraints. An ensemble result should not be described as one model.", ko: "지름길은 최적화를 돕지만 계산량·메모리·데이터·학습 동역학 제약을 없애지는 않습니다. 앙상블 결과를 단일 모델 결과로 부르면 안 됩니다." },
    takeaway: { en: "The key idea is a learnable correction plus a route that preserves the input, making identity-like behavior easy to express.", ko: "핵심은 학습 가능한 보정값과 입력을 보존하는 경로를 결합해 항등에 가까운 동작을 쉽게 표현하는 것입니다." },
    flow: ["입력 x", "층이 F(x) 학습", "지름길로 x 전달", "F(x) + x"],
    onePager: ["문제", "깊은 층에서 최적화가 어려워지고 학습 오차도 악화될 수 있습니다.", "핵심 구조", "층은 전체 변환이 아닌 잔차 F(x)를 학습합니다.", "지름길", "입력을 잔차 출력에 더해 F(x) + x를 만듭니다.", "구현 점검", "형태가 바뀌는 블록에서는 투영 지름길을 사용합니다.", "해석", "잔차 경로는 최적화를 돕지만 비용을 없애지는 않습니다."],
  },
  {
    id: "concept:masked-language-modeling", slug: "masked-language-modeling",
    canonicalName: { en: "Masked language modeling", ko: "Masked language modeling (마스크 언어 모델링)" },
    aliases: ["Masked language modeling", "Masked LM", "MLM", "마스크 언어 모델링"],
    domain: ["Natural Language Processing", "Pretraining"],
    dek: { en: "Masked language modeling trains a bidirectional encoder to recover selected tokens from surrounding context.", ko: "마스크 언어 모델링은 양방향 인코더가 주변 문맥에서 가린 토큰을 복원하도록 학습합니다." },
    paperIds: ["arxiv:1810.04805"], paperTitle: { en: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", ko: "BERT: 언어 이해를 위한 심층 양방향 Transformer 사전 학습" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/1810.04805/assets/bert_pretraining_finetuning.png",
    figureAlt: { en: "BERT pre-training and fine-tuning diagram from the original paper.", ko: "원 논문에 실린 BERT 사전 학습과 미세 조정 그림." },
    figureCaption: { en: "A shared bidirectional encoder is pre-trained with masked tokens and then fine-tuned for downstream tasks.", ko: "공유 양방향 인코더를 가린 토큰으로 사전 학습한 뒤 여러 과제에 미세 조정합니다." },
    referenceUrl: "https://github.com/google-research/bert",
    referenceLabel: { en: "Google Research BERT code", ko: "Google Research BERT 코드" },
    definition: { en: "The model predicts tokens deliberately hidden from an input, using visible tokens on both sides as context.", ko: "모델이 입력에서 일부러 가린 토큰을 양쪽의 보이는 토큰 문맥을 이용해 예측합니다." },
    architecture: { en: "BERT selects 15% of WordPiece positions for prediction and uses a replacement recipe so the model cannot rely only on a visible mask token.", ko: "BERT는 WordPiece 위치의 15%를 예측 대상으로 고르고, 항상 마스크 토큰만 보지 않도록 대체 방식을 섞습니다." },
    visualization: { en: "The paper’s diagram shows the same encoder initializing task models; only a task output layer is added before full fine-tuning.", ko: "논문 그림은 같은 인코더로 과제 모델을 초기화하고 출력층을 더한 뒤 전체를 미세 조정하는 흐름을 보여줍니다." },
    comparison: { en: "Unlike left-to-right language modeling, masked prediction can use right context while building a token representation.", ko: "왼쪽에서 오른쪽으로 예측하는 언어 모델과 달리, 토큰 표현을 만들 때 오른쪽 문맥도 사용할 수 있습니다." },
    implementation: { en: "Use a bidirectional encoder and a vocabulary prediction head for pre-training; attach task heads and fine-tune for classification or span extraction.", ko: "사전 학습에는 양방향 인코더와 어휘 예측 층을 쓰고, 분류·정답 구간 추출에는 과제별 출력층을 붙여 미세 조정합니다." },
    limitations: { en: "Masked-token pre-training does not directly train left-to-right generation. The original English data and task suite also limit how broadly results transfer.", ko: "마스크 토큰 사전 학습은 왼쪽에서 오른쪽으로 문장을 생성하도록 직접 훈련하지 않습니다. 원래 영어 데이터와 과제 구성도 전이 범위를 제한합니다." },
    takeaway: { en: "MLM gives an encoder access to both-side context by turning missing-token recovery into a scalable pre-training objective.", ko: "MLM은 빠진 토큰 복원을 확장 가능한 사전 학습 목표로 삼아 인코더가 양쪽 문맥을 활용하게 합니다." },
    flow: ["문장 토큰", "일부 위치 가리기", "양방향 문맥", "가린 토큰 예측"],
    onePager: ["입력", "문장 토큰 중 일부를 예측 대상으로 선택합니다.", "학습", "주변의 왼쪽·오른쪽 문맥으로 원래 토큰을 맞힙니다.", "효과", "양방향 인코더 표현을 여러 과제에 재사용합니다.", "구현 점검", "마스크·랜덤 대체·원 토큰 유지 비율을 확인합니다.", "주의할 점", "MLM은 다음 토큰 생성 목표와 다릅니다."],
  },
  {
    id: "concept:in-context-learning", slug: "in-context-learning",
    canonicalName: { en: "In-context learning", ko: "In-context learning (문맥 내 학습)" },
    aliases: ["In-context learning", "Few-shot learning", "In-context", "문맥 내 학습", "Few-shot"],
    domain: ["Large Language Models", "Prompting"],
    dek: { en: "A language model infers a task from instructions or examples placed in its input, without updating its parameters for that request.", ko: "언어 모델이 요청별 파라미터 갱신 없이 입력에 포함된 지시나 예시에서 과제를 파악합니다." },
    paperIds: ["arxiv:2005.14165"], paperTitle: { en: "Language Models are Few-Shot Learners", ko: "언어 모델은 Few-shot 학습자다" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2005.14165/assets/figures/metalearning.png",
    figureAlt: { en: "Meta-learning diagram showing examples in the input as task context during inference.", ko: "추론 시 입력 속 예시가 과제 문맥으로 작동하는 모습을 나타낸 메타 학습 그림." },
    figureCaption: { en: "The model uses demonstrations within a forward pass; the paper does not update model weights per task.", ko: "모델은 순전파 안에서 시연 예시를 사용하며, 과제마다 가중치를 갱신하지 않습니다." },
    referenceUrl: "https://arxiv.org/abs/2005.14165",
    referenceLabel: { en: "Original paper and evaluation", ko: "논문과 평가" },
    definition: { en: "In-context learning is task adaptation from the current prompt rather than from a gradient update to model parameters.", ko: "In-context learning은 파라미터 그래디언트 갱신 대신 현재 프롬프트에서 과제에 적응하는 방식입니다." },
    architecture: { en: "The prompt may contain an instruction, demonstrations, and a new example; an autoregressive model predicts the continuation.", ko: "프롬프트에는 지시, 시연 예시, 새 입력이 들어갈 수 있고 자기회귀 모델이 이어질 내용을 예측합니다." },
    visualization: { en: "The paper describes pre-training as learning broad patterns and inference-time context as a rapid inner-loop adaptation.", ko: "논문은 사전 학습이 넓은 패턴을 익히고 추론 시 문맥이 빠른 내부 적응 역할을 한다고 설명합니다." },
    comparison: { en: "Fine-tuning changes model parameters; in-context learning changes the input sequence while keeping the model fixed.", ko: "미세 조정은 모델 파라미터를 바꾸고, In-context learning은 모델을 고정한 채 입력 시퀀스를 바꿉니다." },
    implementation: { en: "Control example order, wording, number of demonstrations, and context length. Evaluate with held-out prompts, not only a single hand-picked example.", ko: "예시 순서·표현·개수·문맥 길이를 관리합니다. 직접 고른 한 사례만이 아니라 분리된 프롬프트로 평가합니다." },
    limitations: { en: "Prompt-based performance can be sensitive to formatting and examples. Strong in-context results do not prove durable learning or reliable reasoning.", ko: "프롬프트 성능은 형식과 예시에 민감할 수 있습니다. 좋은 결과가 지속 학습이나 신뢰할 수 있는 추론을 증명하지는 않습니다." },
    takeaway: { en: "Treat the prompt as a temporary task interface and measure how robustly the model uses its examples.", ko: "프롬프트를 임시 과제 인터페이스로 보고 모델이 예시를 얼마나 안정적으로 활용하는지 측정합니다." },
    flow: ["지시", "예시", "새 입력", "문맥 기반 응답"],
    onePager: ["정의", "현재 입력에 든 예시로 과제를 파악합니다.", "파라미터", "요청 중에는 모델 가중치를 갱신하지 않습니다.", "비교", "미세 조정은 가중치를, In-context는 프롬프트를 바꿉니다.", "점검", "예시 순서·개수·표현에 대한 민감도를 측정합니다.", "주의할 점", "프롬프트 성능은 지속 학습의 증거가 아닙니다."],
  },
  {
    id: "concept:retrieval-augmented-generation", slug: "retrieval-augmented-generation",
    canonicalName: { en: "Retrieval-augmented generation", ko: "Retrieval-augmented generation (검색 증강 생성)" },
    aliases: ["Retrieval-augmented generation", "RAG", "검색 증강 생성"],
    domain: ["Large Language Models", "Information Retrieval"],
    dek: { en: "RAG retrieves external passages for an input and conditions a generator on those passages alongside learned model knowledge.", ko: "RAG는 입력에 맞는 외부 문서를 찾고, 생성기가 그 문서와 모델 내부 지식을 함께 사용하게 합니다." },
    paperIds: ["arxiv:2005.11401"], paperTitle: { en: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks", ko: "지식 집약형 NLP 과제를 위한 검색 증강 생성" },
    figureUrl: "https://arxiv.org/html/2005.11401v4/posterior_plot.png",
    figureAlt: { en: "Document posterior visualization from the original RAG-Token paper.", ko: "원 RAG-Token 논문의 문서 사후확률 시각화." },
    figureCaption: { en: "Different retrieved passages can support different generated tokens.", ko: "서로 다른 검색 문서가 서로 다른 생성 토큰을 뒷받침할 수 있습니다." },
    referenceUrl: "https://huggingface.co/docs/transformers/model_doc/rag",
    referenceLabel: { en: "Hugging Face RAG documentation", ko: "Hugging Face RAG 문서" },
    definition: { en: "RAG combines a retriever over an external index with a generator that conditions on the retrieved passages.", ko: "RAG는 외부 색인을 검색하는 검색기와 검색된 문서를 참고하는 생성기를 결합합니다." },
    architecture: { en: "The original setup uses a dense passage retriever, a Wikipedia vector index, and a BART generator; retrieved documents are treated as latent variables.", ko: "원 구성은 Dense Passage Retriever, Wikipedia 벡터 색인, BART 생성기를 사용하고 검색 문서를 잠재 변수로 다룹니다." },
    visualization: { en: "RAG-Sequence shares document evidence across an output; RAG-Token can assign different evidence to individual tokens.", ko: "RAG-Sequence는 답변 전체에 같은 문서 근거를 쓰고, RAG-Token은 토큰마다 근거 문서를 달리할 수 있습니다." },
    comparison: { en: "Parametric memory is stored in model weights; non-parametric memory is an index that can be inspected and replaced separately.", ko: "파라미터 기억은 모델 가중치에 있고, 비파라미터 기억은 별도로 확인·교체할 수 있는 색인에 있습니다." },
    implementation: { en: "Version the corpus and index, log retrieved passages, and evaluate retrieval recall separately from answer quality and citation fidelity.", ko: "문서 집합과 색인 버전을 관리하고 검색 결과를 기록하며, 검색 재현율·답변 품질·인용 충실도를 나눠 평가합니다." },
    limitations: { en: "A correct answer depends on retrieval coverage, passage quality, and the generator’s use of evidence; retrieval does not eliminate unsupported claims.", ko: "정답은 검색 범위·문서 품질·생성기의 근거 활용에 달려 있습니다. 검색을 붙여도 근거 없는 주장이 사라지는 것은 아닙니다." },
    takeaway: { en: "RAG makes one knowledge source easier to update and inspect, but retrieval and generation remain separate failure points.", ko: "RAG는 지식 출처를 갱신·확인하기 쉽게 하지만 검색과 생성은 각각 실패할 수 있습니다." },
    flow: ["질문", "문서 검색", "근거와 질문 결합", "생성 답변"],
    onePager: ["구성", "외부 검색기와 텍스트 생성기를 연결합니다.", "기억", "모델 파라미터와 검색 색인을 별도로 둡니다.", "운영", "색인 버전과 검색된 문서를 기록합니다.", "평가", "검색 품질과 답변 품질을 나눠 확인합니다.", "주의할 점", "검색은 환각을 자동으로 제거하지 않습니다."],
  },
  {
    id: "concept:lora", slug: "lora",
    canonicalName: { en: "LoRA", ko: "LoRA" },
    aliases: ["LoRA", "Low-Rank Adaptation", "저랭크 적응"],
    domain: ["Large Language Models", "Parameter-Efficient Fine-Tuning"],
    dek: { en: "LoRA freezes a shared pretrained model and learns compact low-rank matrices for a task-specific weight update.", ko: "LoRA는 공유 사전 학습 모델을 고정하고 과제별 가중치 업데이트를 작은 저랭크 행렬로 학습합니다." },
    paperIds: ["arxiv:2106.09685", "arxiv:2610.24738"],
    paperTitle: { en: "LoRA: Low-Rank Adaptation of Large Language Models", ko: "LoRA: 대규모 언어 모델의 저랭크 적응" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2106.09685/assets/figure1.png",
    figureAlt: { en: "LoRA reparameterization with frozen base weights and trainable low-rank matrices.", ko: "고정된 기본 가중치와 학습 가능한 저랭크 행렬로 구성된 LoRA 재매개화." },
    figureCaption: { en: "The adapter learns a low-rank update that can be merged into the base weights at inference.", ko: "어댑터는 추론 시 기본 가중치에 합칠 수 있는 저랭크 업데이트를 학습합니다." },
    referenceUrl: "https://github.com/microsoft/LoRA",
    referenceLabel: { en: "Microsoft LoRA implementation", ko: "Microsoft LoRA 구현" },
    definition: { en: "LoRA represents a task-specific weight change as a product of small trainable matrices while the original weights stay frozen.", ko: "LoRA는 원래 가중치를 고정하고 과제별 변화를 작은 학습 행렬의 곱으로 표현합니다." },
    architecture: { en: "For a base matrix W, the adapted matrix is W + B·A, where A and B have a low inner rank. The update can be merged for serving.", ko: "기본 행렬 W에 랭크가 낮은 A와 B의 곱 B·A를 더합니다. 서빙 전에 업데이트를 합칠 수 있습니다." },
    visualization: { en: "The LoRA paper motivates a low-rank update; LayerEditor later uses LoRA as one way to adapt its pretrained image editor.", ko: "LoRA 논문은 저랭크 업데이트를 제안하고, LayerEditor는 사전 학습 이미지 편집기를 조정하는 한 방법으로 LoRA를 사용합니다." },
    comparison: { en: "Full fine-tuning updates and stores all model weights. LoRA stores a shared frozen base plus a smaller task adapter.", ko: "전체 미세 조정은 모든 가중치를 갱신·저장합니다. LoRA는 고정된 공유 모델과 작은 과제 어댑터를 보관합니다." },
    implementation: { en: "Choose target matrices and rank empirically; account for optimizer state, adapter switching, merging, and numerical behavior in the serving stack.", ko: "대상 행렬과 랭크를 경험적으로 선택하고 옵티마이저 상태·어댑터 전환·병합·서빙 수치 동작을 고려합니다." },
    limitations: { en: "A low-rank update may not capture every task’s useful change. Reported parameter and memory savings are tied to the paper’s model and optimizer comparison.", ko: "저랭크 업데이트가 모든 과제의 유효한 변화를 표현하는 것은 아닙니다. 논문의 파라미터·메모리 절감 수치는 해당 모델과 옵티마이저 비교에 한정됩니다." },
    takeaway: { en: "LoRA is a compact adaptation interface around a shared base model, not a replacement for evaluating adaptation quality.", ko: "LoRA는 공유 기본 모델 위의 작은 적응 인터페이스이며, 적응 품질 평가를 대체하지는 않습니다." },
    flow: ["고정 모델 W", "학습 A와 B", "저랭크 업데이트", "병합 또는 어댑터 적용"],
    onePager: ["정의", "기본 가중치는 고정하고 작은 저랭크 업데이트만 학습합니다.", "형태", "W에 B·A를 더하며 A와 B의 안쪽 차원이 작습니다.", "효과", "과제 어댑터를 작게 저장하고 기본 모델을 공유합니다.", "구현 점검", "대상 행렬·랭크·옵티마이저·병합 방식을 측정합니다.", "주의할 점", "절감량과 품질은 모델·과제·설정에 따라 다릅니다."],
  },
  {
    id: "concept:rlhf", slug: "rlhf",
    canonicalName: { en: "Reinforcement learning from human feedback", ko: "Reinforcement learning from human feedback (RLHF)" },
    aliases: ["RLHF", "Human feedback", "Reward model", "사람 피드백 강화학습", "보상 모델"],
    domain: ["Large Language Models", "Alignment"],
    dek: { en: "RLHF uses human comparisons to train a reward model, then optimizes a language model toward those learned preferences.", ko: "RLHF는 사람의 비교 평가로 보상 모델을 학습하고 언어 모델이 그 선호를 따르도록 최적화합니다." },
    paperIds: ["arxiv:2203.02155"], paperTitle: { en: "Training Language Models to Follow Instructions with Human Feedback", ko: "사람 피드백으로 지시를 따르도록 언어 모델 학습하기" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2203.02155/assets/InstructGPT_Diagram3.1.png",
    figureAlt: { en: "InstructGPT pipeline from human demonstrations to reward modeling and PPO optimization.", ko: "사람 시연 데이터에서 보상 모델링과 PPO 최적화로 이어지는 InstructGPT 절차." },
    figureCaption: { en: "A supervised starting model is ranked by labelers, then optimized against a learned reward.", ko: "지도 학습 초기 모델의 출력을 평가자가 순위화하고, 학습된 보상으로 최적화합니다." },
    referenceUrl: "https://arxiv.org/abs/2203.02155",
    referenceLabel: { en: "Original InstructGPT study", ko: "InstructGPT 원 연구" },
    definition: { en: "RLHF is a training family that uses reward signals derived from human preferences to adjust model behavior.", ko: "RLHF는 사람의 선호에서 만든 보상 신호로 모델 동작을 조정하는 학습 방식입니다." },
    architecture: { en: "InstructGPT uses demonstrations for supervised fine-tuning, ranked outputs for reward-model training, and PPO to optimize the policy.", ko: "InstructGPT는 시연 답변으로 지도 미세 조정하고, 출력 순위로 보상 모델을 만든 뒤 PPO로 정책을 최적화합니다." },
    visualization: { en: "The three stages connect human judgments to a learned reward, but the reward remains a proxy for the preferences represented in the data.", ko: "세 단계는 사람 평가를 학습된 보상으로 연결하지만, 보상은 데이터에 표현된 선호의 대리 지표입니다." },
    comparison: { en: "Supervised fine-tuning imitates demonstrations; reward learning uses relative comparisons; RL optimizes responses against the learned reward.", ko: "지도 미세 조정은 시연을 모방하고, 보상 학습은 상대 비교를 쓰며, 강화학습은 그 보상에 맞춰 응답을 최적화합니다." },
    implementation: { en: "Document the labeler pool and rubric, retain held-out prompts, and monitor reward-model disagreement and policy regressions.", ko: "평가자 집단과 기준을 기록하고 프롬프트를 분리 보관하며, 보상 모델 불일치와 정책 성능 저하를 모니터링합니다." },
    limitations: { en: "The learned objective encodes a specific sample of preferences; it can be incomplete or exploitable and does not guarantee truthfulness or harmlessness.", ko: "학습 목표에는 특정 선호 표본이 반영됩니다. 불완전하거나 악용될 수 있으며 진실성·무해성을 보장하지 않습니다." },
    takeaway: { en: "Human preference is a useful but bounded training signal; alignment claims must name who judged what, on which prompts.", ko: "사람의 선호는 유용하지만 범위가 제한된 학습 신호입니다. 정렬 주장은 누가 어떤 프롬프트를 평가했는지 밝혀야 합니다." },
    flow: ["시연 답변", "선호 순위", "보상 모델", "PPO 정책"],
    onePager: ["입력", "사람이 작성한 시연과 출력 비교를 모읍니다.", "학습", "비교에서 보상 모델을 만들고 정책을 최적화합니다.", "목표", "정의된 평가 집단의 선호를 모델 동작에 반영합니다.", "운영", "평가자·기준·프롬프트 분포를 기록합니다.", "주의할 점", "보상은 선호의 대리값이지 보편적 가치가 아닙니다."],
  },
  {
    id: "concept:vision-transformer", slug: "vision-transformer",
    canonicalName: { en: "Vision Transformer", ko: "Vision Transformer (ViT)" },
    aliases: ["Vision Transformer", "ViT", "Patch embedding", "비전 트랜스포머", "패치 임베딩"],
    domain: ["Computer Vision", "Transformers"],
    dek: { en: "ViT turns image patches into a token sequence so a standard Transformer can process an image.", ko: "ViT는 이미지 패치를 토큰 시퀀스로 바꿔 표준 Transformer가 처리하게 합니다." },
    paperIds: ["arxiv:2010.11929"], paperTitle: { en: "An Image Is Worth 16×16 Words: Transformers for Image Recognition at Scale", ko: "이미지는 16×16 단어만큼 가치 있다: 대규모 이미지 인식을 위한 Transformer" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2010.11929/assets/model_scheme.png",
    figureAlt: { en: "ViT patch embedding, positional encoding, Transformer encoder, and classification token.", ko: "ViT의 패치 임베딩, 위치 인코딩, Transformer 인코더, 분류 토큰." },
    figureCaption: { en: "The input image is divided into patches and handled as a sequence of learned embeddings.", ko: "입력 이미지를 패치로 나누고 학습된 임베딩 시퀀스로 처리합니다." },
    referenceUrl: "https://github.com/google-research/vision_transformer",
    referenceLabel: { en: "Google Research ViT code", ko: "Google Research ViT 코드" },
    definition: { en: "ViT applies a standard Transformer encoder to embedded image patches rather than pixels in a grid-aware convolution stack.", ko: "ViT는 격자 합성곱 대신 임베딩된 이미지 패치에 표준 Transformer 인코더를 적용합니다." },
    architecture: { en: "A linear projection maps flattened patches to tokens; learned positions are added, and a classification token gathers image-level information.", ko: "선형 투영이 펼친 패치를 토큰으로 바꾸고 학습 위치 정보를 더하며, 분류 토큰이 이미지 전체 정보를 모읍니다." },
    visualization: { en: "The model scheme shows the image-to-patch sequence and the standard Transformer encoder used for classification.", ko: "구조 그림은 이미지를 패치 시퀀스로 바꾸고 표준 Transformer 인코더로 분류하는 과정을 보여줍니다." },
    comparison: { en: "CNNs encode local connectivity and translation structure by design; ViT learns these regularities from data and can scale well with large pre-training.", ko: "CNN은 지역 연결과 이동 구조를 설계에 담지만, ViT는 데이터에서 이를 배우며 대규모 사전 학습에서 잘 확장될 수 있습니다." },
    implementation: { en: "Patch size sets token count and attention cost. Match pre-training scale, resolution, and fine-tuning data to the deployment task.", ko: "패치 크기가 토큰 수와 어텐션 비용을 결정합니다. 배포 과제에 사전 학습 규모·해상도·미세 조정 데이터를 맞춥니다." },
    limitations: { en: "The paper’s strongest results rely on large-scale pre-training. Smaller-data settings can favor convolutional inductive biases.", ko: "논문의 강한 결과는 대규모 사전 학습에 의존합니다. 데이터가 적으면 합성곱의 귀납적 편향이 유리할 수 있습니다." },
    takeaway: { en: "ViT shows that image recognition can use the Transformer sequence interface, with data scale compensating for weaker built-in visual biases.", ko: "ViT는 이미지 인식에도 Transformer 시퀀스 인터페이스를 쓸 수 있으며, 데이터 규모가 약한 시각 편향을 보완할 수 있음을 보입니다." },
    flow: ["이미지", "패치 분할", "위치 포함 토큰", "Transformer 분류"],
    onePager: ["입력", "이미지를 같은 크기의 패치로 나눕니다.", "표현", "각 패치를 임베딩하고 위치 정보를 더합니다.", "처리", "토큰 시퀀스를 Transformer 인코더에 넣습니다.", "비용", "패치 크기가 시퀀스 길이와 어텐션 비용을 바꿉니다.", "주의할 점", "작은 데이터에서는 사전 학습 규모가 특히 중요합니다."],
  },
  {
    id: "concept:contrastive-image-text-learning", slug: "contrastive-image-text-learning",
    canonicalName: { en: "Contrastive image-text learning", ko: "Contrastive image-text learning (대조 이미지-텍스트 학습)" },
    aliases: ["Contrastive image-text learning", "CLIP", "Image-text contrastive learning", "대조 이미지-텍스트 학습"],
    domain: ["Computer Vision", "Multimodal Learning"],
    dek: { en: "Two encoders learn a shared image-text space by ranking matched pairs above mismatched pairs.", ko: "두 인코더가 짝이 맞는 이미지-텍스트를 맞지 않는 쌍보다 높게 평가하도록 공유 공간을 학습합니다." },
    paperIds: ["arxiv:2103.00020"], paperTitle: { en: "Learning Transferable Visual Models From Natural Language Supervision", ko: "자연어 감독으로 전이 가능한 시각 모델 학습하기" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2103.00020/assets/main-diagrams.png",
    figureAlt: { en: "CLIP image and text encoders trained to recognize matched pairs in a batch.", ko: "배치 안에서 짝이 맞는 이미지와 텍스트를 찾도록 학습하는 CLIP 이미지·텍스트 인코더." },
    figureCaption: { en: "The text encoder can synthesize class descriptions at test time for zero-shot classification.", ko: "추론 시 텍스트 인코더가 클래스 설명을 만들어 Zero-shot 분류에 사용할 수 있습니다." },
    referenceUrl: "https://github.com/openai/CLIP",
    referenceLabel: { en: "OpenAI CLIP code and checkpoints", ko: "OpenAI CLIP 코드와 체크포인트" },
    definition: { en: "Contrastive image-text learning trains representations so matching captions and images are close in a shared embedding space.", ko: "대조 이미지-텍스트 학습은 짝이 맞는 설명과 이미지를 공유 임베딩 공간에서 가깝게 만듭니다." },
    architecture: { en: "A text encoder and image encoder produce vectors; a batchwise similarity objective rewards correct pairings and penalizes mismatches.", ko: "텍스트·이미지 인코더가 벡터를 만들고 배치 단위 유사도 목표가 올바른 짝을 높이고 오답 짝을 낮춥니다." },
    visualization: { en: "At inference, natural-language class names are encoded and compared with the image vector, avoiding a fixed learned classifier head.", ko: "추론 시 자연어 클래스 이름을 인코딩해 이미지 벡터와 비교하므로 고정된 분류기 층을 쓰지 않아도 됩니다." },
    comparison: { en: "Closed-label supervision learns a classifier over a fixed set; contrastive pre-training can expose many concepts through language prompts.", ko: "폐쇄형 라벨 지도학습은 고정 클래스 분류기를 배우지만, 대조 사전 학습은 언어 프롬프트로 다양한 개념을 표현할 수 있습니다." },
    implementation: { en: "Normalize embeddings, control prompt templates, and measure retrieval or classification across prompt variants and data distributions.", ko: "임베딩 정규화와 프롬프트 템플릿을 관리하고 문구·데이터 분포별 검색 또는 분류 성능을 측정합니다." },
    limitations: { en: "Web pairings are noisy and uneven; zero-shot performance depends on wording and may encode social biases in the training data.", ko: "웹 쌍 데이터는 잡음과 불균형이 있으며, Zero-shot 성능은 문구에 좌우되고 학습 데이터의 사회적 편향을 담을 수 있습니다." },
    takeaway: { en: "Language becomes a flexible interface to visual representations, but prompt robustness and dataset bias remain evaluation work.", ko: "언어는 시각 표현에 접근하는 유연한 인터페이스가 되지만 프롬프트 안정성과 데이터 편향은 별도 평가가 필요합니다." },
    flow: ["이미지 인코더", "공유 공간", "텍스트 인코더", "짝 비교"],
    onePager: ["데이터", "웹에서 이미지와 설명 문장 쌍을 모읍니다.", "학습", "올바른 쌍은 가깝게, 틀린 쌍은 멀게 합니다.", "추론", "텍스트 클래스 설명으로 Zero-shot 비교를 합니다.", "점검", "프롬프트 변형·편향·분포 변화를 평가합니다.", "주의할 점", "Zero-shot은 모든 시각 과제에서 견고함을 보장하지 않습니다."],
  },
  {
    id: "concept:denoising-diffusion", slug: "denoising-diffusion",
    canonicalName: { en: "Denoising diffusion", ko: "Denoising diffusion (노이즈 제거 확산)" },
    aliases: ["Denoising diffusion", "Diffusion model", "DDPM", "확산 모델", "디퓨전 모델"],
    domain: ["Generative Models", "Computer Vision"],
    dek: { en: "A diffusion model learns to reverse small noise steps and generate data from a simple noise distribution.", ko: "확산 모델은 작은 노이즈 단계를 되돌리는 법을 배워 단순 노이즈 분포에서 데이터를 생성합니다." },
    paperIds: ["arxiv:2006.11239"], paperTitle: { en: "Denoising Diffusion Probabilistic Models", ko: "노이즈 제거 확산 확률 모델" },
    figureUrl: "https://ar5iv.labs.arxiv.org/html/2006.11239/assets/images/celebahq256_header_image_4x4.png",
    figureAlt: { en: "Images generated by DDPM on CelebA-HQ and CIFAR-10.", ko: "DDPM이 CelebA-HQ와 CIFAR-10에서 생성한 이미지." },
    figureCaption: { en: "The model starts from noise and applies learned reverse transitions to form a sample.", ko: "모델은 노이즈에서 시작해 학습된 역방향 전이를 적용해 샘플을 만듭니다." },
    referenceUrl: "https://github.com/hojonathanho/diffusion",
    referenceLabel: { en: "Authors’ diffusion implementation", ko: "저자 확산 모델 구현" },
    definition: { en: "A diffusion model defines gradual corruption and learns a reverse process that removes noise to generate a sample.", ko: "확산 모델은 점진적 오염 과정을 정하고 노이즈를 제거하는 역방향 생성 과정을 학습합니다." },
    architecture: { en: "The forward Markov chain adds Gaussian noise according to a schedule; the learned reverse chain predicts transitions from noisy states toward data.", ko: "정방향 마르코프 체인은 일정에 따라 가우시안 노이즈를 더하고, 학습된 역방향 체인은 노이즈 상태에서 데이터로 향하는 전이를 예측합니다." },
    visualization: { en: "The paper connects the noise-prediction objective to denoising score matching and views sampling as progressive decoding.", ko: "논문은 노이즈 예측 목표를 Denoising score matching과 연결하고 샘플링을 점진적 디코딩으로 해석합니다." },
    comparison: { en: "Unlike one-pass generation, DDPM performs repeated denoising steps; this supports strong sample quality but increases sequential sampling work.", ko: "한 번에 생성하는 방식과 달리 DDPM은 노이즈 제거를 반복합니다. 샘플 품질을 높일 수 있지만 순차 계산량이 늘어납니다." },
    implementation: { en: "The noise schedule, prediction parameterization, number of sampling steps, and guidance method affect quality and latency.", ko: "노이즈 일정·예측 매개화·샘플링 단계 수·가이던스 방식이 품질과 지연 시간에 영향을 줍니다." },
    limitations: { en: "The original results are image-generation benchmarks and use iterative sampling. They do not establish universal speed, likelihood, controllability, or safety.", ko: "원 결과는 이미지 생성 벤치마크이며 반복 샘플링을 사용합니다. 보편적 속도·우도·제어 가능성·안전성을 입증하지 않습니다." },
    takeaway: { en: "Generation is learned as a sequence of local denoising decisions, trading sampling steps for high-quality outputs.", ko: "고품질 출력을 위해 여러 단계의 국소 노이즈 제거 결정을 학습하는 생성 방식입니다." },
    flow: ["데이터", "노이즈 추가", "역방향 예측", "반복 샘플"],
    onePager: ["정방향", "학습 데이터에 작은 노이즈를 차례로 더합니다.", "역방향", "노이즈 상태에서 원 데이터 방향으로 복원합니다.", "학습", "노이즈 제거를 예측하는 신경망을 최적화합니다.", "운영", "단계 수와 일정이 품질·지연 시간에 영향을 줍니다.", "주의할 점", "높은 품질이 빠른 샘플링을 뜻하지는 않습니다."],
  },
  {
    id: "concept:rgba-layer", slug: "rgba-layer",
    canonicalName: { en: "RGBA layer", ko: "RGBA 레이어" },
    aliases: ["RGBA layer", "RGBA 레이어"],
    domain: ["Computer Graphics", "Image Editing"],
    dek: { en: "An RGBA layer stores color and opacity for a full canvas so a visual element can be recomposed separately.", ko: "RGBA 레이어는 전체 캔버스의 색상과 불투명도를 저장해 시각 요소를 따로 합성할 수 있게 합니다." },
    paperIds: ["arxiv:2610.24738"], paperTitle: { en: "Editing Images into Reusable Layers via Compositional Edit-Prior Distillation", ko: "Compositional Edit-Prior Distillation으로 재사용 가능한 이미지 레이어 만들기" },
    figureUrl: "https://arxiv.org/html/2610.24738v1/appendix_2.png",
    figureAlt: { en: "LayerEditor output with a finished canvas alongside separated RGBA layers.", ko: "완성 캔버스와 분리된 RGBA 레이어를 함께 보여주는 LayerEditor 출력." },
    figureCaption: { en: "An RGBA layer carries RGB appearance and an alpha mask for later composition.", ko: "RGBA 레이어는 이후 합성을 위해 RGB 모양과 Alpha 마스크를 함께 저장합니다." },
    referenceUrl: "https://arxiv.org/abs/2610.24738v1",
    referenceLabel: { en: "LayerEditor original paper", ko: "LayerEditor 원 논문" },
    definition: { en: "An RGBA layer is a full-size image with red, green, blue, and alpha channels.", ko: "RGBA 레이어는 빨강·초록·파랑·알파 채널을 가진 전체 크기 이미지입니다." },
    architecture: { en: "RGB records appearance and alpha records per-pixel opacity; layer order determines which pixels cover others.", ko: "RGB는 모양을, Alpha는 픽셀별 불투명도를 기록하고 레이어 순서가 가려지는 영역을 정합니다." },
    visualization: { en: "LayerEditor predicts a direct edited canvas and an ordered RGBA stack; recomposition checks whether the stack explains the visible result.", ko: "LayerEditor는 편집 캔버스와 순서가 있는 RGBA 묶음을 예측하며, 다시 합쳐 시각 결과를 설명하는지 확인합니다." },
    comparison: { en: "A flattened RGB image is easy to display but loses element-level opacity and edit boundaries; RGBA layers preserve a reusable decomposition.", ko: "평탄화된 RGB는 표시하기 쉽지만 요소별 투명도와 편집 경계를 잃습니다. RGBA 레이어는 재사용 가능한 분해를 보존합니다." },
    implementation: { en: "Composite layers in a documented back-to-front order and test edges, transparency, empty masks, and recomposition at different backgrounds.", ko: "뒤에서 앞으로 순서를 명시해 합성하고 경계·투명도·빈 마스크·배경 변경 시 재합성을 시험합니다." },
    limitations: { en: "Layer structure does not make raster text editable as fonts or vectors. Moving elements can reveal missing pixels or artifacts at boundaries.", ko: "레이어 구조가 래스터 텍스트를 폰트·벡터로 바꾸지는 않습니다. 요소를 옮기면 빠진 픽셀이나 경계 결함이 드러날 수 있습니다." },
    takeaway: { en: "A reusable layer is useful only when its mask, ordering, and recomposed result survive the edits a user needs.", ko: "재사용 레이어는 마스크·순서·재합성 결과가 실제 사용자 편집을 견딜 때 유용합니다." },
    flow: ["RGB 색", "Alpha 마스크", "레이어 순서", "합성 캔버스"],
    onePager: ["채널", "RGB는 색, Alpha는 픽셀별 불투명도를 담습니다.", "구성", "각 레이어는 전체 캔버스 기준으로 정렬될 수 있습니다.", "합성", "순서와 Alpha 값으로 최종 화면을 계산합니다.", "점검", "경계·투명도·재배치 후 결과를 확인합니다.", "주의할 점", "레이어가 분리돼도 텍스트가 편집 가능한 폰트가 되지는 않습니다."],
  },
  {
    id: "concept:on-policy-distillation", slug: "on-policy-distillation",
    canonicalName: { en: "On-policy distillation", ko: "On-policy distillation (온폴리시 증류)" },
    aliases: ["On-policy distillation", "온폴리시 증류"],
    domain: ["Machine Learning", "Model Adaptation"],
    dek: { en: "A teacher supervises states visited by the student’s current policy rather than only a fixed offline trajectory.", ko: "교사가 고정 오프라인 경로만이 아니라 현재 학생 정책이 실제 방문한 상태를 지도합니다." },
    paperIds: ["arxiv:2610.24738"], paperTitle: { en: "Editing Images into Reusable Layers via Compositional Edit-Prior Distillation", ko: "Compositional Edit-Prior Distillation으로 재사용 가능한 이미지 레이어 만들기" },
    figureUrl: "https://arxiv.org/html/2610.24738v1/flowchart.png",
    figureAlt: { en: "LayerEditor training flow with a frozen editing teacher guiding the adapting student.", ko: "고정 편집 교사가 적응 중인 학생 모델을 지도하는 LayerEditor 학습 흐름." },
    figureCaption: { en: "The teacher is queried on intermediate states encountered by the student’s denoising trajectory.", ko: "교사는 학생의 디노이징 경로에서 실제로 거치는 중간 상태를 평가합니다." },
    referenceUrl: "https://arxiv.org/html/2610.24738v1",
    referenceLabel: { en: "LayerEditor method and figure", ko: "LayerEditor 방법과 그림" },
    definition: { en: "On-policy distillation queries a teacher on states produced by the student’s current behavior and transfers guidance there.", ko: "온폴리시 증류는 학생의 현재 동작이 만든 상태에서 교사를 호출해 그 지식을 전달합니다." },
    architecture: { en: "LayerEditor’s frozen teacher provides guidance along the adapting editor’s own denoising states, helping preserve the original edit prior.", ko: "LayerEditor의 고정 교사는 적응 중인 편집기가 실제로 거치는 디노이징 상태를 지도해 기존 편집 사전 지식을 보존하려 합니다." },
    visualization: { en: "The training diagram distinguishes the frozen teacher from the student that produces direct and layered image outputs.", ko: "학습 그림은 직접 이미지와 레이어 결과를 만드는 학생 모델과 고정 교사를 구분합니다." },
    comparison: { en: "Offline distillation uses a fixed teacher dataset; on-policy distillation evaluates the student’s current state distribution.", ko: "오프라인 증류는 고정 교사 데이터를 쓰고 온폴리시 증류는 학생의 현재 상태 분포를 평가합니다." },
    implementation: { en: "Teacher queries can be expensive; cache or sample them carefully and compare student-only, teacher-only, and combined objectives.", ko: "교사 호출은 비쌀 수 있어 캐시·표본 추출을 신중히 하고 학생 단독·교사 단독·결합 목표를 비교합니다." },
    limitations: { en: "The term describes where supervision is sampled, not a guarantee that behavior is preserved. The teacher’s coverage and loss design still matter.", ko: "이 용어는 지도를 표집하는 상태를 말할 뿐 동작 보존을 보장하지 않습니다. 교사의 범위와 손실 설계도 중요합니다." },
    takeaway: { en: "Distill where the student actually operates, then measure whether the teacher signal helps on the target output contract.", ko: "학생이 실제 동작하는 곳에서 증류하고 교사 신호가 목표 출력 품질을 돕는지 측정해야 합니다." },
    flow: ["학생 상태", "교사 평가", "지도 신호", "학생 업데이트"],
    onePager: ["무엇을 뜻하나", "학생 정책이 만든 상태에서 교사가 지도를 제공합니다.", "대비", "고정된 오프라인 상태만 쓰는 증류와 다릅니다.", "적용", "학생이 실제 방문하는 분포를 교사가 평가합니다.", "비용", "교사 호출과 상태 표집을 관리해야 합니다.", "주의할 점", "온폴리시라는 이름만으로 능력 보존이 보장되지는 않습니다."],
  },
  {
    id: "concept:ssim-fid", slug: "ssim-fid",
    canonicalName: { en: "SSIM and FID", ko: "SSIM과 FID" },
    aliases: ["SSIM / FID", "SSIM", "FID", "구조적 유사도", "프레셰 거리"],
    domain: ["Evaluation", "Computer Vision"],
    dek: { en: "SSIM and FID compare images from different perspectives; neither alone proves that an output is usable or editable.", ko: "SSIM과 FID는 이미지를 서로 다른 관점에서 비교하며, 어느 하나만으로 결과의 사용성·편집성을 입증하지는 못합니다." },
    paperIds: ["arxiv:2610.24738"], paperTitle: { en: "Editing Images into Reusable Layers via Compositional Edit-Prior Distillation", ko: "Compositional Edit-Prior Distillation으로 재사용 가능한 이미지 레이어 만들기" },
    figureUrl: "https://arxiv.org/html/2610.24738v1/appendix_2.png",
    figureAlt: { en: "LayerEditor qualitative examples showing edited composites and separated layers.", ko: "편집 합성 결과와 분리된 레이어를 보여주는 LayerEditor 정성 예시." },
    figureCaption: { en: "Visual examples complement metrics but do not replace random sampling and user editing tests.", ko: "시각 예시는 지표를 보완하지만 무작위 표본과 사용자 편집 시험을 대신하지 않습니다." },
    referenceUrl: "https://arxiv.org/html/2610.24738v1",
    referenceLabel: { en: "LayerEditor metrics and examples", ko: "LayerEditor 지표와 예시" },
    definition: { en: "SSIM estimates local structural similarity; FID compares feature distributions of generated and reference images.", ko: "SSIM은 국소 구조 유사도를 추정하고 FID는 생성 이미지와 기준 이미지의 특징 분포를 비교합니다." },
    architecture: { en: "Both reduce image sets to summary numbers but use different representations and respond differently to distortions and distribution shifts.", ko: "둘 다 이미지 집합을 요약 숫자로 만들지만 표현 방식이 달라 왜곡과 분포 변화에 다르게 반응합니다." },
    visualization: { en: "LayerEditor reports direct-image and recomposed-layer scores separately, because a polished direct image can hide weak layers.", ko: "LayerEditor는 완성 이미지와 레이어 재합성 점수를 구분해, 보기 좋은 직접 결과가 약한 레이어를 숨길 수 있음을 다룹니다." },
    comparison: { en: "SSIM is paired and structure-oriented; FID is distribution-oriented and usually computed over feature statistics from many samples.", ko: "SSIM은 이미지 쌍의 구조에 초점을 두고 FID는 여러 표본의 특징 통계로 분포를 비교합니다." },
    implementation: { en: "Keep dataset, preprocessing, resolution, and sample count fixed; report complementary metrics and inspect individual failures.", ko: "데이터셋·전처리·해상도·표본 수를 고정하고 보완 지표와 개별 실패 사례를 함께 확인합니다." },
    limitations: { en: "Neither metric directly measures semantic correctness, human preference, text editability, or whether layers survive downstream edits.", ko: "두 지표 모두 의미 정확성·사람 선호·텍스트 편집 가능성·후속 레이어 편집 내구성을 직접 측정하지 않습니다." },
    takeaway: { en: "Choose metrics for the decision being made and pair them with qualitative inspection and task-specific user tests.", ko: "의사결정에 맞는 지표를 고르고 정성 점검과 과제별 사용자 시험을 함께 사용해야 합니다." },
    flow: ["기준 이미지", "지표 계산", "다른 관점 비교", "사례 검토"],
    onePager: ["SSIM", "이미지 쌍의 구조적 유사도를 추정합니다.", "FID", "생성·기준 분포의 특징 통계를 비교합니다.", "사용", "보완적인 관점으로 함께 보고합니다.", "고정할 것", "전처리·해상도·표본 수를 통제합니다.", "주의할 점", "수치만으로 사용성이나 편집성을 입증할 수 없습니다."],
  },
];

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const paperReviews = new Map();
for (const file of readdirSync(paperRoot).filter((name) => name.endsWith(".md"))) {
  const metadata = parseReviewMetadata(readFileSync(path.join(paperRoot, file), "utf8"));
  paperReviews.set(String(metadata.canonicalId).replace(/v\d+$/, ""), metadata);
}

const registryPath = path.join(contentRoot, "registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
registry.termsIndex ??= [];
registry.paperTerms ??= [];
registry.paperConcepts ??= [];
registry.generationQueue ??= [];

for (const concept of concepts) {
  const sourcePaperReviews = concept.paperIds.map((paperId) => {
    const paper = paperReviews.get(paperId);
    if (!paper) throw new Error(`Missing paper review for ${paperId}.`);
    return { id: paperId, title: paper.title, reviewUrl: `/daily-brief/papers/${paper.slug}/`, url: `https://arxiv.org/abs/${paper.version}` };
  });
  const sourceUrls = concept.paperIds.map((paperId) => `https://arxiv.org/abs/${paperId.replace(/^arxiv:/, "")}`);
  const article = {
    id: concept.id,
    slug: concept.slug,
    canonicalName: concept.canonicalName,
    dek: concept.dek,
    domain: concept.domain,
    version: 1,
    lastUpdated: updatedAt,
    sourcePapers: concept.paperIds,
    sourcePaperReviews,
    relatedConcepts: [],
    visualAsset: {
      url: concept.figureUrl,
      alt: concept.figureAlt,
      caption: concept.figureCaption,
      credit: `Original figure by the paper authors; linked from ${sourceUrls[0]}.`,
      license: "See the license and reuse terms on the linked source paper.",
    },
    sections: [
      ["definition", { en: "Concept at a glance", ko: "개념 한눈에 보기" }, concept.definition],
      ["architecture", { en: "How it works", ko: "작동 방식" }, concept.architecture],
      ["visualization", { en: "Read the figure", ko: "그림 읽기" }, concept.visualization],
      ["comparison", { en: "Compare the idea", ko: "비교해서 보기" }, concept.comparison],
      ["implementation", { en: "Implementation notes", ko: "구현 점검" }, concept.implementation],
      ["limitations", { en: "Limits", ko: "한계" }, concept.limitations],
      ["takeaway", { en: "Takeaway", ko: "핵심 정리" }, concept.takeaway],
    ].map(([id, heading, paragraph]) => ({ id, heading, paragraphs: [paragraph] })),
    sources: [
      { label: { en: "Original paper", ko: "논문 원문" }, url: sourceUrls[0], publisher: "arXiv", type: "research-paper" },
      { label: concept.referenceLabel, url: concept.referenceUrl, publisher: new URL(concept.referenceUrl).hostname, type: "implementation-or-reference" },
    ],
    onePager: {
      title: concept.canonicalName.ko,
      subtitle: concept.dek.ko,
      oneLine: concept.takeaway.ko,
      sections: Array.from({ length: 5 }, (_, index) => ({ heading: concept.onePager[index * 2], body: concept.onePager[index * 2 + 1] })),
      flow: concept.flow,
      sources: sourceUrls,
      status: "ready",
      pdfPath: `/knowledge/${concept.slug}-one-pager.pdf`,
      docxPath: `/knowledge/${concept.slug}-one-pager.docx`,
    },
  };
  writeJson(path.join(contentRoot, `${concept.slug}.json`), article);

  const summary = {
    id: concept.id,
    slug: concept.slug,
    canonicalName: concept.canonicalName,
    dek: concept.dek,
    aliases: concept.aliases,
    domain: concept.domain,
    status: "published",
    version: 1,
    sourcePapers: concept.paperIds,
    relatedConcepts: [],
    briefPath: `/knowledge/article/?slug=${concept.slug}`,
    onePager: { status: "ready", pdfPath: article.onePager.pdfPath, docxPath: article.onePager.docxPath },
    lastUpdated: updatedAt,
    contentSource: "curated-seed-paper",
  };
  const summaryIndex = registry.concepts.findIndex((item) => item.id === concept.id);
  if (summaryIndex < 0) registry.concepts.push(summary);
  else registry.concepts[summaryIndex] = summary;

  const existingTerm = registry.termsIndex.find((item) => item.id === concept.id);
  const term = {
    id: concept.id,
    slug: concept.slug,
    canonicalName: concept.canonicalName,
    aliases: concept.aliases,
    definition: concept.definition,
    priorityScore: Math.max(existingTerm?.priorityScore ?? 0, 100),
    sourcePapers: [...new Set([...(existingTerm?.sourcePapers ?? []), ...concept.paperIds])],
    firstSeenAt: existingTerm?.firstSeenAt ?? timestamp,
    lastSeenAt: timestamp,
    briefStatus: "published",
  };
  const termIndex = registry.termsIndex.findIndex((item) => item.id === concept.id);
  if (termIndex < 0) registry.termsIndex.push(term);
  else registry.termsIndex[termIndex] = term;

  for (const paperId of concept.paperIds) {
    if (!registry.paperConcepts.some((edge) => edge.paperId === paperId && edge.conceptId === concept.id)) {
      registry.paperConcepts.push({ paperId, conceptId: concept.id, relation: "EXPLAINS", evidence: concept.takeaway.ko });
    }
    const url = `https://arxiv.org/abs/${paperId.replace(/^arxiv:/, "")}`;
    if (!registry.paperTerms.some((edge) => edge.paperId === paperId && edge.termId === concept.id)) {
      registry.paperTerms.push({ paperId, termId: concept.id, definition: concept.definition, context: concept.visualization, priorityScore: 100, sourceUrls: [url], createdAt: timestamp });
    }
  }

  const queued = registry.generationQueue.find((item) => item.conceptId === concept.id);
  if (queued) {
    queued.status = "published";
    queued.sourcePapers = [...new Set([...(queued.sourcePapers ?? []), ...concept.paperIds])];
    queued.updatedAt = timestamp;
  } else {
    registry.generationQueue.push({ conceptId: concept.id, priorityScore: 100, sourcePapers: concept.paperIds, status: "published", createdAt: timestamp, updatedAt: timestamp });
  }
}

registry.concepts.sort((a, b) => a.canonicalName.en.localeCompare(b.canonicalName.en));
registry.termsIndex.sort((a, b) => b.priorityScore - a.priorityScore || a.canonicalName.en.localeCompare(b.canonicalName.en));
registry.generationQueue.sort((a, b) => b.priorityScore - a.priorityScore || a.conceptId.localeCompare(b.conceptId));
writeJson(registryPath, registry);

const jobsPath = path.join(contentRoot, "jobs.json");
const jobs = JSON.parse(readFileSync(jobsPath, "utf8"));
const existingCuration = jobs.jobs.find((job) => job.idempotencyKey === "curation:foundational-papers:2026-10-25:v1");
if (!existingCuration) jobs.jobs.push({
  id: "local-foundational-papers-knowledge-v1",
  idempotencyKey: "curation:foundational-papers:2026-10-25:v1",
  paperId: "collection:foundational-papers-2026-10-25",
  status: "published",
  environment: "local-validation",
  selectedConceptIds: concepts.map((concept) => concept.id),
  termsSeen: concepts.length,
  newConcepts: concepts.length,
  modelCalls: 0,
  estimatedTokens: 0,
  startedAt: timestamp,
  finishedAt: timestamp,
  message: `Curated ${concepts.length} bilingual source-linked Knowledge Briefs from the ten foundational papers and completed the prior pending terms. No model call or cloud job was used.`,
});
const initialJob = jobs.jobs.find((job) => job.idempotencyKey === "paper:arxiv:2610.24738:knowledge:v1");
if (initialJob) initialJob.message = "Initial terminology indexing is complete; all four queued terms now have curated, published Knowledge Briefs. No model call or cloud job was used.";
writeJson(jobsPath, jobs);

console.log(JSON.stringify({ papers: 10, curatedConcepts: concepts.length, publishedConcepts: registry.concepts.length, pendingTerms: registry.termsIndex.filter((term) => term.briefStatus !== "published").length }));
