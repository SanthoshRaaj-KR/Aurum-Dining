# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Expose service port
EXPOSE 5001

# Start the service
CMD ["npm", "start"]
