#!/bin/bash

curr_dir=$(pwd)

while true; do
    read cmd < "${curr_dir}/mypipe"
    if [ -z "$cmd" ]; then
        break
    fi

    echo "Issuing Command: $cmd"
    eval "$cmd"
    echo "Process Exited With Status Code: $?"
done
