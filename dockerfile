# Use the official Nginx image as the base image
FROM nginx:latest

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration to the container
COPY nginx.conf /etc/nginx/conf.d/

# Copy your static website files to the Nginx HTML directory
COPY dist/ /usr/share/nginx/html/

# Expose port 80 to allow external access
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
