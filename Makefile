.PHONY:run

run: index.js
	Xephyr :4 -ac -screen 800x600 &
	DISPLAY=:4 node index.js &
	DISPLAY=:4 xterm &

stop:
	killall Xephyr node
