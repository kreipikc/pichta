import {
  Card,
  Text,
  Center,
  Loader,
} from "@mantine/core";

import { useGanttController } from "./components/hooks/useGanttController";
import { GanttControls } from "./components/GanttControls";
import { GanttTableLeft } from "./components/GanttTableLeft";
import { GanttTimeline } from "./components/GanttTimeline";
import { SkillModal } from "./components/SkillModal";

export default function GanttChart() {
  const ctrl = useGanttController();

  const {
    userId,
    isProfLoading,
    selectedProfId,
    profOptions,
    setSelectedProfId,

    typeFilter,
    setTypeFilter,
    sortMode,
    setSortMode,

    gantt,

    orderedRows,
    move,
    isLoading,
    refetch,
    refetchProf,

    textDimmed,
    zebraEven,
    zebraOdd,
    gridLine,
    legendColors,
    fmtRu,
    rowKeyOf,

    offsetPx,
    handleWheelViewport,
    handleMouseDownViewport,
    dragStateRef,

    fullTimelineWidthStyle,

    bottomScrollRef,
    handleBottomScroll,
    bottomScrollInnerWidth,
  } = ctrl;

  // короткий помощник чтобы обновить всё
  const refetchAll = () => {
    refetch();
    refetchProf();
  };

  return (
    <>
      <Card withBorder p="md" radius="lg">
        {/* ===== Верхняя панель с контролами ===== */}
        <GanttControls
          orderedCount={orderedRows.length}
          isProfLoading={isProfLoading}
          profOptions={profOptions}
          selectedProfId={selectedProfId}
          setSelectedProfId={setSelectedProfId}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          sortMode={sortMode}
          setSortMode={setSortMode}
          segment={gantt.segment}
          setSegment={gantt.setSegment}
          legendColors={legendColors}
          refetchAll={refetchAll}
          textDimmed={textDimmed}
        />

        {/* ===== Контент ===== */}
        {!userId || !selectedProfId ? (
          <Center mih={160}>
            <Text c="dimmed">
              Сначала выберите профессию и войдите в систему
            </Text>
          </Center>
        ) : isLoading ? (
          <Center mih={160}>
            <Loader />
          </Center>
        ) : orderedRows.length === 0 ? (
          <Center mih={160}>
            <Text c="dimmed">Нет навыков для отображения</Text>
          </Center>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "clamp(340px, 36vw, 580px) 1fr",
              minHeight: 240,
              borderRadius: 12,
              border: `1px solid ${gridLine}`,
            }}
          >
            {/* Левая колонка */}
            <GanttTableLeft
              rows={orderedRows}
              move={move}
              rowKeyOf={rowKeyOf}
              zebraEven={zebraEven}
              zebraOdd={zebraOdd}
              gridLine={gridLine}
              textDimmed={textDimmed}
              rowHeight={gantt.ROW_HEIGHT}
              headerBg={gantt.headerBg}
              fmtRu={fmtRu}
            />

            {/* Правая колонка (таймлайн + нижний скролл) */}
            <GanttTimeline
              gantt={gantt}
              rows={orderedRows}
              zebraEven={zebraEven}
              zebraOdd={zebraOdd}
              gridLine={gridLine}
              offsetPx={offsetPx}
              handleWheelViewport={handleWheelViewport}
              handleMouseDownViewport={handleMouseDownViewport}
              dragStateRef={dragStateRef}
              fullTimelineWidthStyle={fullTimelineWidthStyle}
              bottomScrollRef={bottomScrollRef}
              handleBottomScroll={handleBottomScroll}
              bottomScrollInnerWidth={bottomScrollInnerWidth}
            />
          </div>
        )}
      </Card>

      {/* модалка по клику на бар */}
      <SkillModal
        opened={gantt.modal.opened}
        onClose={gantt.modal.close}
        active={gantt.modal.active as any}
      />
    </>
  );
}
