-- Создание enum типа
CREATE TYPE user_role AS ENUM ('admin', 'user', 'manager');
CREATE TYPE skill_status AS ENUM ('inactive', 'process', 'complete');

-- Таблица пользователей
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    about_me TEXT,
    role user_role NOT NULL,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP
);

-- Таблица навыков
CREATE TABLE skills (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Таблица профессий
CREATE TABLE professions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lvl VARCHAR(50) NOT NULL
);

-- Таблица курсов
CREATE TABLE courses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    url VARCHAR(500) UNIQUE NOT NULL
);

-- Связь навыков и курсов
CREATE TABLE skill_to_course (
    id_skill INTEGER NOT NULL REFERENCES skills(id),
    id_course INTEGER NOT NULL REFERENCES courses(id),
    PRIMARY KEY (id_skill, id_course)
);

-- Связь профессий и курсов
CREATE TABLE profession_to_course (
    id_profession INTEGER NOT NULL REFERENCES professions(id),
    id_course INTEGER NOT NULL REFERENCES courses(id),
    PRIMARY KEY (id_profession, id_course)
);

-- Связь пользователей и навыков
CREATE TABLE user_skills (
    id_skill INTEGER NOT NULL REFERENCES skills(id),
    id_user INTEGER NOT NULL REFERENCES users(id),
    proficiency INTEGER NOT NULL,
    priority INTEGER,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status skill_status NOT NULL,
    PRIMARY KEY (id_skill, id_user)
);

-- Образование
CREATE TABLE education (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    id_user INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    direction VARCHAR(100) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    PRIMARY KEY (id, id_user)
);

-- Опыт работы
CREATE TABLE work_experience (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    id_user INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    id_profession INTEGER REFERENCES professions(id),
    description VARCHAR(500),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    PRIMARY KEY (id, id_user)
);

-- Задачи
CREATE TABLE tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY,
    id_user INTEGER NOT NULL REFERENCES users(id),
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    created_from INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (id, id_user)
);

-- Группы
CREATE TABLE groups (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Менеджеры групп
CREATE TABLE manager_to_group (
    id_group INTEGER NOT NULL REFERENCES groups(id),
    id_manager INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (id_group, id_manager)
);

-- Пользователи в группах
CREATE TABLE user_to_group (
    id_group INTEGER NOT NULL REFERENCES groups(id),
    id_user INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (id_group, id_user)
);

-- Желаемые профессии
CREATE TABLE wanted_profession (
    id_user INTEGER NOT NULL REFERENCES users(id),
    id_profession INTEGER NOT NULL REFERENCES professions(id),
    PRIMARY KEY (id_user, id_profession)
);

-- Достижения
CREATE TABLE achievements (
    id_user INTEGER NOT NULL REFERENCES users(id),
    id_profession INTEGER NOT NULL REFERENCES professions(id),
    date TIMESTAMP NOT NULL,
    PRIMARY KEY (id_user, id_profession)
);

-- Индексы для улучшения производительности
CREATE INDEX idx_user_skills_user ON user_skills (id_user);
CREATE INDEX idx_education_user ON education (id_user);
CREATE INDEX idx_experience_user ON work_experience (id_user);
CREATE INDEX idx_tasks_user ON tasks (id_user);