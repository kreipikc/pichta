import { useCallback } from "react";
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

export function useEducation(userId?: number) {
  const skip = !userId;

    const {
        data: education = [],
        isLoading,
        isFetching,
        refetch,
        } = useGetAllEducationQuery(userId, {
        skip: !userId,
        refetchOnMountOrArgChange: true,
        refetchOnFocus: true,
        refetchOnReconnect: true,
    });

  const [addEducationMut] = useAddEducationMutation();
  const [updateEducationMut] = useUpdateEducationMutation();
  const [deleteEducationMut] = useDeleteEducationMutation();

  const add = useCallback(
    async (payload: Omit<EducationCreateI, "id_user">) => {
      if (!userId) return;
      const body: EducationCreateI = {
        id_user: userId,
        type: payload.type,
        direction: payload.direction,
        start_time: payload.start_time ?? null,
        end_time: payload.end_time ?? null,
      };
      await addEducationMut(body).unwrap();
      await refetch();
    },
    [userId, addEducationMut, refetch]
  );

  const update = useCallback(
    async (education_id: number, payload: Omit<EducationUpdateI, "id_user">) => {
      if (!userId) return;
      const body: EducationUpdateI = {
        id_user: userId,
        type: payload.type,
        direction: payload.direction,
        start_time: payload.start_time ?? null,
        end_time: payload.end_time ?? null,
      };
      await updateEducationMut({ education_id, body }).unwrap(); // <— ВАЖНО: body
      await refetch();
    },
    [userId, updateEducationMut, refetch]
  );

  const remove = useCallback(
    async (education_id: number) => {
      await deleteEducationMut(education_id).unwrap();
      await refetch();
    },
    [deleteEducationMut, refetch]
  );

  return {
    list: education as EducationResponseI[],
    isLoading: isLoading || isFetching || skip,
    refetch,
    add,
    update,
    remove,
  };
}
