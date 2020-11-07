FROM node:15

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

# prevents a bug on startup (see: https://github.com/facebook/create-react-app/issues/10110)
# cachebust ensures next RUN command is not cached
ARG CACHEBUST=1
RUN rm tsconfig.json

EXPOSE 3000

CMD [ "yarn", "start" ]