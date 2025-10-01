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

  const { DAY_PX, monthSpans, weekSpans, dates, segment, textDimmed } = props;

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
      {/* Месяцы (ru) */}
      <div
        style={{
          height: 36,
          display: "grid",
          gridTemplateColumns: monthSpans.map((m) => `${m.days * DAY_PX}px`).join(" "),
          borderBottom: `1px solid ${gridLine}`,
          alignItems: "center",
        }}
      >
        {monthSpans.map((m) => (
          <div key={m.key} style={{ textAlign: "center" }}>
            <Text size="xs" fw={600}>
              {m.label}
            </Text>
          </div>
        ))}
      </div>

      {/* Недели или дни */}
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
            ? weekSpans.map((w) => (
                <div key={w.key} style={{ textAlign: "center", borderRight: `1px solid ${gridLine}` }}>
                  <Text size="xs" c={textDimmed}>
                    {w.label}
                  </Text>
                </div>
              ))
            : dates.map((d) => (
                <div key={d.format("YYYY-MM-DD")} style={{ textAlign: "center", borderRight: `1px solid ${gridLine}` }}>
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
