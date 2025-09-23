import { Avatar, Group, Text, Loader } from '@mantine/core';
import { useGetMeQuery } from '@/app/redux/api/auth.api';

export default function ProfileHeader() {
  const { data: user, isFetching, isLoading } = useGetMeQuery();
  if (isLoading || isFetching) return <Loader size="sm" />;

  const name = user?.login ?? '—';
  const position = user?.role ?? '—';
  const initials = name ? name[0].toUpperCase() : 'U';

  return (
    <div className="profile-header">
      <Group justify="space-between" align="center">
        <Group align="center">
          <Avatar radius="xl" size={80}>{initials}</Avatar>
          <div>
            <Text size="xl" fw={700}>{name}</Text>
            <Text c="dimmed">{position}</Text>
          </div>
        </Group>
      </Group>
    </div>
  );
}
