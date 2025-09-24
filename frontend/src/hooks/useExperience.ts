import { useCallback } from "react";
import {
  useGetAllExperienceQuery,
  useAddExperienceForSelfMutation,
  useUpdateExperienceMutation,
  useDeleteExperienceMutation,
} from "@/app/redux/api/experience.api";
import type { ExperienceResponseI, ExperienceCreateI, ExperienceUpdateI } from "@/shared/types/api/ExperienceI";

export function useExperience(userId?: number) {
  const skip = !userId;

  const {
    data: experience = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAllExperienceQuery(userId, {
    skip,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [addSelfMut] = useAddExperienceForSelfMutation();
  const [updateMut] = useUpdateExperienceMutation();
  const [deleteMut] = useDeleteExperienceMutation();

  const add = useCallback(
    async (payload: ExperienceCreateI) => {
      await addSelfMut(payload).unwrap();
      await refetch();
    },
    [addSelfMut, refetch]
  );

  const update = useCallback(
    async (experience_id: number, payload: ExperienceUpdateI) => {
      await updateMut({ experience_id, data: payload }).unwrap();
      await refetch();
    },
    [updateMut, refetch]
  );

  const remove = useCallback(
    async (experience_id: number) => {
      await deleteMut(experience_id).unwrap();
      await refetch();
    },
    [deleteMut, refetch]
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
