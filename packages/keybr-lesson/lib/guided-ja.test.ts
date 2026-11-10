import { equal, ok } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { Language, Layout, loadKeyboard } from "@keybr/keyboard";
import { makePhoneticModel } from "@keybr/phonetic-model";
import { makeKeyStatsMap } from "@keybr/result";
import { Settings } from "@keybr/settings";
import { GuidedLesson } from "./guided.ts";

test("GuidedLesson with Language.JA initializes Japanese Hiragana keys and generates text", () => {
  const rootDir = resolve(import.meta.dirname, "../../..");
  const modelData = readFileSync(
    resolve(rootDir, "packages/keybr-phonetic-model/assets/model-ja.data"),
  );
  const words: string[] = JSON.parse(
    readFileSync(
      resolve(rootDir, "packages/keybr-content-words/lib/data/words-ja.json"),
      "utf-8",
    ),
  );

  const model = makePhoneticModel(Language.JA, modelData);
  const keyboard = loadKeyboard(Layout.EN_US);
  const settings = new Settings();

  const lesson = new GuidedLesson(settings, keyboard, model, words);
  ok(
    lesson.letters.length > 50,
    `Expected >50 letters, got ${lesson.letters.length}`,
  );

  // Prolonged mark 'ー' must exist in lesson letters
  const dash = lesson.letters.find((l) => l.codePoint === 0x30fc);
  ok(dash != null, "Prolonged sound mark 'ー' must be present in letters");
  equal(dash.label, "ー");

  const statsMap = makeKeyStatsMap(lesson.letters, []);
  const keys = lesson.update(statsMap);
  const included = keys.findIncludedKeys();
  ok(
    included.length >= 6,
    `Expected at least 6 initial keys, got ${included.length}`,
  );

  // Initial keys should be Hiragana
  for (const k of included) {
    ok(
      /[\u3040-\u30ff]/.test(k.letter.label),
      `Expected Hiragana label, got: ${k.letter.label}`,
    );
  }

  // Generate lesson text (Japanese text length should be ~1/2 of English to match Romaji keystrokes)
  const fragment = lesson.generate(keys, GuidedLesson.rng);
  ok(
    typeof fragment === "string" && fragment.length > 0,
    "Generated fragment should be non-empty string",
  );
  ok(
    /[\u3040-\u30ff]/.test(fragment),
    `Generated fragment should be Hiragana: ${fragment}`,
  );
  ok(
    fragment.length >= 40 && fragment.length <= 80,
    `Japanese fragment length should be ~50-70 characters (half of English), got: ${fragment.length}`,
  );

  // Frequency order must include high-frequency kana 'と' and 'く'
  const to = lesson.letters.find((l) => l.codePoint === "と".codePointAt(0)!);
  ok(to != null, "'と' must be included in letters");
  const ku = lesson.letters.find((l) => l.codePoint === "く".codePointAt(0)!);
  ok(ku != null, "'く' must be included in letters");

  // Small kana 'ょ' must be present in letters
  const lyo = lesson.letters.find((l) => l.codePoint === "ょ".codePointAt(0)!);
  ok(lyo != null, "'ょ' must be included in letters");
});
