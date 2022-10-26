FROM node:17.1 as build
# copy sources
COPY . /sources
WORKDIR /sources
# install dependencies
WORKDIR /sources
RUN npm install
# сюда надо передать STAGE_NAME извне, например так `docker build --build-arg STAGE_NAME=release ...`
ARG STAGE_NAME
ENV NODE_ENV=production
# build
RUN npm run build
# copy prod files
RUN cp -r migrations dist/
RUN cp config.yaml dist/
# show dist
WORKDIR /sources
RUN ls -la dist

FROM node:17.1-alpine
# copy build and prod files
COPY --from=build /sources/dist /opt/app
# setup exec application
WORKDIR /opt/app
CMD mkdir logs
ENV LOGGER_FILE_NAME=logs/trader.log
ENV CONFIG_PATH=config.yaml
ENTRYPOINT ["node", "main"]
EXPOSE 3000
