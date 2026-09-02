# Install 'concurrently' globally to run multiple processes in one terminal
Write-Host "Installing 'concurrently' globally..." -ForegroundColor Cyan
npm install -g concurrently

# Ensure all dependencies are installed just in case
Write-Host "Verifying all dependencies are installed..." -ForegroundColor Cyan
cd backend/gateway; npm install; cd ../..
cd backend/services/auth; npm install; cd ../../..
cd backend/services/chat; npm install; cd ../../..
cd backend/services/agent; npm install; cd ../../..
cd backend/services/billing; npm install; cd ../../..
cd frontend; npm install; cd ..

# Start all microservices and frontend simultaneously
Write-Host "Starting all Microservices and the Frontend..." -ForegroundColor Green

concurrently `
  "cd backend/gateway && npm start" `
  "cd backend/services/auth && npm start" `
  "cd backend/services/chat && npm start" `
  "cd backend/services/agent && npm start" `
  "cd backend/services/billing && npm start" `
  "cd frontend && npm run dev -- --host"
