import { Logo } from "components/Logo";
import styles from "./DevToolbar.module.scss";
import { SiGraphql } from "react-icons/si";
import { MdAdminPanelSettings } from "react-icons/md";
import Link from "next/link";
import { useAuth } from "hooks/useAuth";
import { Role } from "generated";
import { useFps } from "react-fps";
import clsx from "clsx";
import { BiChevronRight, BiChevronLeft } from "react-icons/bi";
import { useState } from "react";

const commitHash = process.env.COMMIT_HASH;

export function DevToolbar() {
  const { user } = useAuth();
  const fps = useFps(3);
  const [isCollapsed, setCollapsed] = useState(false);

  if (!user || user.role !== Role.Superuser) return null;
  if (process.env.ENV === "production") return null;

  return (
    <div
      className={clsx(styles.container, {
        [styles.collapsed as string]: isCollapsed,
      })}
    >
      <button
        className={styles.iconButton}
        onClick={() => setCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <BiChevronLeft color="var(--aqua)" />
        ) : (
          <BiChevronRight color="var(--aqua)" />
        )}
      </button>
      <div
        className={styles.flexBetween}
        style={{ gap: "1rem", marginLeft: "1rem" }}
      >
        <Logo width={15} />
        <div>
          (
          <a href={`https://github.com/populist-vote/web/commit/${commitHash}`}>
            {commitHash}
          </a>
          )
        </div>
        <div
          className={clsx(styles.flexBetween, styles.iconButton)}
          style={{ gap: "1rem" }}
        >
          <SiGraphql color="var(--aqua)" />
          <a href={process.env.GRAPHQL_SCHEMA_PATH}>
            {process.env.GRAPHQL_SCHEMA_PATH}
          </a>
        </div>
        <Link href="/admin" className={styles.iconButton}>
          <MdAdminPanelSettings color="var(--aqua)" />
        </Link>
        <div
          className={styles.flexBetween}
          style={{
            display: "inline-block",
            fontVariantNumeric: "tabular-nums",
            width: "140px",
          }}
        >
          <small>
            FPS:{" "}
            <span
              style={{
                color: "var(--aqua)",
              }}
            >
              {fps.currentFps}
            </span>
          </small>
          <small
            style={{
              color: "var(--grey)",
              width: "70px",
              marginLeft: "0.5rem",
              display: "inline-block",
            }}
          >
            ({fps.avgFps} avg)
          </small>
        </div>
      </div>
    </div>
  );
}