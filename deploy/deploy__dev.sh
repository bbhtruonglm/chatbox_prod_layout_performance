#!/bin/bash

# build code
npm run build-staging

# đẩy code build lên server
rsync -avz dist botx.dev.minh:/tmp/

# di chuyển code build vào thư mục nginx
ssh botx.dev.minh \
'sudo rm -rf /var/www/html/chat-staging-dev && sudo mv /tmp/dist /var/www/html/chat-staging-dev'