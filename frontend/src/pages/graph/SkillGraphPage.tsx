import { useEffect, useMemo, useRef, useState } from "react";
import { Text, Drawer, Badge, TextInput, Select, Loader, Center, Anchor } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import ForceGraph2D from "react-force-graph-2d";

import styles from "./SkillGraphPage.module.css";

import { useGetMeQuery } from "@/app/redux/api/auth.api";
import { useGetWantedProfessionsByUserIdQuery } from "@/app/redux/api/me.api";
import { useGetGraphByProfessionQuery } from "@/app/redux/api/graph.api";
import { useGetAllSkillsQuery, useGetSkillCoursesQuery } from "@/app/redux/api/skill.api";
import { useSkillGraphData } from "@/hooks/useSkillGraph";
import { getIconUrl } from "@/assets/icons/Icons";

// Гарантированно получаем URL, а не ReactComponent
import FALLBACK_ICON_URL from "@/assets/skill-fallback.svg?url";

type NodeType = {
  id: string;
  group: "role" | "category" | "skill";
  count?: number;
  user_proficiency?: number;
  percent?: number;
  x?: number;
  y?: number;
  level?: number;
  color?: string;
};

const hexToRgba = (hex: string, alpha = 1) => {
  const m = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(hex);
  if (!m) return `rgba(12,166,120,${alpha})`;
  let c = m[1];
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255, g = (num >> 8) & 255, b = num & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

export const SkillGraphPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<NodeType | null>(null);

  const { data: me } = useGetMeQuery();
  const userId = me?.id;

  const { data: wanted } = useGetWantedProfessionsByUserIdQuery(userId!, { skip: !userId, refetchOnMountOrArgChange: true, });
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedProfId && wanted && wanted.length > 0) {
      setSelectedProfId(wanted[0].profession.id);
    }
  }, [wanted, selectedProfId]);

  const { data: rawGraph, isFetching } = useGetGraphByProfessionQuery(
    { profId: selectedProfId ?? -1, userId: userId ?? -1 },
    { skip: !userId || !selectedProfId }
  );

  const graphData = useSkillGraphData(rawGraph, search);

  const profOptions = useMemo(
    () => (wanted ?? []).map((w) => ({ value: String(w.profession.id), label: w.profession.name })),
    [wanted]
  );

  // размеры контейнера — граф тянется на всю доступную область
  const { ref: containerRef, width, height } = useElementSize();

  // === Иконки: кэш + надёжный фоллбэк в любых состояниях ===
  const iconCache = useRef(new Map<string, HTMLImageElement>());

  const resolveIconUrl = (name: string) => {
    const u = getIconUrl(name.toLowerCase());
    return u && typeof u === "string" ? u : FALLBACK_ICON_URL;
    // даже если вернулся мусор — подхватится фоллбэк
  };

  const loadImage = (url: string) => {
    const cache = iconCache.current;
    if (cache.has(url)) return cache.get(url)!;

    const img = new Image();

    // обработчик ошибок — переключаемся на fallback один раз
    img.onerror = () => {
      if (img.src !== FALLBACK_ICON_URL) img.src = FALLBACK_ICON_URL;
    };

    img.src = url || FALLBACK_ICON_URL;
    cache.set(url, img);
    return img;
  };

  // сопоставление skill name -> id для курсов
  const { data: allSkills } = useGetAllSkillsQuery();
  const selectedSkillId = useMemo(() => {
    if (!selected || selected.group !== "skill" || !allSkills) return undefined;
    const found = allSkills.find((s) => s.name.toLowerCase() === selected.id.toLowerCase());
    return found?.id;
  }, [selected, allSkills]);

  const { data: courses, isFetching: coursesLoading } = useGetSkillCoursesQuery(selectedSkillId!, {
    skip: !selectedSkillId,
  });

  // === единые метрики размеров (учитывают масштаб графа) ===
  const sizeByLevel = [86, 72, 56]; // 0=role,1=category,2=skill

  const getIconMetrics = (node: NodeType, globalScale: number) => {
    const level = node.level ?? 2;
    const baseSize = (sizeByLevel[level] || 56) / globalScale;

    const iconUrl = resolveIconUrl(node.id);
    const img = loadImage(iconUrl);

    // если изображение уже "загрузилось с ошибкой" (naturalWidth === 0),
    // принудительно переключаемся на fallback
    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0) && img.src !== FALLBACK_ICON_URL) {
      img.src = FALLBACK_ICON_URL;
    }

    const ar = img.width && img.height ? img.width / img.height : 1;
    let w = baseSize;
    let h = baseSize;
    if (ar > 1) h = baseSize / ar;
    else w = baseSize * ar;

    return { baseSize, w, h, img };
  };

  const roundedRectPath = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    const rx = Math.min(r, w / 2);
    const ry = Math.min(r, h / 2);
    ctx.beginPath();
    ctx.moveTo(x - w / 2 + rx, y - h / 2);
    ctx.lineTo(x + w / 2 - rx, y - h / 2);
    ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + ry);
    ctx.lineTo(x + w / 2, y + h / 2 - ry);
    ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - rx, y + h / 2);
    ctx.lineTo(x - w / 2 + rx, y + h / 2);
    ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - ry);
    ctx.lineTo(x - w / 2, y - h / 2 + ry);
    ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + rx, y - h / 2);
    ctx.closePath();
  };

  // === рендер ноды: яркое мягкое свечение только для SKILL, + fallback-проверка ===
  const drawNode = (node: NodeType, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const x = (node as any).x ?? 0;
    const y = (node as any).y ?? 0;

    const { w, h, img } = getIconMetrics(node, globalScale);
    const color = node.color || "#0ca678";

    // --- мягкое свечение (только для навыков)
    if (node.group === "skill") {
      ctx.save();
      // более яркий градиент
      const glowRadius = Math.max(w, h) * 0.9;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      grad.addColorStop(0, hexToRgba(color, 0.55));  // было 0.28
      grad.addColorStop(0.55, hexToRgba(color, 0.26)); // было 0.12
      grad.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, w * 0.8, h * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // лёгкая "подсветка-контур" поверх иконки
      ctx.shadowBlur = Math.max(6, 22 / globalScale);
      ctx.shadowColor = hexToRgba(color, 0.9);
      ctx.strokeStyle = hexToRgba(color, 0.9);
      ctx.lineWidth = Math.max(1, 2 / globalScale);
      roundedRectPath(ctx, x, y, w * 1.02, h * 1.02, Math.min(w, h) * 0.16);
      ctx.stroke();

      ctx.restore();
    }

    // --- сама иконка
    if (img.complete && img.naturalWidth > 0) {
      try {
        ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
      } catch {
        // если вдруг бросит, дорисуем заглушку
        ctx.save();
        ctx.fillStyle = "#f1f3f5";
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    } else {
      // заглушка пока грузится/ошиблась
      ctx.save();
      ctx.fillStyle = "#f1f3f5";
      ctx.beginPath();
      ctx.ellipse(x, y, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // --- подпись
    const fontSize = 14 / globalScale;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineWidth = 4 / globalScale;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(node.id, x, y + h * 0.55);
    ctx.fillStyle = "#1f2937";
    ctx.fillText(node.id, x, y + h * 0.55);
  };

  // === точная зона клика/драга — ровно по размеру иконки (скруглённая) ===
  const paintPointerArea = (
    node: NodeType,
    color: string,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
    const x = (node as any).x ?? 0;
    const y = (node as any).y ?? 0;
    const { w, h } = getIconMetrics(node, globalScale);
    ctx.save();
    ctx.fillStyle = color;
    roundedRectPath(ctx, x, y, w, h, Math.min(w, h) * 0.18);
    ctx.fill();
    ctx.restore();
  };

  const STAT = (v?: number, s = "") => (typeof v === "number" ? `${Math.round(v)}${s}` : "—");
  const showGraph = width > 10 && height > 10 && !isFetching;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Select
          data={profOptions}
          value={selectedProfId ? String(selectedProfId) : null}
          onChange={(v) => setSelectedProfId(v ? Number(v) : null)}
          placeholder="Профессия"
          searchable
          nothingFoundMessage="Нет вариантов"
          w={320}
        />
        <TextInput
          placeholder="Поиск по навыкам..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 220 }}
        />
      </div>

      <div ref={containerRef} className={styles.graphContainer}>
        {!showGraph ? (
          <Center h="100%">
            <Loader />
          </Center>
        ) : (
          <ForceGraph2D
            graphData={graphData}
            width={Math.floor(width)}
            height={Math.floor(height)}
            backgroundColor="#ffffff"
            nodeRelSize={6}
            linkCurvature={0.15}
            linkDirectionalParticles={0}
            cooldownTicks={120}
            // полностью заменяем базовый круг
            nodeCanvasObjectMode={() => "replace"}
            nodeCanvasObject={(n: any, ctx, scale) => drawNode(n as NodeType, ctx, scale)}
            // кликабельная/drag зона = реальный размер иконки
            nodePointerAreaPaint={(n: any, color, ctx, scale) =>
              paintPointerArea(n as NodeType, color, ctx, scale)
            }
            onNodeClick={(n) => setSelected(n as NodeType)}
          />
        )}
      </div>

      <Drawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        title="Информация о навыке"
        padding="md"
        position="right"
        size="md"
      >
        {selected ? (
          <>
            <Text fw={600} size="lg" mt="xs">
              {selected.id}
            </Text>

            {selected.group === "skill" ? (
              <>
                <Text mt="sm">Освоенность:</Text>
                <Badge color={(selected.user_proficiency ?? 0) > 0 ? "teal" : "gray"}>
                  {(selected.user_proficiency ?? 0) > 0 ? "Есть базовые знания" : "Пока не изучено"}
                </Badge>

                <Text mt="sm">Вклад в профиль:</Text>
                <Badge variant="light">{STAT(selected.percent, "%")}</Badge>

                <Text mt="sm">Встречаемость в вакансиях:</Text>
                <Badge variant="light">{STAT(selected.count)}</Badge>

                <Text mt="md" fw={500}>
                  Курсы:
                </Text>
                {!selectedSkillId ? (
                  <Text c="dimmed">Не найден id навыка — проверьте словарь навыков.</Text>
                ) : coursesLoading ? (
                  <Text c="dimmed">Загрузка...</Text>
                ) : !courses || courses.length === 0 ? (
                  <Text c="dimmed">Для этого навыка курсы не найдены.</Text>
                ) : (
                  <ul className={styles.courseList}>
                    {courses.map((c) => (
                      <li key={c.id} className={styles.courseItem}>
                        <Anchor
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.courseLink}
                          title={c.url}
                        >
                          {c.title || c.url}
                        </Anchor>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Text c="dimmed" mt="sm">
                Выберите конкретный навык, чтобы увидеть детали и курсы.
              </Text>
            )}
          </>
        ) : null}
      </Drawer>
    </div>
  );
};

// и именованный, и дефолтный экспорт
export default SkillGraphPage;
