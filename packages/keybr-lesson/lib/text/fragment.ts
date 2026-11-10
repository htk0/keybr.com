import { type Settings } from "@keybr/settings";
import { lessonProps } from "../settings.ts";
import { type WordGenerator } from "./words.ts";

function getWordWeight(word: string): number {
  let weight = 0;
  for (const ch of word) {
    const code = ch.codePointAt(0) ?? 0;
    // Japanese Hiragana, Katakana, CJK Ideographs, Fullwidth forms
    if (
      (code >= 0x3040 && code <= 0x30ff) ||
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3000 && code <= 0x303f) ||
      (code >= 0xff00 && code <= 0xff60)
    ) {
      // 1 Japanese kana requires ~2 keystrokes in Romaji
      weight += 2;
    } else {
      weight += 1;
    }
  }
  return weight;
}

export function generateFragment(
  settings: Settings,
  nextWord: WordGenerator,
  { repeatWords = 1 }: { readonly repeatWords?: number } = {},
): string {
  const length = 100 + Math.round(settings.get(lessonProps.length) * 100);
  const words: string[] = [];
  let totalWeight = 0;
  while (true) {
    const word = nextWord() || "?";
    for (let i = 1; i <= repeatWords; i++) {
      words.push(word);
      totalWeight += getWordWeight(word);
      if (totalWeight >= length) {
        return words.join(" ");
      }
    }
  }
}
