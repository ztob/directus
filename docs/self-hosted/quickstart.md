---
description:
  If you're looking for the fastest way to get up-and-running with Directus locally, this guide will get you there in minutes.
---

<script setup lang="ts">
import { data as packages } from '@/data/packages.data.js';
</script>

# Self-Hosting Quickstart

<iframe style="width:100%; aspect-ratio:16/9; margin-top: 2em;" src="https://www.youtube.com/embed/J7tFWxAGkh4" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Install Docker

You should have Docker installed and running on your machine. You can
[download it here](https://docs.docker.com/get-docker/).

::: info What Is Docker?

Docker is a developer tool that allows software-creators to distribute their work along with all dependencies and
required environment settings. This means that applications can run reliably and consistently, making it the perfect way
to use Directus both locally and in-production.

As soon as there are new releases of Directus, we publish them on
[Docker Hub](https://hub.docker.com/r/directus/directus).

:::

## Create a Docker Compose File

Create a new empty folder on your Desktop called `directus`.

Open a text editor such as Visual Studio Code, nano, Vim, TextEdit, or Notepad.

Copy and paste the following and save the file as `docker-compose.yml`:

```yaml-vue
version: "3"
services:
  directus:
    image: directus/directus:{{ packages.directus.version.full }}
    ports:
      - 8055:8055
    volumes:
      - ./database:/directus/database
      - ./uploads:/directus/uploads
      - ./extensions:/directus/extensions
    environment:
      KEY: "replace-with-random-value"
      SECRET: "replace-with-random-value"
      ADMIN_EMAIL: "admin@example.com"
      ADMIN_PASSWORD: "d1r3ctu5"
      DB_CLIENT: "sqlite3"
      DB_FILENAME: "/directus/database/data.db"
      WEBSOCKETS_ENABLED: true
```

Save the file. Let's step through it:

- This file defines a single Docker container that will use the specified version of the `directus/directus` image.
- The `ports` list maps internal port `8055` is made available to our machine using the same port number, meaning we can
  access it from our computer's browser.
- The`volumes` section maps internal `directus/database` and `directus/uploads` to our local file system alongside the
  `docker-compose.yml` - meaning data is backed up outside of Docker containers.
- The `environment` section contains any [configuration variables](/self-hosted/config-options.html) we wish to set.
  - `KEY` and `SECRET` are required and should be long random values. `KEY` is used for telemetry and health tracking,
    and `SECRET` is used to sign access tokens.
  - `ADMIN_EMAIL` and `ADMIN_PASSWORD` is the initial admin user credentials on first launch.
  - `DB_CLIENT` and `DB_FILENAME` are defining the connection to your database.
  - `WEBSOCKETS_ENABLED` is not required, but enables [Directus Realtime](/guides/real-time/getting-started/index.html).

The volumes section is not required, but without this, our database and file uploads will be destroyed when the Docker
container stops running. The default database is SQLite - a self-contained server-less database that stores data to a
file.

## Run Directus

::: tabs

== macOS/Linux

Open the Terminal and run the following commands one line at a time:

```
cd Desktop/directus
docker compose up
```

== Windows

Open the Command Line and run the following commands one line at a time:

```
cd Desktop\directus
docker compose up
```

:::

Directus should now be available at <a href="http://localhost:8055" target="_blank">http://localhost:8055</a> or
<a href="http://127.0.0.1:8055" target="_blank">http://127.0.0.1:8055</a>
