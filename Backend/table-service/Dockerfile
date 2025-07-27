# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port for table-service
EXPOSE 5002

# Start the service
CMD ["npm", "start"]
