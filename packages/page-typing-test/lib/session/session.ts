import {
  type Feedback,
  splitStyledText,
  type Step,
  TextInput,
} from "@keybr/textinput";
import {
  type AnyEvent,
  type IInputEvent,
  type IKeyboardEvent,
} from "@keybr/textinput-events";
import { type TextGenerator } from "../generators/index.ts";
import { computeProgress } from "./duration.ts";
import {
  type Progress,
  type SessionLine,
  type SessionLines,
  type SessionSettings,
} from "./types.ts";

export class Session {
  static readonly emptyLines = {
    text: "",
    lines: [],
  } satisfies SessionLines;
  static readonly emptyProgress = {
    time: 0,
    length: 0,
    progress: 0,
    speed: 0,
  } satisfies Progress;

  /** A list of events to replay. */
  #events: AnyEvent[] = [];
  /** The currently visible lines. */
  #lines!: SessionLine[];
  /** The index of the edited line. */
  #activeLine!: number;
  /** The text input for the edited line. */
  #textInput!: TextInput;
  /** The steps accumulated from all lines. */
  #steps!: Step[];
  /** Generates unique React element keys. */
  #index = 0;

  constructor(
    readonly settings: SessionSettings,
    readonly generator: TextGenerator,
  ) {
    this.#lines = [];
    this.#activeLine = 0;
    this.#steps = [];
    while (this.#lines.length < this.settings.numLines) {
      this.#appendLine();
    }
    this.#setActiveLine();
  }

  getEvents(): readonly AnyEvent[] {
    return this.#events;
  }

  getLines(): SessionLines {
    return { text: "", lines: this.#lines };
  }

  getSteps(): readonly Step[] {
    return this.#steps;
  }

  handleKeyDown = (event: IKeyboardEvent) => {
    this.#addEvent(event);
  };

  handleKeyUp = (event: IKeyboardEvent) => {
    this.#addEvent(event);
  };

  handleInput = (
    event: IInputEvent,
  ): {
    feedback: Feedback;
    progress: Progress;
    completed: boolean;
  } => {
    this.#addEvent(event);
    const feedback = this.#textInput.onInput(event);
    const { progress, completed } = computeProgress(
      this.settings.duration,
      this.#steps,
    );
    this.#updateActiveLine(progress);
    if (this.#textInput.completed) {
      if (this.#activeLine < this.#lines.length - 3) {
        this.#activeLine += 1;
      } else {
        this.#lines.shift();
        this.#appendLine();
      }
      this.#setActiveLine();
    }
    return { feedback, progress, completed };
  };

  #addEvent(event: AnyEvent) {
    this.#events.push(event);
  }

  #appendLine() {
    const mark = this.generator.mark();
    const text = this.#generateLine();
    const chars = splitStyledText(text);
    const index = (this.#index += 1);
    this.#lines.push({
      mark,
      index,
      text,
      chars,
      progress: null,
    });
  }

  #setActiveLine() {
    const { text } = this.#lines[this.#activeLine];
    this.#textInput = new TextInput(text, this.settings.textInput, (step) => {
      this.#steps.push(step);
    });
    this.#updateActiveLine();
  }

  #updateActiveLine(progress: Progress | null = null) {
    const { mark, index, text } = this.#lines[this.#activeLine];
    const { chars } = this.#textInput;
    this.#lines[this.#activeLine] = {
      mark,
      index,
      text,
      chars,
      progress,
    };
  }

  #generateLine() {
    const {
      settings: { numCols },
      generator,
    } = this;
    let line = "";
    while (true) {
      const mark = generator.mark();
      const word = generator.nextWord();
      const curLen = getVisualLength(line);
      const wordLen = getVisualLength(word);
      if (curLen > 0 && curLen + wordLen + 1 > numCols) {
        generator.reset(mark);
        break;
      }
      line += `${word} `;
    }
    return line;
  }
}

function getVisualLength(str: string): number {
  let len = 0;
  for (const ch of str) {
    const code = ch.codePointAt(0) ?? 0;
    // CJK and fullwidth characters take 2 visual columns
    if (
      (code >= 0x1100 && code <= 0x11ff) ||
      (code >= 0x2e80 && code <= 0xa4cf) ||
      (code >= 0xac00 && code <= 0xd7a3) ||
      (code >= 0xf900 && code <= 0xfaff) ||
      (code >= 0xfe10 && code <= 0xfe19) ||
      (code >= 0xfe30 && code <= 0xfe6f) ||
      (code >= 0xff00 && code <= 0xff60) ||
      (code >= 0xffe0 && code <= 0xffe6)
    ) {
      len += 2;
    } else {
      len += 1;
    }
  }
  return len;
}
