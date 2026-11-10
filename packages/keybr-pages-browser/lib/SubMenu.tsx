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
      href="https://github.com/aradzie/keybr.com"
      target="github"
      title="Keybr.comのオープンソース版をベースにした日本語向けフォークプロジェクトです。"
    >
      GitHub (Forked)
    </StaticLink>
  );
}
