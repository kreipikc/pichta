import { useState } from "react";
import { Tabs } from "@mantine/core";
import {
  IconUser,
  IconBriefcase,
  IconListCheck,
  IconHistory,
  IconSettings,
} from "@tabler/icons-react";

import ProfileHeader from "./components/ProfileHeader";
import SkillsSection from "./components/SkillsSection";
import EducationSection from "./components/EducationSection";
import TasksSection from "./components/TasksSection";
import ActivitySection from "./components/ActivitySection";
import SettingsSection from "./components/SettingsSection";

export const UserProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string | null>("profile");

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        <h1 className="user-profile-title">Профиль пользователя</h1>

        <div className="user-profile-header">
          <ProfileHeader />
        </div>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          classNames={{
            tab: "user-profile-tab",
            list: "user-profile-tablist",
          }}
        >
          <Tabs.List>
            <Tabs.Tab value="profile" leftSection={<IconUser size={16} />}>
              Профиль
            </Tabs.Tab>
            <Tabs.Tab value="skills" leftSection={<IconBriefcase size={16} />}>
              Навыки и опыт
            </Tabs.Tab>
            <Tabs.Tab value="tasks" leftSection={<IconListCheck size={16} />}>
              Задачи
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Настройки
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="profile">
            <EducationSection />
          </Tabs.Panel>

          <Tabs.Panel value="skills">
            <SkillsSection />
          </Tabs.Panel>

          <Tabs.Panel value="tasks">
            <TasksSection />
          </Tabs.Panel>

          <Tabs.Panel value="settings">
            <SettingsSection />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};
