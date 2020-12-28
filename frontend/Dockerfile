FROM node:15.3-slim as build_stage

RUN mkdir -p /app && rm -rf /app/app/*

COPY package.json package-lock.json tsconfig.json webpack.config.js /app/
RUN npm -prefix /app install --no-optional && npm -prefix /app cache clean --force

COPY ./src/ /app/src/
RUN npm -prefix /app run build

COPY ./app/index.html /app/app/index.html

FROM nginx:1.18 as runing_state
COPY --from=build_stage /app/app /usr/share/nginx/html
EXPOSE 80

CMD ["nginx","-g","daemon off;"]
