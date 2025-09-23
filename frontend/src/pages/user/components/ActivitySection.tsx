import { Card, Paper } from "@mantine/core";
import {
  IconLogin,
  IconEdit,
  IconSend,
  IconCalendar,
} from "@tabler/icons-react";

type Activity = {
  type: "login" | "edit" | "send" | "other";
  description: string;
  timestamp: string;
};

const activityIcons = {
  login: <IconLogin size={18} />,
  edit: <IconEdit size={18} />,
  send: <IconSend size={18} />,
  other: <IconCalendar size={18} />,
};

const activities: Activity[] = [
  {
    type: "login",
    description: "Вход в систему",
    timestamp: "2025-03-28 09:42",
  },
  {
    type: "edit",
    description: "Обновлён профиль пользователя",
    timestamp: "2025-03-27 16:10",
  },
  {
    type: "send",
    description: "Отправлен отчёт менеджеру",
    timestamp: "2025-03-26 14:00",
  },
];

export default function ActivitySection() {
  return (
    <Card withBorder className="activity-card">
      <h2 className="section-title">Активность</h2>

      <div className="activity-list">
        {activities.map((act, index) => (
          <Paper key={index} withBorder className="activity-item">
            <div className="activity-icon">{activityIcons[act.type]}</div>
            <div className="activity-content">
              <div className="activity-text">{act.description}</div>
              <div className="activity-date">{act.timestamp}</div>
            </div>
          </Paper>
        ))}
      </div>
    </Card>
  );
}
