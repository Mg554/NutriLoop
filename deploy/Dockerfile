# Serves the PWA build (dist/) — put it behind your HTTPS reverse proxy.
FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
