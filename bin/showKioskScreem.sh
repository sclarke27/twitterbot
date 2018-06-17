echo 'launch chrome in kiosk mode'
DISPLAY=:0 chromium-browser --kiosk http://127.0.0.1:8080/plantMon &
echo 'done'

