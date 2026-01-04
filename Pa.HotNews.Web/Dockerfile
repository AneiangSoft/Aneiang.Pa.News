# Stage 1: Build the React application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ["Pa.HotNews.Web/package*.json", "./"]

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY ["Pa.HotNews.Web/", "./"]

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:1.25-alpine

# Copy the build output from the build stage to Nginx's web root directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration file
COPY ["Pa.HotNews.Web/nginx.conf", "/etc/nginx/conf.d/default.conf"]

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]

