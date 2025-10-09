import { ReactNode } from "react";
import { Box, Group, Select, rem } from "@mantine/core";
import { IconAlertCircle, IconCheck, IconCircleFilled, IconClock } from "@tabler/icons-react";

export type StatusOption = "pending" | "in_progress" | "done";

const STATUS_LABELS: Record<StatusOption, string> = {
  pending: "ожидает",
  in_progress: "в процессе",
  done: "выполнено",
};
const STATUS_ICON: Record<StatusOption, ReactNode> = {
  pending: <IconAlertCircle size={14} />,
  in_progress: <IconClock size={14} />,
  done: <IconCheck size={14} />,
};
const STATUS_COLOR: Record<StatusOption, { bgVar: string; fgVar: string }> = {
  pending: {
    bgVar: "var(--mantine-color-yellow-light)",
    fgVar: "var(--mantine-color-yellow-light-color)",
  },
  in_progress: {
    bgVar: "var(--mantine-color-blue-light)",
    fgVar: "var(--mantine-color-blue-light-color)",
  },
  done: {
    bgVar: "var(--mantine-color-green-light)",
    fgVar: "var(--mantine-color-green-light-color)",
  },
};
const STATUS_SELECT_DATA = (Object.keys(STATUS_LABELS) as StatusOption[]).map((v) => ({
  value: v,
  label: STATUS_LABELS[v],
}));

export default function StatusSelect({
  value,
  onChange,
  maw = 160,
}: {
  value: StatusOption;
  onChange: (val: StatusOption) => void;
  maw?: number;
}) {
  const colors = STATUS_COLOR[value];
  return (
    <Select
      data={STATUS_SELECT_DATA}
      value={value}
      onChange={(val) => val && onChange(val as StatusOption)}
      allowDeselect={false}
      size="xs"
      radius="xl"
      variant="filled"
      comboboxProps={{
        withinPortal: true,
        zIndex: 4000,
        position: "bottom-start",
      }}
      styles={{
        input: {
          background: colors.bgVar,
          color: colors.fgVar,
          paddingLeft: rem(28),
          paddingRight: rem(28),
          borderColor: "transparent",
        },
      }}
      leftSection={
        <Box style={{ display: "flex", alignItems: "center", color: colors.fgVar }}>
          {STATUS_ICON[value]}
        </Box>
      }
      renderOption={({ option }) => {
        const val = option.value as StatusOption;
        const c = STATUS_COLOR[val];
        return (
          <Group gap="xs">
            <IconCircleFilled size={10} style={{ color: c.fgVar }} />
            <span>{STATUS_LABELS[val]}</span>
          </Group>
        );
      }}
      withCheckIcon={false}
      maw={maw}
      rightSectionPointerEvents="none"
      clearable={false}
      searchable={false}
    />
  );
}
