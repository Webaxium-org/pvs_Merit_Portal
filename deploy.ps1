# Pull latest code
Write-Host "Pulling latest code from Git..." -ForegroundColor Cyan
git pull

# Navigate to client folder
Write-Host "Navigating to client folder..." -ForegroundColor Cyan
Set-Location client

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
npm install

# Build the project
Write-Host "Building the project..." -ForegroundColor Cyan
npm run build

# Copy web.config to dist folder
Write-Host "Copying web.config..." -ForegroundColor Cyan
Copy-Item -Path "web.config.template" -Destination "dist/web.config" -Force

Write-Host "Deployment complete!" -ForegroundColor Green
Set-Location ..
