# Service API v1

### Triggers:
- `GET /triggers/last_mail` returns a JSON containing the last mail received
- `GET /triggers/room_temperature` returns a JSON containing a random temperature between 10°C and 20°C

### Actions:
- `POST actions/push_notification` send a push notification and a beep on server side
- `POST actions/new_mail` edit the last mail received from JSON post data
