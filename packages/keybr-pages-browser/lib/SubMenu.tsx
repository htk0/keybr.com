import { Link as StaticLink } from "@keybr/widget";
import * as styles from "./SubMenu.module.less";

export function SubMenu({
  currentPath: _currentPath,
}: {
  readonly currentPath?: string;
}) {
  return (
    <div className={styles.root}>
      <GithubLink />
    </div>
  );
}

function GithubLink() {
  return (
    <StaticLink
      href="https://github.com/htk0/keybr.com"
      target="github"
      title="Keybr.com (by Alex Radzievskiy) の日本語最適化フォーク (htk0/keybr.com)"
    >
      GitHub (Forked)
    </StaticLink>
  );
}
