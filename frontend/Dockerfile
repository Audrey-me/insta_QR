FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy over the package.json content and package-lock.json file to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application over to the container
COPY . .

# Expose the port on which the app runs 
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]  # Change from "npm start" to "npm run dev"
