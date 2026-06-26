FROM node:22-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
