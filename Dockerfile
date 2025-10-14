FROM node:18-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
       git procps bash \
    && rm -rf /var/lib/apt/lists/*

# Install Node dependencies
COPY package.json ./
RUN npm install

# Copy all project files
COPY . .

# Set the entrypoint to run the validation script
ENTRYPOINT ["/bin/sh"]
