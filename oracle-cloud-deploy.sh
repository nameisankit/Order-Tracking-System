#!/bin/bash

# Oracle Cloud Free Tier Deployment Script
# This script deploys the Order Tracking System to Oracle Cloud Free Tier

set -e

echo "Starting deployment to Oracle Cloud Free Tier..."

# Configuration
ORACLE_USER="${ORACLE_USER:-ubuntu}"
ORACLE_IP="${ORACLE_IP:-your-oracle-cloud-ip}"
PROJECT_DIR="/home/${ORACLE_USER}/order-tracking-system"

# Check if SSH connection is available
echo "Checking SSH connection..."
ssh -o StrictHostKeyChecking=no ${ORACLE_USER}@${ORACLE_IP} "echo 'SSH connection successful'"

# Create project directory on remote server
echo "Creating project directory on remote server..."
ssh ${ORACLE_USER}@${ORACLE_IP} "mkdir -p ${PROJECT_DIR}"

# Copy files to remote server
echo "Copying files to remote server..."
if [ -f .env ]; then
  echo "Using local .env for deployment."
  scp -r docker-compose.yml \
        .env \
        .env.example \
        backend/Dockerfile \
        frontend/Dockerfile \
        frontend/nginx.conf \
        ${ORACLE_USER}@${ORACLE_IP}:${PROJECT_DIR}/
else
  echo "No local .env found, sending only .env.example."
  scp -r docker-compose.yml \
        .env.example \
        backend/Dockerfile \
        frontend/Dockerfile \
        frontend/nginx.conf \
        ${ORACLE_USER}@${ORACLE_IP}:${PROJECT_DIR}/
fi

# Pull and start containers
echo "Pulling and starting containers..."
ssh ${ORACLE_USER}@${ORACLE_IP} << ENDSSH
  cd ${PROJECT_DIR}

  if [ ! -f .env ]; then
    cp .env.example .env
    echo "No .env found. Created from .env.example."
  fi
  
  # Update docker-compose.yml with your Docker Hub credentials if needed
  # sed -i 's|your-dockerhub-username|${DOCKER_USERNAME}|g' docker-compose.yml
  
  docker-compose pull
  docker-compose up -d
  
  # Clean up old images
  docker system prune -f
ENDSSH

echo "Deployment completed successfully!"
echo "Access your application at: http://${ORACLE_IP}"
