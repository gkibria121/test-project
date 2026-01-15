FROM node:24 AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
EXPOSE 5173
CMD ["sh", "-c", "npm run dev -- --host"]

FROM node:24 AS build
WORKDIR /app
COPY package*.json ./
# In case there is no package-lock yet, generate one or just install
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine as final
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
