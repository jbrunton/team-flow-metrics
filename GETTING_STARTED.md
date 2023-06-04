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

### Cycle time strategy

By default, epic cycle times are derived from epic status changes. However, it is not uncommon for a team to forget to update epic statuses in Jira, so sometimes these cycle time data aren't useful. If this is the case, it may be helpful to use the provided "Story Cycle Time Strategy" which will compute epic cycle times based on when stories in the epic were started and completed.

This can be configured in the `metrics.config.js` file as follows:

```javascript
/** @typedef { import('./config').MetricsConfig } MetricsConfig */

const { applyStoryCycleTimeStrategy } = require('./config/cycle_time_strategies');

/** @type {MetricsConfig} */
module.exports = {
  jira: {
    // etc.
  },
  sync: {
    issues: {
      beforeSave(issues) {
        applyStoryCycleTimeStrategy({
          issueCollection: issues,
        });
      },
    },
  },
};

```

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
