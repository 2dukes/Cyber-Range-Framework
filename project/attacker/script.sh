#!/usr/bin/with-contenv bash

set -ex

startxfce4 & 2> /dev/null

websockify --web=/usr/share/novnc/ 6080 localhost:5900 &

Xvfb ":1" -screen 1 "1280x600x24" &

x11vnc -display :1 -autoport -localhost -nopw -bg -xkb -ncache -ncache_cr -quiet -forever

tail -f /dev/null
