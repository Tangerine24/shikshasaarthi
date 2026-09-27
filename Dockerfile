# Multi-stage production build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests
COPY package.json ./

# Copy backend
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN cd backend && npm install

# Copy frontend
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build backend and frontend
RUN cd backend && npx prisma generate && npm run build
RUN cd frontend && npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies for backend
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/
RUN cd backend && npm install --omit=dev && npx prisma generate

# Copy built backend & frontend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma

# Create upload directory
RUN mkdir -p /app/backend/uploads

EXPOSE 5000

CMD ["sh", "-c", "cd backend && npx prisma db push && node dist/server.js"]
