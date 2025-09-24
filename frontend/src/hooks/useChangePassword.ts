import { useChangePasswordMutation } from "@/app/redux/api/user.api";

export function useChangePassword() {
  const [mutate, { isLoading, error }] = useChangePasswordMutation();

  /**
   * Меняет пароль.
   * @returns true — успех, false — ошибка (текст можно взять из catch)
   */
  const changePassword = async (current: string, next: string): Promise<boolean> => {
    try {
      await mutate({ current, next }).unwrap();
      return true;
    } catch {
      return false;
    }
  };

  return { changePassword, isLoading, error };
}
