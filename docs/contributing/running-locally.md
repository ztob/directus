# Running Locally

> This guide explains how to install the _Development_ version of Directus locally so that you can work on the
> platform's source code. To install the _Production_ version locally, please follow to our
> [standard installation guides](/getting-started/installation/).

::: tip Minimum Requirements

You will need to have [the latest version of Node](https://nodejs.org/en/download/current/) to _build_ a Development
version of Directus.

You can use the JavaScript tool manager [volta](https://volta.sh/) to automatically install the current node and npm
versions.

:::

## 1. Fork the Directus repository

Go to the [repository](https://github.com/directus/directus) and fork it to your GitHub account. A fork is your copy of
the Directus repository. Forking the repository allows you to freely experiment with changes without affecting the
original project.

## 2. Clone from your repository

```bash
git clone git@github.com:YOUR-USERNAME/directus.git
```

## 3. Make a new branch

```bash
git checkout -b YOUR-BRANCH-NAME
```

## 4. Install the dependencies and build the project

```bash
npm install
npm run build
```

## 5. Create a `.env` file

Create a `.env` file under the `api` folder. You can use the `example.env` file provided under `api` as a starting
point.

```bash
# To use the example file
cp api/example.env api/.env
```

## 6. Initialize the database

For this step, you'll need to already have a SQL database up-and-running, except if you're using the SQLite driver,
which will create the database (file) for you.

To start the initialization run the following command:

```bash
# From within the root of the project
npm run cli bootstrap

# For SQLite you need to run the command in the 'api' context (to ensure the database file is created in the right directory)
npm run cli bootstrap --workspace=api
```

This will set-up the required tables for Directus and make sure all the migrations have run.

## 7. Start the development server

Run the following command from the root directory.

```bash
npm run dev
```

To work on a specific part of the platform, like just the app+api, you can provide the `scope` option as follows:

```bash
npm run dev -- --scope directus --scope @directus/app
```

::: warning Server startup

When using `npm run dev` without a provided `scope`, `ts-node-dev` can get a little confused with the many restarts on
first launch. Keep an eye out for the "directus: Server started at port xxxx" message. If that doesn't show up, try
restarting `npm run dev`.

:::

If are looking to work on the Documentation (public website version), you can navigate to the `docs` directory and run
the following command:

```bash
npm run dev:site
```

::: tip

If you encounter errors during this installation process, make sure your node version meets the
[minimum requirements](/guides/installation/cli)

:::

## 8. Make your fixes/changes

At this point you are ready to start working on Directus! Before diving in however, it's worth reading through the
introduction to [Contributing](/contributing/introduction).
