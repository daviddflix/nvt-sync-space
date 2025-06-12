FROM node:20

WORKDIR /usr/src/app

# Copy only package files first
COPY package*.json ./

# Install ALL dependencies including dev dependencies
RUN npm install

# Then copy the rest of the code
COPY . .

# Install nodemon globally for development
RUN npm install -g nodemon ts-node-dev

EXPOSE 3000

# Use ts-node-dev for hot reloading in development
CMD ["ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]