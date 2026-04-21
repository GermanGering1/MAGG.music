# MAGG.music

Музыкальная платформа основанная на концепции copyleft.

## Docker

Приложение подготовлено для запуска в контейнере через `docker compose`.

### 1) Создать внешнюю сеть `proxy` (один раз)

```bash
docker network create proxy
```

### 2) Собрать и запустить

```bash
docker compose up -d --build
```

После запуска приложение будет доступно на `http://localhost:8080`.
