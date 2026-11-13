import { type CodePoint } from "@keybr/unicode";
import { Attr, type Char } from "./chars.ts";

export type MoraToken = {
  readonly kana: string;
  readonly codePoint: CodePoint;
  readonly codePoints: readonly CodePoint[];
  readonly defaultRomaji: string;
  readonly validRomaji: readonly string[];
};

export type AutomatonStep = {
  readonly kana: string;
  readonly codePoint: CodePoint;
  readonly codePoints: readonly CodePoint[];
  readonly typedRomaji: string;
  readonly typo: boolean;
};

// Standard Romaji mappings supporting Kunrei-shiki (default) and Hepburn-shiki, plus shortcuts.
const KANA_MAP: Record<string, string[]> = {
  // Vowels
  "あ": ["a"],
  "い": ["i", "yi"],
  "う": ["u", "wu"],
  "え": ["e"],
  "お": ["o"],

  // Ka line
  "か": ["ka", "ca"],
  "き": ["ki"],
  "く": ["ku", "cu", "qu"],
  "け": ["ke"],
  "こ": ["ko", "co"],

  // Sa line (Kunrei: si, Hepburn: shi)
  "さ": ["sa"],
  "し": ["si", "shi", "ci"],
  "す": ["su"],
  "せ": ["se", "ce"],
  "そ": ["so"],

  // Ta line (Kunrei: ti/tu, Hepburn: chi/tsu)
  "た": ["ta"],
  "ち": ["ti", "chi"],
  "つ": ["tu", "tsu"],
  "て": ["te"],
  "と": ["to"],

  // Na line
  "な": ["na"],
  "に": ["ni"],
  "ぬ": ["nu"],
  "ね": ["ne"],
  "の": ["no"],

  // Ha line (Kunrei: hu, Hepburn: fu)
  "は": ["ha"],
  "ひ": ["hi"],
  "ふ": ["hu", "fu"],
  "へ": ["he"],
  "ほ": ["ho"],

  // Ma line
  "ま": ["ma"],
  "み": ["mi"],
  "む": ["mu"],
  "め": ["me"],
  "も": ["mo"],

  // Ya line
  "や": ["ya"],
  "ゆ": ["yu"],
  "よ": ["yo"],

  // Ra line
  "ら": ["ra"],
  "り": ["ri"],
  "る": ["ru"],
  "れ": ["re"],
  "ろ": ["ro"],

  // Wa line
  "わ": ["wa"],
  "を": ["wo"],
  "ん": ["nn", "xn"],

  // Voiced: Ga line
  "が": ["ga"],
  "ぎ": ["gi"],
  "ぐ": ["gu"],
  "げ": ["ge"],
  "ご": ["go"],

  // Voiced: Za line (Kunrei: zi, Hepburn: ji)
  "ざ": ["za"],
  "じ": ["zi", "ji"],
  "ず": ["zu"],
  "ぜ": ["ze"],
  "ぞ": ["zo"],

  // Voiced: Da line (Kunrei: di/du, Hepburn: ji/zu)
  "だ": ["da"],
  "ぢ": ["di", "ji"],
  "づ": ["du", "zu"],
  "で": ["de"],
  "ど": ["do"],

  // Voiced: Ba line
  "ば": ["ba"],
  "び": ["bi"],
  "ぶ": ["bu"],
  "べ": ["be"],
  "ぼ": ["bo"],

  // Semi-voiced: Pa line
  "ぱ": ["pa"],
  "ぴ": ["pi"],
  "ぷ": ["pu"],
  "ぺ": ["pe"],
  "ぽ": ["po"],

  // Prolonged sound mark (Chouonpu)
  "ー": ["-"],
  "-": ["-"],

  // Contracted sounds (Youon)
  "きゃ": ["kya"],
  "きゅ": ["kyu"],
  "きょ": ["kyo"],
  "しゃ": ["sya", "sha"],
  "しゅ": ["syu", "shu"],
  "しょ": ["syo", "sho"],
  "ちゃ": ["tya", "cha", "cya"],
  "ちゅ": ["tyu", "chu", "cyu"],
  "ちょ": ["tyo", "cho", "cyo"],
  "にゃ": ["nya"],
  "にゅ": ["nyu"],
  "にょ": ["nyo"],
  "ひゃ": ["hya"],
  "ひゅ": ["hyu"],
  "ひょ": ["hyo"],
  "みゃ": ["mya"],
  "みゅ": ["myu"],
  "みょ": ["myo"],
  "りゃ": ["rya"],
  "りゅ": ["ryu"],
  "りょ": ["ryo"],
  "ぎゃ": ["gya"],
  "ぎゅ": ["gyu"],
  "ぎょ": ["gyo"],
  "じゃ": ["zya", "ja", "jya"],
  "じゅ": ["zyu", "ju", "jyu"],
  "じょ": ["zyo", "jo", "jyo"],
  "ぢゃ": ["dya", "ja"],
  "ぢゅ": ["dyu", "ju"],
  "ぢょ": ["dyo", "jo"],
  "びゃ": ["bya"],
  "びゅ": ["byu"],
  "びょ": ["byo"],
  "ぴゃ": ["pya"],
  "ぴゅ": ["pyu"],
  "ぴょ": ["pyo"],

  // Foreign morae
  "ふぁ": ["fa", "fwa", "huxa"],
  "ふぃ": ["fi", "fwi", "huxi"],
  "ふぇ": ["fe", "fwe", "huxe"],
  "ふぉ": ["fo", "fwo", "huxo"],
  "てぃ": ["thi", "texi", "teli"],
  "でぃ": ["dhi", "dexi", "deli"],
  "うぃ": ["wi", "uxi", "uli"],
  "うぇ": ["we", "uxe", "ule"],
  "うぉ": ["who", "uxo", "ulo"],

  // Small kana
  "っ": ["xtu", "ltu", "xtsu", "ltsu"],
  "ぁ": ["xa", "la"],
  "ぃ": ["xi", "li"],
  "ぅ": ["xu", "lu"],
  "ぇ": ["xe", "le"],
  "ぉ": ["xo", "lo"],
  "ゃ": ["xya", "lya"],
  "ゅ": ["xyu", "lyu"],
  "ょ": ["xyo", "lyo"],

  // Extended foreign sounds (e.g. for Katakana loanwords)
  "ゔ": ["vu"],
  "ゔぁ": ["va"],
  "ゔぃ": ["vi"],
  "ゔぇ": ["ve"],
  "ゔぉ": ["vo"],
  "とぅ": ["twu"],
  "どぅ": ["dwu"],
  "しぇ": ["she", "sye"],
  "じぇ": ["je", "zye", "jye"],
  "ちぇ": ["che", "tye", "cye"],

  // Punctuation and symbols
  "、": [","],
  ",": [","],
  "。": ["."],
  ".": ["."],
  "・": ["/"],
  "／": ["/"],
  "/": ["/"],
  "！": ["!"],
  "!": ["!"],
  "？": ["?"],
  "?": ["?"],
  "〜": ["~"],
  "~": ["~"],
  "：": [":"],
  ":": [":"],
  "；": [";"],
  ";": [";"],
  "「": ["["],
  "[": ["["],
  "」": ["]"],
  "]": ["]"],

  // Space
  " ": [" "],
};

export class KanaAutomaton {
  readonly tokens: readonly MoraToken[];
  #tokenIndex = 0;
  #currentBuffer = "";
  #activeCandidate: string | null = null;
  #typo = false;
  #history: AutomatonStep[] = [];

  constructor(text: string) {
    this.tokens = Object.freeze(tokenizeKana(text));
  }

  get tokenIndex(): number {
    return this.#tokenIndex;
  }

  get isCompleted(): boolean {
    return this.#tokenIndex >= this.tokens.length;
  }

  get currentToken(): MoraToken | null {
    return this.tokens[this.#tokenIndex] ?? null;
  }

  get currentBuffer(): string {
    return this.#currentBuffer;
  }

  get history(): readonly AutomatonStep[] {
    return this.#history;
  }

  reset(): void {
    this.#tokenIndex = 0;
    this.#currentBuffer = "";
    this.#activeCandidate = null;
    this.#typo = false;
    this.#history = [];
  }

  backspace(): boolean {
    if (this.#currentBuffer.length > 0) {
      this.#currentBuffer = this.#currentBuffer.slice(0, -1);
      if (this.#currentBuffer.length === 0) {
        this.#activeCandidate = null;
      }
      return true;
    }
    return false;
  }

  /** Returns valid next characters that would advance input without error. */
  get nextValidChars(): string[] {
    if (this.isCompleted) return [];
    const token = this.tokens[this.#tokenIndex];
    const nextToken = this.tokens[this.#tokenIndex + 1] ?? null;

    const set = new Set<string>();
    const candidates = this.#getAllCandidates(token, nextToken);

    for (const cand of candidates) {
      if (
        cand.startsWith(this.#currentBuffer) &&
        cand.length > this.#currentBuffer.length
      ) {
        set.add(cand[this.#currentBuffer.length]);
      }
    }
    return [...set];
  }

  /**
   * Primary next Latin code point for highlighting on the virtual keyboard.
   */
  get nextCodePoint(): CodePoint | null {
    const chars = this.nextValidChars;
    return chars.length > 0 ? chars[0].codePointAt(0)! : null;
  }

  /**
   * Feeds a single typed character.
   * Returns an AutomatonStep if a mora was completed, or null if matched partially or typo.
   */
  feed(char: string): {
    success: boolean;
    completedMora: AutomatonStep | null;
  } {
    if (this.isCompleted) {
      return { success: false, completedMora: null };
    }

    const token = this.tokens[this.#tokenIndex];
    const nextToken = this.tokens[this.#tokenIndex + 1] ?? null;
    const testBuffer = this.#currentBuffer + char;
    const candidates = this.#getAllCandidates(token, nextToken);

    // Check if testBuffer is a prefix of any candidate
    const matching = candidates.filter((c) => c.startsWith(testBuffer));

    if (matching.length === 0) {
      // Special case: Single 'n' for ん/ン followed by consonant of next mora!
      if (
        toHiragana(token.kana) === "ん" &&
        this.#currentBuffer === "n" &&
        nextToken != null &&
        canFollowSingleN(nextToken, char)
      ) {
        // Complete 'ん' using single 'n'
        const completed: AutomatonStep = {
          kana: token.kana,
          codePoint: token.codePoint,
          codePoints: token.codePoints,
          typedRomaji: "n",
          typo: this.#typo,
        };
        this.#history.push(completed);
        this.#tokenIndex += 1;
        this.#currentBuffer = "";
        this.#activeCandidate = null;
        this.#typo = false;

        // Now feed the consonant to the next token
        const nextRes = this.feed(char);
        return {
          success: true,
          completedMora: completed, // First completed mora
        };
      }

      this.#typo = true;
      return { success: false, completedMora: null };
    }

    // Success! Update buffer
    this.#currentBuffer = testBuffer;
    this.#activeCandidate = matching[0];

    // Check if any candidate is an exact match
    const exact = matching.find((c) => c === testBuffer);
    if (exact != null) {
      const step: AutomatonStep = {
        kana: token.kana,
        codePoint: token.codePoint,
        codePoints: token.codePoints,
        typedRomaji: exact,
        typo: this.#typo,
      };
      this.#history.push(step);
      this.#tokenIndex += 1;
      this.#currentBuffer = "";
      this.#activeCandidate = null;
      this.#typo = false;
      return { success: true, completedMora: step };
    }

    return { success: true, completedMora: null };
  }

  getKanaChars(): Char[] {
    const chars: Char[] = [];
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      let attrs = Attr.Normal;
      if (i < this.#tokenIndex) {
        const step = this.#history[i];
        attrs = step?.typo ? Attr.Miss : Attr.Hit;
      } else if (i === this.#tokenIndex) {
        attrs = this.#typo ? Attr.Miss : Attr.Cursor;
      }
      for (const ch of token.kana) {
        chars.push({
          codePoint: ch.codePointAt(0)!,
          attrs,
          cls: null,
        });
      }
    }
    return chars;
  }

  getRomajiChars(): Char[] {
    const chars: Char[] = [];
    for (let i = 0; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      if (i < this.#tokenIndex) {
        const step = this.#history[i];
        const romaji = step ? step.typedRomaji : token.defaultRomaji;
        const attrs = step?.typo ? Attr.Miss : Attr.Hit;
        for (const ch of romaji) {
          chars.push({
            codePoint: ch.codePointAt(0)!,
            attrs,
            cls: null,
          });
        }
      } else if (i === this.#tokenIndex) {
        const cand = this.#activeCandidate ?? token.defaultRomaji;
        for (let j = 0; j < cand.length; j++) {
          const ch = cand[j];
          let attrs = Attr.Normal;
          if (j < this.#currentBuffer.length) {
            attrs = Attr.Hit;
          } else if (j === this.#currentBuffer.length) {
            attrs = this.#typo ? Attr.Miss : Attr.Cursor;
          }
          chars.push({
            codePoint: ch.codePointAt(0)!,
            attrs,
            cls: null,
          });
        }
      } else {
        const romaji = token.defaultRomaji;
        for (const ch of romaji) {
          chars.push({
            codePoint: ch.codePointAt(0)!,
            attrs: Attr.Normal,
            cls: null,
          });
        }
      }
    }
    return chars;
  }

  getRemainingChars(): Char[] {
    const chars: Char[] = [];
    if (this.isCompleted) return chars;

    // Current token remaining chars
    const curToken = this.tokens[this.#tokenIndex];
    const curCand = this.#activeCandidate ?? curToken.defaultRomaji;
    for (let j = this.#currentBuffer.length; j < curCand.length; j++) {
      chars.push({
        codePoint: curCand.charCodeAt(j),
        attrs: Attr.Normal,
        cls: null,
      });
    }

    // Future tokens
    for (let i = this.#tokenIndex + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i];
      for (let j = 0; j < token.defaultRomaji.length; j++) {
        chars.push({
          codePoint: token.defaultRomaji.charCodeAt(j),
          attrs: Attr.Normal,
          cls: null,
        });
      }
    }
    return chars;
  }

  #getAllCandidates(token: MoraToken, nextToken: MoraToken | null): string[] {
    const list = [...token.validRomaji];

    // Special case for 'っ'/'ッ': can be double of next consonant
    if (toHiragana(token.kana) === "っ" && nextToken != null) {
      for (const nextRomaji of nextToken.validRomaji) {
        const first = nextRomaji[0];
        if (first && /[bcdfghjklmnpqrstvwxyz]/.test(first)) {
          list.push(first);
        }
      }
    }

    return list;
  }
}

function canFollowSingleN(nextToken: MoraToken, nextChar: string): boolean {
  for (const r of nextToken.validRomaji) {
    if (r.startsWith(nextChar)) {
      const first = r[0];
      if (
        first !== "a" &&
        first !== "i" &&
        first !== "u" &&
        first !== "e" &&
        first !== "o" &&
        first !== "y" &&
        first !== "n"
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Converts Katakana characters (ァ-ヶ) to Hiragana (ぁ-ゖ) for lookup. */
function toHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60),
  );
}

/** Tokenizes input Japanese string into morae tokens. */
export function tokenizeKana(text: string): MoraToken[] {
  const tokens: MoraToken[] = [];
  let i = 0;

  while (i < text.length) {
    // Check 2-character contracted sounds first (e.g. しゃ, きょ, ふぁ, キャ, ティ)
    if (i + 1 < text.length) {
      const pair = text.substring(i, i + 2);
      const normalizedPair = toHiragana(pair);
      if (KANA_MAP[normalizedPair]) {
        const valid = KANA_MAP[normalizedPair];
        tokens.push({
          kana: pair,
          codePoint: pair.codePointAt(0)!,
          codePoints: [pair.codePointAt(0)!, pair.codePointAt(1)!],
          defaultRomaji: valid[0],
          validRomaji: valid,
        });
        i += 2;
        continue;
      }
    }

    // Single character
    const ch = text[i];
    const normalizedCh = toHiragana(ch);
    const valid = KANA_MAP[normalizedCh] ?? [ch];
    tokens.push({
      kana: ch,
      codePoint: ch.codePointAt(0)!,
      codePoints: [ch.codePointAt(0)!],
      defaultRomaji: valid[0],
      validRomaji: valid,
    });
    i += 1;
  }

  return tokens;
}
