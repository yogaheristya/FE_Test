FROM node:20

WORKDIR /app/web

# Copy package.json & package-lock.json dulu untuk caching layer
COPY web/package*.json ./

# Install dependencies bersih
RUN npm install

# Copy seluruh source code (exclude node_modules via .dockerignore)
COPY web/ .

EXPOSE 3000

CMD ["npm", "run", "dev"]
