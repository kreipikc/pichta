import { useState } from "react";
import { Avatar, Button, Modal, TextInput, Group } from "@mantine/core";
import Cookies from 'js-cookie';

export default function ProfileHeader() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: Cookies.get("mock_name"),
    position: Cookies.get("mock_position") || "Нет позиции",
    email: Cookies.get("mock_username"),
    phone: "+7 (999) 123-45-67",
  });

  const handleAvatarChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAvatar(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (field: keyof typeof profileData, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const closeModal = () => setIsEditModalOpen(false);

  return (
    <>
      <Modal
        opened={isEditModalOpen}
        onClose={closeModal}
        title="Редактировать профиль"
        centered
      >
        <div className="profile-form">
          <TextInput
            label="Имя"
            value={profileData.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          <TextInput
            label="Email"
            value={profileData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          <TextInput
            label="Телефон"
            value={profileData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <TextInput
            label="Должность"
            value={profileData.position}
            onChange={(e) => handleChange("position", e.target.value)}
          />
          <Button fullWidth mt="md" color="teal" onClick={closeModal}>
            Сохранить
          </Button>
        </div>
      </Modal>

      <div className="profile-header">
        <div className="profile-header-left">
          <Avatar
            src={avatar}
            size={96}
            radius="xl"
            className="profile-avatar"
          />
          <div className="profile-info">
            <h2 className="profile-name">{profileData.name}</h2>
            <p className="profile-position">{profileData.position}</p>
            <p className="profile-phone">{profileData.phone}</p>
          </div>
        </div>

        <Group gap="sm">
          <Button
            variant="light"
            color="teal"
            component="label"
          >
            Загрузить фото
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                handleAvatarChange(e.target.files?.[0] || null)
              }
            />
          </Button>
          <Button
            variant="outline"
            color="teal"
            onClick={() => setIsEditModalOpen(true)}
          >
            Редактировать
          </Button>
        </Group>
      </div>
    </>
  );
}
