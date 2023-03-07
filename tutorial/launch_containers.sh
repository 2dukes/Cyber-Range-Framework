#!/bin/bash

docker run --name test_1 --ip 172.17.0.2 -d test
docker run --name test_2 --ip 172.17.0.3 -d test