# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

ARG REACT_APP_API_BASE_URL=http://localhost:8080/api
ARG REACT_APP_WS_URL=http://localhost:8080/ws
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
