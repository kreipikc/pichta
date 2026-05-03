# Frontend проекта PICHTA

Клиентское приложение: React 18, TypeScript, Vite, Redux Toolkit (RTK Query), Mantine UI.

## 🏗️ Структура проекта
```
pichta
└── frontend              # Frontend часть
    ├── .gitignore
    ├── declarations.d.ts # Декларации типов для модулей и ассетов
    ├── index.html        # HTML-шаблон точки входа Vite
    ├── package.json      # Зависимости и npm-скрипты
    ├── package-lock.json
    ├── readme.md
    ├── tsconfig.json     # Конфигурация TypeScript
    ├── tsconfig.node.json
    ├── vite-env.d.ts     # Типы окружения Vite
    ├── vite.config.ts    # Конфигурация сборщика Vite
    └── src
        ├── index.css     # Глобальные стили
        ├── index.tsx
        ├── main.tsx      # Точка входа приложения
        ├── app                   # Корень приложения: маршруты, store, тема
        │   ├── App.tsx
        │   ├── context
        │   │   └── auth-provider
        │   │       └── AuthProvider.tsx    # Провайдер сессии / авторизации
        │   ├── redux
        │   │   ├── api                   # RTK Query: запросы к backend API
        │   │   │   ├── auth.api.ts
        │   │   │   ├── baseQuery.ts      # Базовый fetch с токенами и URL API
        │   │   │   ├── education.api.ts
        │   │   │   ├── endpoints.api.ts
        │   │   │   ├── endpoints.ts      # Пути и сборка URL эндпоинтов
        │   │   │   ├── experience.api.ts
        │   │   │   ├── graph.api.ts
        │   │   │   ├── me.api.ts
        │   │   │   ├── profession.api.ts
        │   │   │   ├── role.api.ts
        │   │   │   ├── skill.api.ts
        │   │   │   ├── task.api.ts
        │   │   │   └── user.api.ts
        │   │   └── store
        │   │       ├── index.ts
        │   │       ├── store.ts          # Конфигурация Redux store
        │   │       ├── middlewares
        │   │       │   └── errorToast.ts # Показ ошибок API через toast
        │   │       └── reducers
        │   │           └── userSlice.ts  # Состояние текущего пользователя
        │   ├── routes
        │   │   ├── AppRoutes.tsx         # Общая разводка маршрутов
        │   │   ├── helper.ts
        │   │   ├── routes.ts             # Объявления маршрутов
        │   │   ├── types.ts
        │   │   └── routes-wrapper
        │   │       ├── AuthenticatedRoutes.tsx    # Маршруты для авторизованных
        │   │       └── UnAuthenticatedRoutes.tsx  # Логин, регистрация и т.д.
        │   └── theme
        │       └── theme.ts              # Тема Mantine / дизайн-токены
        ├── assets              # Статика: фон, иконки, favicon
        │   ├── bgAuth.svg
        │   ├── favicon.svg
        │   ├── skill-fallback.svg
        │   └── icons
        │       └── Icons.tsx             # Набор SVG/иконок приложения
        ├── components          # Переиспользуемые UI-блоки
        │   ├── app-wrapper
        │   │   └── AppWrapper.tsx
        │   ├── date-time-picker
        │   │   └── AppDateField.tsx
        │   ├── form-wrapper
        │   │   └── FormWrapper.tsx
        │   ├── header
        │   │   ├── MainHeader.module.css
        │   │   └── MainHeader.tsx
        │   ├── navigation
        │   │   ├── NavigationComponent.tsx
        │   │   └── NavigationMenu.tsx
        │   ├── table-wrapper
        │   │   └── PageWrapper.tsx
        │   └── user-button
        │       ├── UserButton.module.css
        │       └── UserButton.tsx
        ├── hooks                 # Хуки: авторизация, данные профиля, граф и др.
        │   ├── useAppDispatch.ts
        │   ├── useAppSelector.ts
        │   ├── useChangePassword.ts
        │   ├── useEducation.ts
        │   ├── useExperience.ts
        │   ├── useForgotPassword.ts
        │   ├── useGraphGanttSkills.ts
        │   ├── useLogin.ts
        │   ├── useQuery.ts
        │   ├── useQuestionnaireResult.ts
        │   ├── useRegister.ts
        │   ├── useRoutes.ts
        │   ├── useSkillGraph.ts
        │   ├── useSkillProcesses.ts
        │   ├── useTasks.ts
        │   ├── useUserProfileStore.ts
        │   └── useUsers.ts
        ├── layout
        │   └── app-layout
        │       └── AppLayout.tsx         # Общий каркас страниц (шапка, контент)
        ├── pages                 # Страницы по URL (feature-папки)
        │   ├── authorization
        │   │   ├── Authorization.tsx
        │   │   └── components
        │   │       └── LoginForm.tsx
        │   ├── forgot_password
        │   │   ├── ForgotPassword.tsx
        │   │   └── components
        │   │       └── ForgotPasswordForm.tsx
        │   ├── gantt                 # Диаграмма Ганта по навыкам
        │   │   ├── GanttChart.tsx
        │   │   ├── GanttChartPage.module.css
        │   │   └── components
        │   │       ├── gantt-scrollbar.css
        │   │       ├── GanttControls.tsx
        │   │       ├── GanttHeader.tsx
        │   │       ├── GanttRow.tsx
        │   │       ├── GanttTableLeft.tsx
        │   │       ├── GanttTimeline.tsx
        │   │       ├── SkillModal.tsx
        │   │       ├── TimelineBar.tsx
        │   │       ├── useGanttLayout.ts
        │   │       └── hooks
        │   │           ├── useDragPan.ts
        │   │           ├── useGanttController.ts
        │   │           └── useLocalPriority.ts
        │   ├── graph                 # Граф навыков / профессии
        │   │   ├── SkillGraphPage.module.css
        │   │   └── SkillGraphPage.tsx
        │   ├── questionnaire         # Анкета/онбординг
        │   │   ├── QuestionnairePage.tsx
        │   │   ├── components
        │   │   │   ├── EducationForm.tsx
        │   │   │   ├── ExperienceForm.tsx
        │   │   │   ├── GoalsForm.tsx
        │   │   │   ├── OrientationForm.tsx
        │   │   │   ├── SkillsForm.tsx
        │   │   │   └── SummaryModal.tsx
        │   │   └── context
        │   │       └── QuestionnaireContext.tsx
        │   ├── registration
        │   │   ├── Registration.tsx
        │   │   └── components
        │   │       └── RegisterForm.tsx
        │   └── user                # Профиль пользователя
        │       ├── UserProfilePage.tsx
        │       └── components
        │           ├── ActivitySection.tsx
        │           ├── EducationSection.tsx
        │           ├── ProfileHeader.tsx
        │           ├── SettingsSection.tsx
        │           ├── SkillsSection.tsx
        │           ├── TasksSection.tsx
        │           └── components
        │               ├── AddSkillModal.tsx
        │               ├── EducationModal.tsx
        │               ├── ExperienceModal.tsx
        │               └── task
        │                   ├── AddTaskModal.tsx
        │                   ├── StatusSelect.tsx
        │                   └── tasks.module.css
        └── shared              # Типы и утилиты без привязки к странице
            ├── types
            │   ├── types.ts
            │   └── api             # DTO/интерфейсы ответов API (по сущностям)
            │       ├── EducationI.ts
            │       ├── ExperienceI.ts
            │       ├── ForMyselfI.ts
            │       ├── GraphI.ts
            │       ├── ProfessionI.ts
            │       ├── SkillI.ts
            │       ├── TaskI.ts
            │       └── UserI.ts
            └── utils
                ├── critDatesFormat.ts
                └── dateFormat.ts
```

## 🚀 Запуск разработки

Из каталога `frontend/`:

```bash
npm install
npm run dev
```

Для оболочки PowerShell с [fnm](https://github.com/Schniz/fnm) при необходимости:

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
npm run dev
```
