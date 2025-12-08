FROM node:18-alpine

WORKDIR /app

# Install dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    noto-sans

# Copy package files
COPY package*.json ./

# Install npm dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port
EXPOSE 3001

# Set environment variable for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Start application
CMD ["npm", "start"]
