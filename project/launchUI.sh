#!/bin/bash

docker-compose down
docker exec -it attackermachine tailscale logout 1>/dev/null 2>&1 ; docker exec -it kvmcontainer tailscale logout 1>/dev/null 2>&1

kill -9 $(ps -aux | grep "runWS.sh" | head -n 1 | tr -s " " | cut -d " " -f 2) &>/dev/null
kill -9 $(ps -aux | grep "websocketd --port=8080" | head -n 1 | tr -s " " | cut -d " " -f 2) &>/dev/null
kill -9 $(ps -aux | grep "runCancel.sh" | head -n 1 | tr -s " " | cut -d " " -f 2) &>/dev/null
docker rm -f $(docker ps -a | grep -Ewv "mongodb|backend|frontend|CONTAINER" | cut -d " " -f1) &>/dev/null

docker-compose up --build -d
cd ctfs/
python3 fetchCTFs.py

cd ../manager
./runWS.sh &!
./runCancel.sh &!