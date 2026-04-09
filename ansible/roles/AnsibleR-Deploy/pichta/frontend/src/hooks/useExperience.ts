import { useCallback, useMemo } from "react";
import {
  useGetAllExperienceQuery,
  useAddExperienceForSelfMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} from "@/app/redux/api/experience.api";
import type { ExperienceResponseI, ExperienceCreateI, ExperienceUpdateI } from "@/shared/types/api/ExperienceI";

function toYMD(v?: string | Date | null): string | null {
  if (!v) return null;
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useExperience(userId?: number) {
  const skip = !userId;

  const {
    data: experience = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllExperienceQuery(userId as number, {
    skip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const byId = useMemo(() => {
    const m = new Map<number, ExperienceResponseI>();
    (experience as ExperienceResponseI[]).forEach((e) => m.set(e.id, e));
    return m;
  }, [experience]);

  const [addSelfMut] = useAddExperienceForSelfMutation();
  const [updateMut] = useUpdateExperienceMutation();
  const [deleteMut] = useDeleteExperienceMutation();

  const add = useCallback(
    async (payload: ExperienceCreateI) => {
      const body: ExperienceCreateI = {
        title: payload.title,
        id_profession: payload.id_profession ?? null,
        description: payload.description ?? "",
        start_time: toYMD(payload.start_time) as string,
        end_time: toYMD(payload.end_time),
      };
      await addSelfMut(body).unwrap();
      await refetch();
    },
    [addSelfMut, refetch]
  );

  const update = useCallback(
    async (experience_id: number, patch: Partial<ExperienceUpdateI>) => {
      const current = byId.get(experience_id);
      if (!current) throw new Error("Experience entity not found in cache");
      if (!userId) throw new Error("userId is required");

      // backend ожидает ПОЛНЫЙ объект
      const body: ExperienceUpdateI = {
        title: patch.title ?? current.title,
        id_profession: patch.id_profession ?? current.id_profession ?? null,
        description: patch.description ?? current.description ?? "",
        start_time: toYMD(patch.start_time ?? current.start_time) as string,
        end_time: toYMD(patch.end_time ?? current.end_time),
      };

      await updateMut({ experience_id, user_id: userId, body }).unwrap();
      await refetch();
    },
    [byId, updateMut, refetch, userId]
  );

  const remove = useCallback(
    async (experience_id: number) => {
      if (!userId) throw new Error("userId is required");
      await deleteMut({ experience_id, user_id: userId }).unwrap();
      await refetch();
    },
    [deleteMut, refetch, userId]
  );

  return {
    list: experience as ExperienceResponseI[],
    isLoading: isLoading || isFetching || skip,
    refetch,
    add,
    update,
    remove,
  };
}
