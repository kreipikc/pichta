import { useState } from "react";
import { Tabs } from "@mantine/core";
import { IconUser, IconBriefcase, IconListCheck, IconSettings } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppSelector";

import ProfileHeader from "./components/ProfileHeader";
import SkillsSection from "./components/SkillsSection";
import EducationSection from "./components/EducationSection";
import TasksSection from "./components/TasksSection";
import SettingsSection from "./components/SettingsSection";

export const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string | null>("profile");
  const user = useAppSelector((s) => s.user.currentUser);

  if (!user) return null; // пока AuthProvider подтягивает /me

  return (
    <div className="user-profile">
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
            <EducationSection userId={user.id} />
          </Tabs.Panel>
          <Tabs.Panel value="skills">
            <SkillsSection userId={user.id} />
          </Tabs.Panel>
          <Tabs.Panel value="tasks">
            <TasksSection userId={user.id} />
          </Tabs.Panel>
          <Tabs.Panel value="settings">
            <SettingsSection />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};
