# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend-app
COPY frontend-app/package*.json ./
RUN npm install
COPY frontend-app/ ./
RUN npm run build

# Stage 2: Production Node.js Server
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend code, migrations & seeds
COPY backend/ ./backend/

# Ensure images directory exists
RUN mkdir -p /app/images

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend-app/dist ./frontend-app/dist

# Expose standard Railway port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start backend (serves API + React frontend)
CMD ["node", "backend/app.js"]
