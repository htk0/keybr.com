import { Cookie, SetCookie } from "@fastr/headers";
import {
  applyTheme,
  clearTheme,
  readTheme,
  ThemeContext,
  ThemePrefs,
  usePreferredColorScheme,
} from "@keybr/themes";
import { useFullscreen } from "@keybr/widget";
import { type ReactNode, useEffect, useState } from "react";

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  const fullscreenTarget =
    document.querySelector("[fullscreen-target]") ??
    document.querySelector("main") ??
    document.documentElement;

  const [fullscreenState, toggleFullscreen] = useFullscreen(fullscreenTarget);
  const [{ color, font }, setPrefs] = useState(() => {
    const prefs = readPrefs();
    switchTheme(prefs);
    return prefs;
  });
  const [hash, setHash] = useState(0);
  usePreferredColorScheme();

  useEffect(() => {
    switchTheme(new ThemePrefs({ color, font }));
    if (color === "custom") {
      readTheme()
        .then(({ theme }) => {
          applyTheme(theme);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      clearTheme();
    }
  }, [color, font]);

  return (
    <ThemeContext.Provider
      value={{
        fullscreenState,
        color,
        font,
        hash,
        toggleFullscreen,
        switchColor: (id) => {
          const prefs = new ThemePrefs({ color: id, font });
          switchTheme(prefs);
          setPrefs(prefs);
          setHash(hash + 1);
          storePrefs(prefs);
        },
        switchFont: (id) => {
          const prefs = new ThemePrefs({ color, font: id });
          switchTheme(prefs);
          setPrefs(prefs);
          setHash(hash + 1);
          storePrefs(prefs);
        },
        refresh: () => {
          setHash(hash + 1);
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function switchTheme(prefs: ThemePrefs) {
  if (typeof document !== "undefined" && document.documentElement != null) {
    document.documentElement.setAttribute(
      ThemePrefs.colorAttrName,
      prefs.color,
    );
    document.documentElement.setAttribute(ThemePrefs.fontAttrName, prefs.font);
  }
}

function readPrefs() {
  if (typeof window !== "undefined") {
    try {
      const fromLocal = localStorage.getItem(ThemePrefs.cookieKey);
      if (fromLocal) {
        return ThemePrefs.deserialize(fromLocal);
      }
    } catch {
      // Ignore
    }
  }
  return ThemePrefs.deserialize(
    Cookie.parse(document.cookie).get(ThemePrefs.cookieKey),
  );
}

function storePrefs(prefs: ThemePrefs) {
  const serialized = ThemePrefs.serialize(prefs);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ThemePrefs.cookieKey, serialized);
    } catch {
      // Ignore
    }
  }
  document.cookie = String(
    new SetCookie(ThemePrefs.cookieKey, serialized, {
      maxAge: 100 * 24 * 60 * 60,
      sameSite: "Lax",
      path: "/",
    }),
  );
}
