FROM node:12-alpine AS BUILD_IMAGE

WORKDIR /usr/src/app

COPY . .

RUN yarn install

FROM node:12-alpine

WORKDIR /usr/src/app

EXPOSE 3000

# Copy from build image
COPY --from=BUILD_IMAGE /usr/src/app/ ./

# Environment variables are available
CMD cd packages/dashin && yarn build && yarn start

# If you need a smaller image, you can use the Dockerfile in `packages/dashin`.
