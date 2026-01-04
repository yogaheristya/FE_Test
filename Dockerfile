FROM node:20-slim

WORKDIR /app/web

# Copy dependency dulu
COPY web/package*.json ./
RUN npm install

# Copy source
COPY web/ .

# Build Next.js
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
