FROM alpine:3.7
MAINTAINER GoCD Contributors <go-cd-dev@googlegroups.com>

EXPOSE 5000

COPY . /license-assistant
WORKDIR /license-assistant

RUN \
  apk add --update nodejs su-exec git curl bzip2 patch make g++ && \
  addgroup -S license-assistant && \
  adduser -S -D -G license-assistant license-assistant && \
  chown -R license-assistant:license-assistant /license-assistant && \
  su-exec license-assistant /bin/sh -c 'cd /license-assistant && npm install && node_modules/grunt-cli/bin/grunt build && rm -rf /home/license-assistant/.npm .git' && \
  apk del git curl bzip2 patch make g++ && \
  rm -rf /var/cache/apk/*

USER license-assistant
CMD npm start
