import fs from "node:fs";
import zlib from "node:zlib";

// Kana to Romaji mapping table
const KANA_MAP = {
  // Yoon (contracted sounds)
  きゃ: "kya",
  きゅ: "kyu",
  きょ: "kyo",
  しゃ: "sha",
  しゅ: "shu",
  しょ: "sho",
  ちゃ: "cha",
  ちゅ: "chu",
  ちょ: "cho",
  にゃ: "nya",
  にゅ: "nyu",
  にょ: "nyo",
  ひゃ: "hya",
  ひゅ: "hyu",
  ひょ: "hyo",
  みゃ: "mya",
  みゅ: "myu",
  みょ: "myo",
  りゃ: "rya",
  りゅ: "ryu",
  りょ: "ryo",
  ぎゃ: "gya",
  ぎゅ: "gyu",
  ぎょ: "gyo",
  じゃ: "ja",
  じゅ: "ju",
  じょ: "jo",
  びゃ: "bya",
  びゅ: "byu",
  びょ: "byo",
  ぴゃ: "pya",
  ぴゅ: "pyu",
  ぴょ: "pyo",
  ふぁ: "fa",
  ふぃ: "fi",
  ふぇ: "fe",
  ふぉ: "fo",
  てぃ: "ti",
  でぃ: "di",
  ちぇ: "che",
  じぇ: "je",
  しぇ: "she",
  うぃ: "wi",
  うぇ: "we",
  うぉ: "wo",
  ゔ: "v",
  ヴ: "v",

  // Gojuon & Dakuon & Handakuon
  あ: "a",
  い: "i",
  う: "u",
  え: "e",
  お: "o",
  か: "ka",
  き: "ki",
  く: "ku",
  け: "ke",
  こ: "ko",
  さ: "sa",
  し: "shi",
  す: "su",
  せ: "se",
  そ: "so",
  た: "ta",
  ち: "chi",
  つ: "tsu",
  て: "te",
  と: "to",
  な: "na",
  に: "ni",
  ぬ: "nu",
  ね: "ne",
  の: "no",
  は: "ha",
  ひ: "hi",
  ふ: "fu",
  へ: "he",
  ほ: "ho",
  ま: "ma",
  み: "mi",
  む: "mu",
  め: "me",
  も: "mo",
  や: "ya",
  ゆ: "yu",
  よ: "yo",
  ら: "ra",
  り: "ri",
  る: "ru",
  れ: "re",
  ろ: "ro",
  わ: "wa",
  を: "wo",
  ん: "n",
  が: "ga",
  ぎ: "gi",
  ぐ: "gu",
  げ: "ge",
  ご: "go",
  ざ: "za",
  じ: "ji",
  ず: "zu",
  ぜ: "ze",
  ぞ: "zo",
  だ: "da",
  ぢ: "ji",
  づ: "zu",
  で: "de",
  ど: "do",
  ば: "ba",
  び: "bi",
  ぶ: "bu",
  べ: "be",
  ぼ: "bo",
  ぱ: "pa",
  ぴ: "pi",
  ぷ: "pu",
  ぺ: "pe",
  ぽ: "po",
  ぁ: "a",
  ぃ: "i",
  ぅ: "u",
  ぇ: "e",
  ぉ: "o",
  ゃ: "ya",
  ゅ: "yu",
  ょ: "yo",

  // Prolonged sound mark (伸ばし棒) -> hyphen-minus
  ー: "-",
};

function kanaToRomaji(kana) {
  let result = "";
  let i = 0;
  while (i < kana.length) {
    if (kana[i] === "っ") {
      const nextKana = kana.slice(i + 1, i + 3);
      let nextRomaji = KANA_MAP[nextKana] || KANA_MAP[kana[i + 1]];
      if (nextRomaji) {
        result += nextRomaji[0];
      }
      i++;
      continue;
    }
    const two = kana.slice(i, i + 2);
    if (KANA_MAP[two]) {
      result += KANA_MAP[two];
      i += 2;
      continue;
    }
    const one = kana[i];
    if (KANA_MAP[one]) {
      result += KANA_MAP[one];
      i++;
      continue;
    }
    result += one;
    i++;
  }
  return result;
}

// Backup original kana dictionary if not already backed up
const dictPath = "packages/keybr-generators/dictionaries/dictionary-ja.csv.gz";
const backupKanaPath =
  "packages/keybr-generators/dictionaries/dictionary-ja-kana.csv.gz";
if (!fs.existsSync(backupKanaPath)) {
  fs.copyFileSync(dictPath, backupKanaPath);
}

const input = zlib.gunzipSync(fs.readFileSync(backupKanaPath)).toString("utf8");
const lines = input.split("\n");
const wordMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const parts = line.split(",");
  const kana = parts[0];
  const freq = parseFloat(parts[1]) || 1;
  const romaji = kanaToRomaji(kana).toLowerCase();
  if (
    /^[a-z-]+$/.test(romaji) &&
    romaji.length >= 2 &&
    !romaji.startsWith("-")
  ) {
    wordMap.set(romaji, (wordMap.get(romaji) || 0) + freq);
  }
}

// Curated high-frequency Katakana words with prolonged sound mark (伸ばし棒: -)
const essentialChoonWords = [
  // Tech & Computer
  ["sa-ba-", 8000],
  ["yu-za-", 8000],
  ["ki-bo-do", 7500],
  ["de-ta", 7500],
  ["pe-ji", 7500],
  ["me-ru", 7500],
  ["inta-netto", 7000],
  ["de-ta-be-su", 6500],
  ["so-sukodo", 6000],
  ["purattofo-mu", 6000],
  ["monita-", 5500],
  ["purinta-", 5500],
  ["supi-ka-", 5500],
  ["bura-za-", 5500],
  ["ko-do", 5500],
  ["fo-mu", 5000],
  ["erebe-ta-", 4500],
  ["esukare-ta-", 4500],
  ["sekyuriti-", 4500],
  ["kuoriti-", 4500],
  ["komyuniti-", 4500],
  ["onrain", 4500],
  ["no-to-pasokon", 4000],
  ["ba-jyon", 4000],
  ["o-pun", 4000],
  ["kurauto", 4000],
  ["reba-reji", 3500],
  ["ha-do-uea", 3500],
  ["sofuto-uea", 3500],

  // Food & Drink
  ["ko-hi-", 8500],
  ["ra-men", 8000],
  ["ke-ki", 7500],
  ["kare-", 6000],
  ["bi-ru", 6000],
  ["jyu-su", 5500],
  ["su-pu", 5500],
  ["do-natsu", 5000],
  ["to-suto", 5000],
  ["yo-guruto", 5000],
  ["bata-", 4500],
  ["a-mondo", 4000],

  // Daily life, Shopping & Services
  ["sa-bisu", 8500],
  ["senta-", 8000],
  ["enerugi-", 7000],
  ["guru-pu", 7000],
  ["ime-ji", 7000],
  ["ka-do", 7000],
  ["ke-su", 7000],
  ["ge-mu", 7000],
  ["chi-mu", 7000],
  ["te-ma", 6500],
  ["ho-mupe-ji", 6500],
  ["ko-su", 6500],
  ["me-ka-", 6500],
  ["pa-sento", 6500],
  ["su-pa-", 6000],
  ["no-to", 6000],
  ["bo-ru", 6000],
  ["supo-tsu", 6000],
  ["chansu", 5500],
  ["tawa-", 5500],
  ["ru-ru", 5500],
  ["rebyu-", 5500],
  ["kaba-", 5000],
  ["ko-to", 5000],
  ["ro-do", 5000],
  ["su-tsu", 5000],
  ["te-pu", 5000],
  ["se-ru", 5000],
  ["nyu-su", 5000],
  ["pu-ru", 5000],
  ["ku-ra-", 4500],
  ["sukri-n", 4500],
  ["ro-karu", 4500],
  ["reba-", 4500],
  ["bu-tsu", 4500],
  ["shu-zu", 4500],
  ["bo-do", 4500],
  ["ko-na-", 4500],
  ["mo-ta-", 4500],
  ["re-ru", 4000],
  ["pawa-", 4000],
  ["suka-to", 4000],
  ["ta-getto", 4000],
  ["cha-to", 4000],
  ["yu-moa", 4000],
  ["ri-da-", 4000],
  ["ma-ketingu", 4000],
  ["kara-", 4000],
  ["bodi-", 4000],
  ["fe-su", 3500],
  ["su-pi-do", 3500],
  ["pa-kingu", 3500],
  ["ku-pon", 3500],
  ["me-nyu-", 3500],
  ["bo-nasu", 3500],
  ["ko-chi", 3500],
  ["bu-mu", 3500],
  ["fa-suto", 3500],
  ["ra-ji", 3500],
  ["sumo-ru", 3500],
  ["ku-ru", 3500],
  ["ho-mu", 3500],
  ["ru-mu", 3500],
  ["ka-ten", 3500],
  ["te-buru", 3500],
  ["sofa-", 3500],
  ["suka-fu", 3500],
  ["se-ta-", 3500],
  ["ji-nzu", 3500],
  ["cho-ku", 3000],

  // Words covering less common letters (v, q, x, l) to ensure full keyboard practice
  ["vi-de-o", 15000],
  ["vizuaru", 14000],
  ["ivento", 14000],
  ["vi-nasu", 13000],
  ["volte-ji", 12500],
  ["vu-", 12000],
  ["kuizu", 15000],
  ["kuote-shon", 14000],
  ["q-su", 12000],
  ["taxi", 18000],
  ["text", 16000],
  ["box", 17000],
  ["excel", 15000],
  ["index", 14000],
  ["mix", 13000],
  ["max", 13000],
  ["next", 12000],
  ["lemon", 15000],
  ["la-men", 14000],
  ["ra-ion", 15000],
];

for (const [w, f] of essentialChoonWords) {
  wordMap.set(w, (wordMap.get(w) || 0) + f);
}

// Convert to array and sort by frequency descending
const sorted = [...wordMap.entries()].sort((a, b) => b[1] - a[1]);

// Write dictionary-ja.csv.gz
const csvLines = ["word,frequency score"];
for (const [w, f] of sorted) {
  csvLines.push(`${w},${f.toFixed(2)}`);
}

const csvData = csvLines.join("\n");
const gzipped = zlib.gzipSync(Buffer.from(csvData, "utf8"));
fs.writeFileSync(dictPath, gzipped);

console.log(
  `Successfully built dictionary-ja.csv.gz (${sorted.length} words, ${gzipped.length} bytes gzipped)`,
);
const hyphenCount = sorted.filter(([w]) => w.includes("-")).length;
console.log(`Words containing hyphen (-): ${hyphenCount}`);
