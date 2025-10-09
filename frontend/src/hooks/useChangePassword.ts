import { useChangePasswordMutation } from "@/app/redux/api/auth.api";

export function useChangePassword() {
  const [mutate, { isLoading, error }] = useChangePasswordMutation();
  
  const changePassword = async (current: string, next: string): Promise<boolean> => {
    try {
      await mutate({ old_password: current, new_password: next }).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  return { changePassword, isLoading, error };
}
