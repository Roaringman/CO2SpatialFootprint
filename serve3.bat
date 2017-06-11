setlocal
set port=8089
start /b py -m http.server %port%
start "" "http://localhost:%port%/"
pause
