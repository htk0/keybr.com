import {
  type Keyboard,
  KeyboardOptions,
  type WeightedCodePointSet,
} from "@keybr/keyboard";
import { type Letter, PhoneticModel } from "@keybr/phonetic-model";
import { LCG, type RNGStream } from "@keybr/rand";
import { type KeyStatsMap, type Result, ResultGroups } from "@keybr/result";
import { type Settings } from "@keybr/settings";
import { type StyledText } from "@keybr/textinput";
import { type CodePoint } from "@keybr/unicode";
import { type LessonKeys } from "./key.ts";

export abstract class Lesson {
  static rng: RNGStream = LCG(Date.now());

  readonly settings: Settings;
  readonly keyboard: Keyboard;
  readonly codePoints: WeightedCodePointSet;
  readonly model: PhoneticModel;

  protected constructor(
    settings: Settings,
    keyboard: Keyboard,
    model: PhoneticModel,
  ) {
    this.settings = settings;
    this.keyboard = keyboard;
    if (model.language.id === "ja") {
      const set = new Set(model.letters.map((l) => l.codePoint));
      this.codePoints = new (class implements WeightedCodePointSet {
        [Symbol.iterator](): IterableIterator<CodePoint> {
          return set[Symbol.iterator]();
        }
        get size(): number {
          return set.size;
        }
        has(codePoint: CodePoint): boolean {
          return set.has(codePoint);
        }
        weight(codePoint: CodePoint): number {
          return 1;
        }
      })();
      this.model = model;
    } else {
      this.codePoints = keyboard.getCodePoints();
      this.model = PhoneticModel.restrict(model, this.codePoints);
    }
  }

  filter(results: readonly Result[]): readonly Result[] {
    return ResultGroups.byLayoutFamily(results).get(
      KeyboardOptions.from(this.settings).layout.family,
    );
  }

  abstract get letters(): readonly Letter[];

  abstract update(keyStatsMap: KeyStatsMap): LessonKeys;

  abstract generate(lessonKeys: LessonKeys, rng: RNGStream): StyledText;
}
