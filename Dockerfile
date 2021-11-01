FROM alpine:latest

RUN apk update && \
    apk add nodejs npm

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

RUN npm i -g serve

EXPOSE 5000
CMD ["serve", "-s", "/app/build/"]
