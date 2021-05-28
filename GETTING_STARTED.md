# Getting Started

## Configuration

Make a copy of the example configuration files:

```
cp example.env .env
cp api/example.metrics.config.js api/metrics.config.js
```

Then complete the relevant configuration details in these two new files (credentials in the `.env` file, and other settings in `metrics.config.js`).

In general, the two files have two different purposes:

* `/.env` includes environment variables which are 1) relevant to deployment configurations (e.g. database names, local port numbers), and also variables which 2) are secrets which should not be committed to source control. This file should never be committed.
* `/api/metrics.config.js` includes configuration code which is highly specific to interpreting data from your Jira instance. It may be convenient to commit this file to source control.

## Running the app

First time setup:

```
npm install
NODE_ENV=development npm run db:migrate
```

Then, to run the app:

```
docker-compose up
```

(This will take a few moments to build the container images the first time you start it.)

You should find the app running at http://localhost:3001/.

# Syncing data

Currently you need to navigate to http://localhost:3001/api/sync. You can watch the progress in the logs. This will be improved in future.

# Development

## Running tests

You can run unit tests locally with `npx lerna run test:unit`, or simply with `jest` from the relevant package directory.

API integration tests require a database and docker. Run `npx lerna run test:integration` from the root directory. (You'll need to run `NODE_ENV=test npm run db:setup` the first time.)

## Database migrations

See the `db:*` commands in the root package. Note that you can run `npm run db:reset` to recreate the database at any point.
