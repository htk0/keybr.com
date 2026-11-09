/* eslint-disable n/no-extraneous-import */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import { Language } from "@keybr/keyboard";
import { TransitionTableBuilder } from "@keybr/phonetic-model";

const rootDir = resolve(import.meta.dirname, "..");
const dictPath = resolve(
  rootDir,
  "packages/keybr-generators/dictionaries/dictionary-ja-kana.csv.gz",
);
const modelPath = resolve(
  rootDir,
  "packages/keybr-phonetic-model/assets/model-ja.data",
);
const wordsPath = resolve(
  rootDir,
  "packages/keybr-content-words/lib/data/words-ja.json",
);

const language = Language.JA;
const { alphabet } = language;

console.log("Reading dictionary from", dictPath);
const rawCsv = gunzipSync(readFileSync(dictPath)).toString("utf-8");

type WordEntry = [string, number];
const rawEntries: WordEntry[] = [];

for (const line of rawCsv.split("\n").slice(1)) {
  const commaIdx = line.lastIndexOf(",");
  if (commaIdx <= 0) continue;
  const word = line.slice(0, commaIdx).trim();
  const count = parseFloat(line.slice(commaIdx + 1).trim());
  if (word && !isNaN(count) && count > 0) {
    if (language.test(word)) {
      rawEntries.push([word, count]);
    }
  }
}

console.log(`Loaded ${rawEntries.length} valid Japanese Hiragana words.`);

// Boost words containing 'ー' so the user trains the prolonged sound mark early and often!
const boostedEntries: WordEntry[] = rawEntries.map(([word, count]) => {
  if (word.includes("ー")) {
    return [word, count * 5]; // 5x boost for prolonged sound mark training!
  }
  return [word, count];
});

boostedEntries.sort((a, b) => b[1] - a[1]);
const slice = boostedEntries.slice(0, 10000);

// Normalize counts to integer frequencies
const maxCount = slice[0][1];
const normalizedSlice: WordEntry[] = slice.map(([word, count]) => [
  word,
  Math.max(1, Math.round((count / maxCount) * 1000)),
]);

console.log(`Top 15 words:`);
for (const [w, c] of normalizedSlice.slice(0, 15)) {
  console.log(`  ${w}: ${c}`);
}

// Generate Transition Table & Phonetic Model
console.log("Building transition table...");
const builder = new TransitionTableBuilder(4, [0x0020, ...alphabet]);
for (const [word, count] of normalizedSlice) {
  if (word.length >= 2) {
    for (let i = 0; i < count; i++) {
      builder.append(word);
    }
  }
}

const table = builder.build();
const letters = table.letters(language);
console.log(`Letters count: ${letters.length}`);
for (const letter of letters) {
  if (letter.f === 0) {
    console.warn(`No data for letter "${letter}"`);
  }
}

const dashLetter = letters.find((l) => l.codePoint === 0x30fc);
console.log(
  `Prolonged mark 'ー' frequency: ${dashLetter ? dashLetter.f : "NOT FOUND"}`,
);

const data = table.compress();
writeFileSync(modelPath, data);
console.log(`Generated model at ${modelPath} (${data.length} bytes)`);

// Generate Word List
const wordList = slice.map(([word]) => word);
writeFileSync(wordsPath, JSON.stringify(wordList, null, 2));
console.log(`Generated word list at ${wordsPath} (${wordList.length} words)`);
