#!/bin/bash

cd "$( dirname "$0" )"

# Copy adminbot.js and flag file to Admin Bot API
docker cp ../adminbot.js admin_bot_api:/backend/controllers
docker cp .././flag.txt admin_bot_api:/backend/controllers

# Reload Docker container
docker restart admin_bot_api
