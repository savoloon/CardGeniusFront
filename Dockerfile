FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Dev: Vite HMR
FROM deps AS dev

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Quality gate: lint + unit tests must pass before production build
FROM deps AS quality

COPY . .

RUN npm run lint
RUN npm run test

# Production static build (inherits quality — image build fails if checks fail)
FROM quality AS build

ARG VITE_API_URL=/api
ARG VITE_KEY_CAPTCHA=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_KEY_CAPTCHA=$VITE_KEY_CAPTCHA

RUN npm run build

# Nginx serves the built SPA and proxies /api to the backend
FROM nginx:alpine AS prod

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
