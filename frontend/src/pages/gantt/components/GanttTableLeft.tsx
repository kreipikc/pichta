import { Group, Text, Badge } from "@mantine/core";
import { GanttRow as GanttRowType } from "@/hooks/useGraphGanttSkills";

type Props = {
  rows: GanttRowType[];
  move: (dragId: number, dropId: number) => void;
  rowKeyOf: (row: GanttRowType, fallback: number) => number;
  zebraEven: string;
  zebraOdd: string;
  gridLine: string;
  textDimmed: string;
  rowHeight: number;
  headerBg: string;
  fmtRu: (d: Date) => string;
};

export function GanttTableLeft({
  rows,
  move,
  rowKeyOf,
  zebraEven,
  zebraOdd,
  gridLine,
  textDimmed,
  rowHeight,
  headerBg,
  fmtRu,
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        borderRight: `1px solid ${gridLine}`,
      }}
    >
      {/* шапка слева */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: headerBg,
          borderBottom: `1px solid ${gridLine}`,
          minHeight: 72,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Group justify="space-between" px="md" w="100%">
          <Text fw={600} size="sm" c={textDimmed}>
            Навык (тяните, чтобы изменить приоритет)
          </Text>
          <Text fw={600} size="sm" c={textDimmed}>
            Период
          </Text>
        </Group>
      </div>

      {/* строки слева */}
      <div>
        {rows.map((row, idx) => {
          const thisKey = rowKeyOf(row, idx);
          const dotColor =
            row.type === "process"
              ? "#228be6"
              : row.type === "complete"
              ? "#12b886"
              : row.type === "inactive"
              ? "#f59f00"
              : "#868e96";
          const dotOpacity = row.type === "gray_zone" ? 0.5 : 1;

          return (
            <div
              key={`left-${thisKey}`}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", String(thisKey));
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                const dragId = Number(
                  e.dataTransfer.getData("text/plain")
                );
                move(dragId, thisKey);
              }}
              style={{
                height: rowHeight,
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                alignItems: "center",
                padding: "0 12px",
                background: idx % 2 === 0 ? zebraEven : zebraOdd,
                borderBottom: `1px solid ${gridLine}`,
                cursor: "grab",
                userSelect: "none",
              }}
              title="Потяните вверх/вниз, чтобы изменить приоритет локально"
            >
              {/* инфо про навык */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minWidth: 0,
                }}
              >
                <span
                  title={row.type}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    marginTop: 1,
                    background: dotColor,
                    opacity: dotOpacity,
                    flex: "0 0 auto",
                  }}
                />
                <Text
                  fw={500}
                  lineClamp={1}
                  title={row.title}
                  style={{ minWidth: 0 }}
                >
                  {row.title}
                </Text>

                {typeof row.proficiency === "number" && (
                  <Badge
                    size="xs"
                    variant="light"
                    color="teal"
                    title="Прогресс"
                  >
                    {row.proficiency}%
                  </Badge>
                )}

                {typeof row.priority === "number" && (
                  <Badge
                    size="xs"
                    variant="outline"
                    color="yellow"
                    title="Приоритет"
                  >
                    P{row.priority}
                  </Badge>
                )}
              </div>

              <Text size="sm" c={textDimmed}>
                {row.type === "gray_zone" || row.type === "inactive"
                  ? "—"
                  : `${fmtRu(row.start)} — ${fmtRu(row.end)}`}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
}
