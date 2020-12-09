FROM node:15.3-slim


EXPOSE 5000

RUN mkdir -p /app

COPY package.json package-lock.json tsconfig.json webpack.config.js /app/
RUN npm -prefix /app install --no-optional && npm -prefix /app cache clean --force

COPY ./src/ /app/src/
RUN npm -prefix /app run build

COPY ./app/index.html /app/app/index.html

#CMD ["npm", "-prefix", "/app", "run", "serve"]