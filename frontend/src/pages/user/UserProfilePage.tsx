import { useState } from "react";
import { Tabs, Loader, Group } from "@mantine/core";
import { IconUser, IconBriefcase, IconListCheck, IconSettings } from "@tabler/icons-react";
import { useGetMeQuery } from "@/app/redux/api/auth.api";

import ProfileHeader from "./components/ProfileHeader";
import SkillsSection from "./components/SkillsSection";
import EducationSection from "./components/EducationSection";
import TasksSection from "./components/TasksSection";
import SettingsSection from "./components/SettingsSection";

export const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string | null>("profile");
  const { data: user, isLoading, isFetching, isError } = useGetMeQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading || isFetching) {
    return (
      <Group justify="center" my="xl">
        <Loader />
      </Group>
    );
  }

  if (isError || !user) {
    return (
      <div className="user-profile-page">
        <div className="user-profile-container">
          <h1 className="user-profile-title">Профиль пользователя</h1>
          <p>Не удалось загрузить пользователя.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <h1 className="user-profile-title">Профиль пользователя</h1>

        <div className="user-profile-header">
          <ProfileHeader user={user} key={`hdr-${user.id}`} />
        </div>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          classNames={{ tab: "user-profile-tab", list: "user-profile-tablist" }}
        >
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>Профиль</Tabs.Tab>
            <Tabs.Tab value="skills" leftSection={<IconBriefcase size={16} />}>Навыки и опыт</Tabs.Tab>
            <Tabs.Tab value="tasks" leftSection={<IconListCheck size={16} />}>Задачи</Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>Настройки</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <EducationSection userId={user.id} key={`edu-${user.id}`} />
          </Tabs.Panel>

          <Tabs.Panel value="skills">
            <SkillsSection userId={user.id} key={`skills-${user.id}`} />
          </Tabs.Panel>

          <Tabs.Panel value="tasks">
            {/* передаём userId, чтобы TasksSection НЕ запрашивал /user/me сам */}
            <TasksSection userId={user.id} key={`tasks-${user.id}`} />
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SettingsSection />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};
