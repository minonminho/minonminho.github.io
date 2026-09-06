export type TalentEcosystem = {
  id: string;
  label: string;
  keywords: readonly string[];
  repositories: readonly string[];
};

// Keep this allowlist curated. User input selects an ecosystem; it never becomes
// an arbitrary GitHub API path.
export const TALENT_ECOSYSTEMS: readonly TalentEcosystem[] = [
  {
    id: "trading-infrastructure",
    label: "Trading Infrastructure",
    keywords: [
      "trading",
      "exchange",
      "market making",
      "execution",
      "low latency",
      "quant",
      "market data",
    ],
    repositories: [
      "hummingbot/hummingbot",
      "freqtrade/freqtrade",
      "ccxt/ccxt",
      "CryptoFeed/Cryptofeed",
    ],
  },
  {
    id: "crypto-infrastructure",
    label: "Crypto Infrastructure",
    keywords: [
      "crypto",
      "blockchain",
      "ethereum",
      "bitcoin",
      "solana",
      "web3",
      "defi",
    ],
    repositories: [
      "ApeWorX/web3.py",
      "ethereum/go-ethereum",
      "CryptoFeed/Cryptofeed",
    ],
  },
] as const;

export const DEFAULT_ECOSYSTEM_ID = "trading-infrastructure";

export function getTalentEcosystem(id: string) {
  return TALENT_ECOSYSTEMS.find((ecosystem) => ecosystem.id === id);
}
