import { useCreateUserMutation, useGetUsersQuery, usePatchUserMutation, useGetUserByIdQuery, useDeleteUserByIdMutation } from "@/app/redux/api/user.api"
import { CreateUserI, UpdateUserI, UserI } from "@/shared/types/api/UserI"
import { useCallback } from 'react'

export const useUsersAll = () => {
    const { data: users, error, isLoading, refetch } = useGetUsersQuery()
    return { users, error, isLoading, refetch }
}

export const useCreateUser = (): {
    handleCreateUser: (data: CreateUserI) => Promise<void>
    isLoading: boolean
} => {
    const [createUser, { isLoading }] = useCreateUserMutation()

    const handleCreateUser = useCallback(
        async (request: CreateUserI) => {
            console.log(request)
            await createUser(request)
        },
        [createUser]
    )

    return { isLoading, handleCreateUser }
}

export const useUpdateUser = (): {
    handlePatchUser: (data: UpdateUserI) => void;
    isLoading: boolean;
} => {
    const [patchUser, { isLoading }] = usePatchUserMutation();

    const handlePatchUser = useCallback(
        async (request: UpdateUserI) => {
            const patchResponse = await patchUser(request);
            if ('data' in patchResponse) {
                console.log("User successfully updated");
            } else {
                console.error("Failed to update user");
            }
        },
        [patchUser]
    );

    return { isLoading, handlePatchUser };
};



export const useGetUserDetails = (userId: number) => {
    const { data: userDetails, isLoading, refetch } = useGetUserByIdQuery(userId);
    return { userDetails, isLoading, refetch };
  }

  export const useDeleteUser = () => {
      const [deleteUserById, { isLoading }] = useDeleteUserByIdMutation();
      return { deleteUserById, isLoading };
  }
  