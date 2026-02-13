# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production --localize

# Production stage
FROM nginx:alpine

# Copy all localized builds to nginx html directory
COPY --from=build /app/dist/angular-project/browser/en-US /usr/share/nginx/html/en-US
COPY --from=build /app/dist/angular-project/browser/sq /usr/share/nginx/html/sq
COPY --from=build /app/dist/angular-project/browser/it /usr/share/nginx/html/it
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
