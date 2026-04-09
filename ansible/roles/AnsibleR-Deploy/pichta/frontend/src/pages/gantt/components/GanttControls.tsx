import {
  Group,
  Title,
  Text,
  Badge,
  Select,
  SegmentedControl,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

type Props = {
  orderedCount: number;
  isProfLoading: boolean;
  profOptions: { value: string; label: string }[];
  selectedProfId: number;
  setSelectedProfId: (id: number) => void;

  typeFilter: string;
  setTypeFilter: (v: any) => void;

  sortMode: "type" | "none";
  setSortMode: (v: "type" | "none") => void;

  segment: "days" | "weeks" | "months";
  setSegment: (v: "days" | "weeks" | "months") => void;

  legendColors: Record<
    "process" | "complete" | "gray_zone" | "inactive",
    { bg: string; br: string }
  >;

  refetchAll: () => void;
  textDimmed: string;
};

export function GanttControls({
  orderedCount,
  isProfLoading,
  profOptions,
  selectedProfId,
  setSelectedProfId,
  typeFilter,
  setTypeFilter,
  sortMode,
  setSortMode,
  segment,
  setSegment,
  legendColors,
  refetchAll,
  textDimmed,
}: Props) {
  return (
    <Group justify="space-between" align="center" mb="md" wrap="wrap">
      {/* левая часть: заголовок + счётчик */}
      <Group gap="sm" align="center">
        <Title order={3}>Диаграмма Ганта</Title>
        <Badge radius="xl" variant="outline">
          <Text span fw={700} mr={4}>
            {orderedCount}
          </Text>
          навыков
        </Badge>
      </Group>

      {/* правая часть: контролы */}
      <Group gap="xs" wrap="nowrap" align="center">
        {/* выбор профессии */}
        <Select
          size="xs"
          w={260}
          searchable
          placeholder={isProfLoading ? "Загрузка..." : "Выберите профессию"}
          data={profOptions}
          value={selectedProfId ? String(selectedProfId) : null}
          onChange={(v) => setSelectedProfId(Number(v) || 0)}
          disabled={isProfLoading || !profOptions.length}
          nothingFoundMessage="Профессии не найдены"
        />

        {/* фильтр статуса */}
        <Select
          size="xs"
          w={170}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v || "all")}
          data={[
            { label: "Все типы", value: "all" },
            { label: "В процессе", value: "process" },
            { label: "Не начаты", value: "gray_zone" },
            { label: "Завершено", value: "complete" },
            { label: "Изначально был", value: "inactive" },
          ]}
        />

        {/* сортировка */}
        <SegmentedControl
          size="xs"
          value={sortMode}
          onChange={(v) => setSortMode(v as any)}
          data={[
            { label: "По типу", value: "type" },
            { label: "Как пришло", value: "none" },
          ]}
        />

        {/* масштаб времени */}
        <SegmentedControl
          size="xs"
          value={segment}
          onChange={(v) => setSegment(v as any)}
          data={[
            { label: "Дни", value: "days" },
            { label: "Недели", value: "weeks" },
            { label: "Месяцы", value: "months" },
          ]}
        />

        {/* рефреш */}
        <Tooltip label="Обновить">
          <ActionIcon
            variant="light"
            onClick={() => {
              refetchAll();
            }}
          >
            <IconRefresh size={16} />
          </ActionIcon>
        </Tooltip>

        {/* легенда */}
        <Group gap={6} wrap="nowrap">
          <LegendBadge
            color={legendColors.process}
            label="В процессе"
          />
          <LegendBadge
            color={legendColors.complete}
            label="Завершено"
          />
          <LegendBadge
            color={legendColors.gray_zone}
            label="Не начаты"
          />
          <LegendBadge
            color={legendColors.inactive}
            label="Изначально был"
          />
        </Group>
      </Group>
    </Group>
  );
}

function LegendBadge({
  color,
  label,
}: {
  color: { bg: string; br: string };
  label: string;
}) {
  return (
    <Badge
      size="xs"
      variant="light"
      pl={6}
      leftSection={
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: color.bg,
            border: `1px solid ${color.br}`,
          }}
        />
      }
    >
      {label}
    </Badge>
  );
}
