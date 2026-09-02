@echo off
echo Starting all microservices and frontend...

:: Run concurrently to start all processes in the same terminal
npx concurrently "cd backend/gateway && npm start" "cd backend/services/auth && npm start" "cd backend/services/chat && npm start" "cd backend/services/agent && npm start" "cd backend/services/billing && npm start" "cd frontend && npm run dev"
