# Team Flow Metrics

A project for displaying flow metrics (throughput, cycle time, CFDs, etc.) inspired by [Actionable Agile Metrics for Predictability](https://www.goodreads.com/book/show/25867120-actionable-agile-metrics-for-predictability) by Daniel Vacanti.

Very much under development.

# Getting Started

## Configuration

Make a copy of the example .env file:

```
cp .env.example .env
```

Then complete the relevant configuration details for your Jira domain and user in the `.env` file.

## Running the app

First time setup:

```
npm install
NODE_ENV=development npm run db:setup
```

Then, to run the app:

```
docker-compose up
```

You should find the app running at http://localhost:3001/.

# Syncing data

Currently you need to navigate to http://localhost:3001/api/sync. You can watch the progress in the logs. This will be improved in future.

# Development

## Running tests

You can run unit tests locally with `npm run test:unit` from either the `client/` or `server/` directories, or simply with `jest`.

API integration tests require a database and docker. Run `npm run api:test:integration` from the root directory. (You'll need to run `NODE_ENV=test npm run db:setup` the first time.)

## Database migrations

See the `db:*` commands in the root package. Note that you can run `npm run db:reset` to recreate the database at any point.
