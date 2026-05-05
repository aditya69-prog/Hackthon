FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY client/package.json client/
COPY server/package.json server/

# Install dependencies
RUN npm install

# Copy source code
COPY client client
COPY server server

# Build client
RUN npm run build --workspace=client

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start server
CMD ["npm", "run", "start:prod", "--workspace=server"]
