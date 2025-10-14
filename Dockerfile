FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
# The log shows package-lock.json, but it is not provided. Using npm install.
RUN npm install

# Copy all project files
COPY . .

# Set the entrypoint to run the validation script
ENTRYPOINT ["/bin/sh"]
# , "entrypoint.sh"