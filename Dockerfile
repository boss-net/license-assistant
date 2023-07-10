# SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and CLA-assistant contributors
#
# SPDX-License-Identifier: Apache-2.0

FROM node:16-alpine

EXPOSE 5000

RUN addgroup -S license-assistant
RUN adduser -S -D -G license-assistant license-assistant

COPY . /license-assistant
WORKDIR /license-assistant

RUN npm install && npm run build && npm prune --production

USER license-assistant

CMD ["npm", "start"]