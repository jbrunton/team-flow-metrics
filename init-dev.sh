#!/bin/bash

set -e

# Note: for this script to run against the correct database, make sure you
# aren't overriding the POSTGRES_HOST in your .env file.

docker-compose run -e NODE_ENV=development api npm run db:create
docker-compose run -e NODE_ENV=development api npm run db:migrate
docker-compose run -e NODE_ENV=development api npm run db:seed

echo "Setup complete. Run `docker-compose up` to start the app."