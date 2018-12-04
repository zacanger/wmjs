.PHONY:run
run: index.js
	Xephyr :3 -ac -screen 1920x1080 &
	DISPLAY=:3 node index.js &
	DISPLAY=:3 xterm &

kill:
	killall Xephyr node
