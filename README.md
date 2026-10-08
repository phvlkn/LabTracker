# LabTracker

LabTracker — персональный трекер учебных курсов и заданий. Проект последовательно развивается в лабораторных работах курса Fullstack.

Текущее состояние:

- ЛР №1: интерфейс React + TypeScript, основные экраны и маршрутизация;
- ЛР №2: FastAPI, PostgreSQL, SQLAlchemy и CRUD предметных сущностей;
- ЛР №3: модульная структура frontend, интерактивные формы, состояния и демонстрационное локальное хранение;
- ЛР №4: регистрация, вход, выход, JWT access token, refresh token и защита данных пользователя.

В ЛР №3 курсы и задания сохраняются в `localStorage`. Это соответствует методичке: до интеграции в ЛР №5 разрешены демонстрационные данные. Авторизация ЛР №4 уже обращается к настоящему API и PostgreSQL.

## Возможности

- регистрация, вход, восстановление сессии и выход;
- доступ к основным страницам только после входа;
- отдельные курсы и задания для каждого пользователя на backend;
- сводка по статусам, срокам и просроченным работам;
- создание, изменение и удаление курсов и заданий в интерактивном frontend;
- фильтрация заданий по курсу, статусу и типу;
- клиентская валидация форм и понятные состояния загрузки, ошибки и отсутствия данных;
- защищённый CRUD API с валидацией и корректными HTTP-статусами.

## Маршруты frontend

| Маршрут | Назначение | Доступ |
| --- | --- | --- |
| `/login` | Вход | публичный |
| `/register` | Регистрация | публичный |
| `/` | Сводка | только после входа |
| `/courses` | Список и создание курсов | только после входа |
| `/courses/:id` | Карточка курса | только после входа |
| `/assignments` | Задания и фильтры | только после входа |
| `/assignments/new` | Создание задания | только после входа |
| `/assignments/:id` | Карточка задания | только после входа |
| `/assignments/:id/edit` | Редактирование задания | только после входа |

## Структура frontend

Frontend организован по упрощённому Feature-Sliced Design:

```text
frontend/src/
├── app/          # сборка приложения, маршруты и глобальные providers
├── pages/        # компоненты отдельных экранов
├── features/     # пользовательские действия: формы и фильтры
├── entities/     # типы и правила предметных сущностей
├── shared/       # API-клиент, общие компоненты и demo-данные
├── main.tsx      # точка входа React и тема Ant Design
└── styles.css    # общие стили, адаптивность и анимации
```

Поток запуска: `index.html` → `src/main.tsx` → `src/App.tsx` → `src/app/App.tsx`. Затем подключаются `AuthProvider` и `DemoDataProvider`, React Router выбирает страницу, а страница собирается из features, entities и shared-компонентов.

## Структура backend

```text
backend/app/
├── main.py          # создание FastAPI, CORS, routers и lifespan
├── config.py        # настройки из переменных окружения
├── database.py      # engine, SessionLocal и зависимость get_db
├── models.py        # таблицы SQLAlchemy и связи
├── schemas.py       # Pydantic-схемы запросов и ответов
├── routers/         # HTTP-маршруты
├── services.py      # CRUD и проверки владельца
├── auth_service.py  # регистрация, вход, refresh и logout
├── security.py      # Argon2, JWT и хеш refresh token
├── dependencies.py  # извлечение текущего пользователя
└── migrations.py    # перенос данных ЛР №2 на схему ЛР №4
```

Поток защищённого запроса: router → `get_current_user` → проверка JWT → service → SQLAlchemy session → PostgreSQL → Pydantic-ответ.

## Модель данных

- `User`: email, имя, Argon2-хеш пароля;
- `Course`: владелец, название, описание;
- `Assignment`: курс, тип, статус, дедлайн и оценка;
- `RefreshToken`: пользователь, SHA-256-хеш токена, срок действия и момент отзыва;
- связи: `User 1 → M Course`, `User 1 → M RefreshToken`, `Course 1 → M Assignment`;
- внешние ключи используют каскадное удаление.

## Запуск

Нужны Node.js 20+, Python 3.11+ и запущенный PostgreSQL.

Первичная подготовка базы:

```sql
CREATE ROLE labtracker WITH LOGIN PASSWORD 'labtracker';
CREATE DATABASE labtracker OWNER labtracker;
```

Backend, первый терминал:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
python -m app.init_db
uvicorn app.main:app --reload
```

Frontend, второй терминал:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Открыть:

- приложение: `http://localhost:5173`;
- Swagger: `http://127.0.0.1:8000/docs`;
- проверка API: `http://127.0.0.1:8000/health`.

`npm run build` только создаёт production-сборку в `frontend/dist`; он не запускает сайт. Посмотреть её можно командой `npm run preview`.

## Проверка

```bash
cd frontend
npm run lint
npm run build

cd ../backend
source .venv/bin/activate
pytest -q
```

Тесты проверяют CRUD, изоляцию данных пользователей, валидацию, Argon2-хеш пароля, access token, ротацию и отзыв refresh token.

## API авторизации

| Метод | Маршрут | Назначение |
| --- | --- | --- |
| `POST` | `/api/auth/register` | регистрация |
| `POST` | `/api/auth/login` | выдача access и refresh token |
| `POST` | `/api/auth/refresh` | ротация refresh token и новый access token |
| `POST` | `/api/auth/logout` | отзыв refresh token текущей сессии |
| `GET` | `/api/users/me` | текущий пользователь по Bearer access token |

Маршруты `/api/courses` и `/api/assignments` защищены. Запись другого пользователя намеренно выглядит как отсутствующая и возвращает `404`.

## Безопасность конфигурации

Локальные `.env`, `.venv`, `node_modules`, сборка `dist` и файл ТЗ не попадают в Git. В репозитории остаются только безопасные примеры `.env.example`. Перед реальным развёртыванием необходимо заменить `SECRET_KEY` на случайное длинное значение и использовать HTTPS.

## Скриншоты и защита

Скриншоты находятся в [`docs/screenshots`](docs/screenshots), а подробный сценарий запуска, демонстрации и ответы на вопросы — в [`docs/DEFENSE.md`](docs/DEFENSE.md).

## История этапов

- 10.09.2026 — ЛР №1: экраны, React Router, Ant Design и адаптивная вёрстка;
- 02.10.2026 — ЛР №2: FastAPI, PostgreSQL, SQLAlchemy, CRUD и тесты;
- 09.10.2026 — ЛР №3: упрощённый FSD, интерактивные формы, состояния и анимации;
- 09.10.2026 — ЛР №4: пользователи, Argon2, JWT, refresh-сессии и защищённые ресурсы.
