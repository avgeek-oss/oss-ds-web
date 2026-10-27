FROM node:24.22.1-alpine3.24@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build
WORKDIR /app
RUN npm install --global pnpm@11.5.3
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:storybook

FROM nginxinc/nginx-unprivileged@sha256:27985295bdb22a1ef8f712863210bd5877c0f3006494a593e86b3fe0fa55467e AS runtime
COPY --chown=101:101 infra/storybook/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/storybook-static/ /usr/share/nginx/html/
USER 101:101
EXPOSE 8080
