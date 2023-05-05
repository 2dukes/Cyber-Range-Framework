#!/bin/bash

# Install websocketd
websocketd --port=8080 ./script_pipe.sh &

./script_cancelpipe.sh
