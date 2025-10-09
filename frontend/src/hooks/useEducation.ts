import { useCallback, useMemo } from "react";
import {
  useGetAllEducationQuery,
  useAddEducationMutation,
  useUpdateEducationMutation,
  useDeleteEducationMutation,
} from "@/app/redux/api/education.api";
import type {
  EducationResponseI,
  EducationCreateI,
  EducationUpdateI,
} from "@/shared/types/api/EducationI";

function toYMD(v?: string | Date | null): string | null {
  if (!v) return null;
  const d = typeof v === "string" ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useEducation(userId?: number) {
  const {
    data: education = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllEducationQuery(userId as number, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const byId = useMemo(() => {
    const m = new Map<number, EducationResponseI>();
    (education as EducationResponseI[]).forEach((e) => m.set(e.id, e));
    return m;
  }, [education]);

  const [addEducationMut] = useAddEducationMutation();
  const [updateEducationMut] = useUpdateEducationMutation();
  const [deleteEducationMut] = useDeleteEducationMutation();

  const add = useCallback(
    async (payload: Omit<EducationCreateI, "id_user">) => {
      if (!userId) throw new Error("userId is required");
      const body: EducationCreateI = {
        id_user: userId,
        type: payload.type,
        direction: payload.direction,
        start_time: toYMD(payload.start_time) ?? null,
        end_time: toYMD(payload.end_time) ?? null,
      };
      await addEducationMut({ user_id: userId, body }).unwrap();
      await refetch();
    },
    [addEducationMut, refetch, userId]
  );

  const update = useCallback(
    async (education_id: number, patch: Partial<EducationUpdateI>) => {
      if (!userId) throw new Error("userId is required");
      const current = byId.get(education_id);
      if (!current) throw new Error("Education entity not found in cache");

      // backend ожидает ПОЛНЫЙ объект + id_user
      const body: EducationUpdateI = {
        id_user: userId,
        type: patch.type ?? current.type,
        direction: patch.direction ?? current.direction,
        start_time: toYMD(patch.start_time ?? current.start_time) ?? null,
        end_time: toYMD(patch.end_time ?? current.end_time) ?? null,
      };

      await updateEducationMut({ education_id, user_id: userId, body }).unwrap();
      await refetch();
    },
    [byId, updateEducationMut, refetch, userId]
  );

  const remove = useCallback(
    async (education_id: number) => {
      if (!userId) throw new Error("userId is required");
      await deleteEducationMut({ education_id, user_id: userId }).unwrap();
      await refetch();
    },
    [deleteEducationMut, refetch, userId]
  );

  return {
    list: education as EducationResponseI[],
    isLoading: isLoading || isFetching || !userId,
    refetch,
    add,
    update,
    remove,
  };
}
