FROM node:17.1 as build
COPY . /sources

# Install dependencies and build app
WORKDIR /sources
RUN npm install
# сюда надо передать STAGE_NAME извне, например так `docker build --build-arg STAGE_NAME=release ...`
ARG STAGE_NAME
RUN npm run build

WORKDIR /sources
# Print distribute folder
RUN ls -la build

FROM nginx:1.21.4
COPY --from=build /sources/deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /sources/build /opt/app
EXPOSE 80
