FROM node:15

WORKDIR /usr/src/app

COPY package.json .

RUN yarn install

COPY . .

EXPOSE 8082
EXPOSE 3001

CMD [ "yarn", "start" ]
