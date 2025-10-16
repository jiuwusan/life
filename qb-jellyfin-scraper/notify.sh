#!/bin/sh

SCRAPER_SERVER_URL="http://pm2:30001/medias/refresh"

PAYLOAD=$(cat <<EOF
{
  "client": "$1",
  "action": "$2",
  "hash": "$3",
  "name": "$4",
  "category": "$5",
  "savePath": "$6",
  "size": "$7"
}
EOF
)

curl -s -X POST -H "Content-Type: application/json" -d "$PAYLOAD" "$SCRAPER_SERVER_URL"

exit 0