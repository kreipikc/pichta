import { ReactNode } from "react";
import { Text } from "@mantine/core";
import type dayjs from "dayjs";

type PropsBase = { headerBg: string; gridLine: string; children?: ReactNode };
type LeftProps = PropsBase & { side: "left" };
type RightProps = PropsBase & {
  side: "right";
  DAY_PX: number;
  monthSpans: { key: string; label: string; days: number }[];
  weekSpans: { key: string; label: string; days: number }[];
  dates: dayjs.Dayjs[];
  segment: "days" | "weeks" | "months";
  textDimmed: string;
};

export function GanttHeader(props: LeftProps | RightProps) {
  const { headerBg, gridLine } = props;

  // левая шапка (название/период в левом столбце)
  if (props.side === "left") {
    return (
      <div
        style={{
          height: 72,
          background: headerBg,
          borderBottom: `1px solid ${gridLine}`,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          fontWeight: 600,
        }}
      >
        {props.children}
      </div>
    );
  }

  // правая шапка (месяцы / недели / дни)
  const { DAY_PX, monthSpans, weekSpans, dates, segment, textDimmed } = props;

  const cellBase: React.CSSProperties = {
    textAlign: "center",
    boxSizing: "border-box",
    borderRight: `1px solid ${gridLine}`,
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        background: headerBg,
        zIndex: 2,
        borderBottom: `1px solid ${gridLine}`,
      }}
    >
      {/* верхний ряд: месяцы */}
      <div
        style={{
          height: 36,
          display: "grid",
          gridTemplateColumns: monthSpans
            .map((m) => `${m.days * DAY_PX}px`)
            .join(" "),
          borderBottom: `1px solid ${gridLine}`,
          alignItems: "center",
        }}
      >
        {monthSpans.map((m, idx) => (
          <div
            key={m.key}
            style={{
              ...cellBase,
              borderRight:
                idx === monthSpans.length - 1
                  ? "1px solid transparent"
                  : cellBase.borderRight,
            }}
          >
            <Text size="xs" fw={600}>
              {m.label}
            </Text>
          </div>
        ))}
      </div>

      {/* нижний ряд: недели или дни */}
      {segment === "months" ? (
        <div style={{ height: 36 }} />
      ) : (
        <div
          style={{
            height: 36,
            display: "grid",
            gridTemplateColumns:
              segment === "weeks"
                ? weekSpans.map((w) => `${w.days * DAY_PX}px`).join(" ")
                : dates.map(() => `${DAY_PX}px`).join(" "),
            alignItems: "center",
          }}
        >
          {segment === "weeks"
            ? weekSpans.map((w, idx) => (
                <div
                  key={w.key}
                  style={{
                    ...cellBase,
                    borderRight:
                      idx === weekSpans.length - 1
                        ? "1px solid transparent"
                        : cellBase.borderRight,
                  }}
                >
                  <Text size="xs" c={textDimmed}>
                    {w.label}
                  </Text>
                </div>
              ))
            : dates.map((d, idx) => (
                <div
                  key={d.format("YYYY-MM-DD")}
                  style={{
                    ...cellBase,
                    borderRight:
                      idx === dates.length - 1
                        ? "1px solid transparent"
                        : cellBase.borderRight,
                  }}
                >
                  <Text size="xs" c={textDimmed}>
                    {d.format("DD")}
                  </Text>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
