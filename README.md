# Keybr 日本語版 (Fork)

本リポジトリ（[htk0/keybr.com](https://github.com/htk0/keybr.com)）は、Alex Radzievskiy氏による [aradzie/keybr.com](https://github.com/aradzie/keybr.com)（ライセンス: AGPLv3）をベースに、日本語ローマ字入力および US配列/JIS配列向けに最適化したオープンソース・フォークです。

### 特徴
- **訓令式・ヘボン式シームレス判定**: `si`/`shi`, `ti`/`chi`, `tu`/`tsu`, `hu`/`fu`, `zi`/`ji` 等の表記ゆれを全自動吸収しミスなく判定。
- **濁点・半濁点・小文字（促音・拗音）の頻度順アンロック**: 頻出濁音（`が, で, だ, じ`等）や促音（`っ`）、拗音小文字（`ょ, ゅ, ゃ`）が自然な頻度で中盤から織り交ぜられ、実用的な単語で練習可能。
- **句読点（、・。）・記号タイピング対応**: 読点`、`は`,`、句点`。`は`.`、中黒`・`は`/`、感嘆符`！`や疑問符`？`にフル対応。練習設定で句読点付加も可能。
- **伸ばし棒「ー」集中特訓**: US配列（`-`キー）およびJIS配列の両方で運指ガイドに対応。
- **完全ローカル動作**: サーバーやDBを必要とせず、ブラウザの `localStorage` で進捗やスコアが安全に保存されます。GitHub Pages で静的公開可能。

---

[![CI](https://github.com/aradzie/keybr.com/actions/workflows/ci.yml/badge.svg)](https://github.com/aradzie/keybr.com/actions/workflows/ci.yml)

# [keybr.com](https://www.keybr.com/) is not (just) a typing test

<p align="center">
    <img src="assets/screenshot.png" alt="screenshot" width="600"/>
</p>

It's the smartest way to learn touch typing and improve your typing speed.
On the surface, it looks pretty simple: it shows you a piece of text, and you type it out.
But the devil is in the details — keybr.com offers a few unique features:

* keybr.com tracks every single keystroke and computes statistics for each individual key.
* It automatically generates lessons that focus on your weakest keys.
* You can set your own target typing speed, and it tracks your progress toward that goal.
* It starts with a small set of the most frequent letters in your language.
* More letters are added once you reach the target speed with the current ones.
* It can even predict how many more lessons you will need to complete to reach your target speed.
* It provides a beautiful profile page with detailed graphs showing your learning progress.
* It offers plenty of modes and configuration options.

<p align="center">
    <img src="docs/assets/graph.png" alt="screenshot" width="600"/>
</p>

## Can I contribute?

Yes!

* **[Give us a ⭐️.](https://github.com/aradzie/keybr.com)** Help this project gain visibility and stand out.
* **[Report a bug.](https://github.com/aradzie/keybr.com/issues)** If something is not working, let us know.
* **[Suggest a feature.](https://github.com/aradzie/keybr.com/issues)** We are open to new ideas.
* **[Translate.](./docs/translations.md)** If you want to see keybr.com in your language.
* **[Getting started.](./docs/getting_started.md)** Launch a local instance of keybr.com, make a pull request.
* **[Add a keyboard.](docs/custom_keyboard.md)** Add a custom keyboard to keybr.com
* **[Add a language.](docs/custom_language.md)** Add a custom language to keybr.com
* **[Join our Discord server](https://discord.gg/gY4RA4enVH).** To discuss things in a less formal way.

## License

Released under the GNU Affero General Public License v3.0.
