FROM node:latest


EXPOSE 5000

RUN mkdir -p /app

COPY package.json package-lock.json tsconfig.json webpack.config.js /app/
RUN npm -prefix /app install --no-optional && npm -prefix /app cache clean --force

COPY ./ /app/
RUN npm -prefix /app run build

CMD ["npm", "-prefix", "/app", "run", "serve"]