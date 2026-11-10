import { equal, ok } from "node:assert/strict";
import { test } from "node:test";
import { KanaAutomaton } from "./kana-automaton.ts";

test("KanaAutomaton accepts Kunrei-shiki input", () => {
  const auto = new KanaAutomaton("しんぶん");
  // User types 's', 'i', 'n', 'b', 'u', 'n', 'n'
  const keys = ["s", "i", "n", "b", "u", "n", "n"];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
  }
  ok(auto.isCompleted);
});

test("KanaAutomaton accepts Hepburn-shiki input", () => {
  const auto = new KanaAutomaton("しんぶん");
  // User types 's', 'h', 'i', 'n', 'n', 'b', 'u', 'n', 'n'
  const keys = ["s", "h", "i", "n", "n", "b", "u", "n", "n"];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
  }
  ok(auto.isCompleted);
});

test("KanaAutomaton accepts prolonged sound mark '-'", () => {
  const auto = new KanaAutomaton("さーばー");
  const keys = ["s", "a", "-", "b", "a", "-"];
  const completedMorae: string[] = [];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
    if (res.completedMora != null) {
      completedMorae.push(res.completedMora.kana);
    }
  }
  ok(auto.isCompleted);
  equal(completedMorae.join(""), "さーばー");
});

test("KanaAutomaton accepts sokuon っ with double consonant", () => {
  const auto = new KanaAutomaton("がっこう");
  const keys = ["g", "a", "k", "k", "o", "u"];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
  }
  ok(auto.isCompleted);
});

test("KanaAutomaton handles spaces between words", () => {
  const auto = new KanaAutomaton("めーる こーひー");
  const keys = ["m", "e", "-", "r", "u", " ", "k", "o", "-", "h", "i", "-"];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
  }
  ok(auto.isCompleted);
});

test("KanaAutomaton detects typos and rejects invalid keys", () => {
  const auto = new KanaAutomaton("さくら");
  const res1 = auto.feed("s");
  ok(res1.success);
  // Expecting 'a', but user types 'x'
  const res2 = auto.feed("x");
  equal(res2.success, false);
  // Correct key 'a' then succeeds
  const res3 = auto.feed("a");
  ok(res3.success);
  equal(res3.completedMora?.kana, "さ");
});

test("KanaAutomaton provides display chars with attrs", () => {
  const auto = new KanaAutomaton("らーめん");
  auto.feed("r");
  const kanaChars = auto.getKanaChars();
  const romajiChars = auto.getRomajiChars();
  // 'ら' has cursor
  equal(kanaChars[0].attrs, 8 /* Attr.Cursor */);
  // 'r' has hit (1), 'a' has cursor (8)
  equal(romajiChars[0].attrs, 1 /* Attr.Hit */);
  equal(romajiChars[1].attrs, 8 /* Attr.Cursor */);

  auto.feed("a");
  // 'ら' now hit
  equal(auto.getKanaChars()[0].attrs, 1 /* Attr.Hit */);
  // 'ー' now cursor
  equal(auto.getKanaChars()[1].attrs, 8 /* Attr.Cursor */);
  // next code point is '-'
  equal(auto.nextCodePoint, 0x002d);
});

test("KanaAutomaton accepts Japanese punctuation (、 and 。) via comma and dot", () => {
  const auto = new KanaAutomaton("はい、そうです。");
  const keys = ["h", "a", "i", ",", "s", "o", "u", "d", "e", "s", "u", "."];
  const completed: string[] = [];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
    if (res.completedMora != null) {
      completed.push(res.completedMora.kana);
    }
  }
  ok(auto.isCompleted);
  equal(completed.join(""), "はい、そうです。");
});

test("KanaAutomaton provides both base and small kana codePoints for contracted sounds (youon)", () => {
  const auto = new KanaAutomaton("きょう");
  const res1 = auto.feed("k");
  ok(res1.success);
  const res2 = auto.feed("y");
  ok(res2.success);
  const res3 = auto.feed("o");
  ok(res3.success);
  ok(res3.completedMora != null);
  equal(res3.completedMora.kana, "きょ");
  equal(res3.completedMora.codePoints.length, 2);
  equal(res3.completedMora.codePoints[0], "き".codePointAt(0)!);
  equal(res3.completedMora.codePoints[1], "ょ".codePointAt(0)!);

  const res4 = auto.feed("u");
  ok(res4.success);
  ok(res4.completedMora != null);
  equal(res4.completedMora.kana, "う");
  equal(res4.completedMora.codePoints[0], "う".codePointAt(0)!);
  ok(auto.isCompleted);
});

test("KanaAutomaton accepts symbols (!, ?, ・) correctly", () => {
  const auto = new KanaAutomaton("なに！？・");
  const keys = ["n", "a", "n", "i", "!", "?", "/"];
  for (const k of keys) {
    const res = auto.feed(k);
    ok(res.success, `Expected success for key: ${k}`);
  }
  ok(auto.isCompleted);
});
