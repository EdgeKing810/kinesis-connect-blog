FROM nginx:1.21.3-alpine

RUN apk update && \
    apk add nodejs npm

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build
RUN rm -rf /usr/share/nginx/html/*
RUN cp -r /app/build/* /usr/share/nginx/html/

EXPOSE 80
