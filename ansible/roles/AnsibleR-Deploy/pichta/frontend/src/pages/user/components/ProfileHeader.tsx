import { Avatar, Group, Text } from "@mantine/core";

type UserMe = { id: number; login?: string | null; role?: string | null };

export default function ProfileHeader({ user }: { user: UserMe }) {
  const name = user?.login ?? "—";
  const position = user?.role ?? "—";
  const initials = name ? name[0].toUpperCase() : "U";

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
