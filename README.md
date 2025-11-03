# Cloud-Deployed Website: http://3.26.130.141:3000/

# About The Project 
The **SDG Knowledge System** provides comprehensive and relevant information on the United Nations’ 17 Sustainable Development Goals (SDGs).  
It enables individuals, educators, and organizations to meaningfully engage with the SDGs, supporting informed decision-making and real-world action.

### Features
- **SDG Education Database** – Over **3,000 entries** with in-depth SDG-related education insights.
- **SDG Action Database** – More than **1,500 curated items** showcasing actionable plans and real-world examples.
- **SDG Keyword Search** – Search words or phrases to identify relevance to the 17 SDGs and 169 targets.
- **SDG Expert Chatbot** – Quickly find SDG information and brainstorm impactful action plans.

This project is part of the **Digital Sustainability Knowledge Hub Education** initiative, sponsored by the **UNSW Business School SDG Committee**.



## Technologies Used
- **Frontend:** React  
- **Backend:** Django REST Framework  
- **Database:** MySQL  
- **Containerization:** Docker, Docker Compose  
- **Real-time Collaboration:** Django Channels, Redis  
- **Optional Integration:** Google Docs API & Google Drive API

## Docker
This project leverages Docker to build and deploy the codebase both locally and for production environments.
Install Docker for [Windows](https://docs.docker.com/desktop/setup/install/windows-install/), [Mac](https://docs.docker.com/desktop/setup/install/mac-install/), and [Linux](https://docs.docker.com/desktop/setup/install/linux/).

## Environment Variables
The [docker-compose](docker-compose.yml) file will retrieve certain environment variables from
a `.env` file if present. Otherwise, it will use some default values that were populated
for development.

If you wish to use this in production, you can set up a `.env` file by duplicating
and renaming our [.env-template](.env-template) file, which has already been populated
with the same development default values mentioned previously.

Note that after the database has been deployed with a password, it will retain
that password after subsequent builds, even if the environment variable changes.

To fix this issue, you may either prune the database volume or manually change its
password.

Refer to the [Querying MySQL Database](#directly-querying-the-mysql-database)
section for more information on changing the password.

# Google Docs Integration Guide

### SDG Form System & Google Docs API Quick Integration Guide

## Quick Start

**Before first use:**
- In the `frontend` directory, run:
  ```bash
  npm install date-fns
  ```

### 1. Google Cloud Setup
- Create/select a project at [Google Cloud Console](https://console.cloud.google.com/)
- Enable Google Docs API and Google Drive API
- Create credentials:
  - For dev/testing: OAuth 2.0 Client ID (Web/Desktop), set redirect URI (e.g. `http://localhost:8000/auth/google/callback`)
  - For production: Service Account (Editor role), download JSON key
- Place `credentials.json` in `backend/app/`
- (Optional) Share target Drive folder with service account email

### 2. Environment Variables
Add to `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
```

### 3. Backend Setup
- Install dependencies:
  ```bash
  pip install google-api-python-client channels channels-redis
  ```
- In `settings.py`:
  ```python
  INSTALLED_APPS += ['channels']
  ASGI_APPLICATION = '_config.asgi.application'
  CHANNEL_LAYERS = {
      'default': {
          'BACKEND': 'channels_redis.core.RedisChannelLayer',
          'CONFIG': {"hosts": [os.environ.get('REDIS_URL', 'redis://localhost:6379/0')]},
      },
  }
  GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
  GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
  GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')
  ```
- Run migrations:
  ```bash
  python manage.py makemigrations sdg_action_plan
  python manage.py migrate
  ```

### 4. API Endpoints
- `POST /api/sdg-action-plan/{id}/google-docs/` — Sync/Create Google Doc
- `GET /api/sdg-action-plan/{id}/google-docs/status/` — Get Doc status

### 5. Frontend Integration
- On receiving `auth_required` and `auth_url`, prompt user to authorize, then retry
- WebSocket supported for real-time collaboration

### 6. Security
- Do NOT commit `credentials.json` to version control
- Service account must have Docs/Drive edit permissions

### 7. Example Structure
```
backend/app/
├── credentials.json
├── token.pickle
├── manage.py
└── ...
```

---
For more details, see:
- [Google Docs API Docs](https://developers.google.com/docs/api)
- [Google Drive API Docs](https://developers.google.com/drive)
- [Django Channels Docs](https://channels.readthedocs.io/)

# How to Deploy Locally
To deploy, you can run the following command in the project's root directory.
```
docker compose up
```
If you wish to deploy in detached mode (i.e., in server contexts):
```
docker compose up -d
```
You can then access the frontend website on:
```
localhost:3000
```
# Docker Deployment Guide

## Server Information
- Server IP: 3.26.130.141

## Access URLs
- Frontend: http://3.26.130.141:3000
- Backend API: http://3.26.130.141:8000

## Prerequisites
- Docker installed on your system
- Docker Compose (included with Docker Desktop)

## Quick Start
1. Clone the repository
2. Navigate to project root directory
3. Run the following command:
```bash
docker compose up
```

## Detailed Deployment Steps

### 1. Environment Setup
Create a `.env` file by copying `.env-template`:
```bash
cp .env-template .env
```

### 2. Database Configuration
The default database credentials are:
- Database: `sdgdb`
- User: `root`
- Password: `3900banana`

To change the password after deployment:
```bash
docker exec -it capstone-project-25t2-9900-f12a-bread-main-db-1 mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '<YOUR_NEW_PASSWORD>';
FLUSH PRIVILEGES;
quit
```

### 3. Service Ports
- Frontend: 3000
- Backend: 8000
- Database: 3306 (exposed as 3307)

### 4. Production Build
For production deployment, use the production Dockerfiles:
- Frontend: `Prod-Dockerfile`
- Backend: `Dockerfile`

### 5. Stopping Services
To stop all services:
```bash
docker compose down
```

## Troubleshooting
- If services fail to start, check logs with:
```bash
docker compose logs
```
- For database connection issues, verify the database container is running:
```bash
docker ps
```

# How to Deploy on Cloud
Deploying on cloud depends on your own cloud solution. The existing Dockerfiles
are able to be used in cloud deployment. 

For the frontend service, refer to the Prod-Dockerfile for a production-optimised
build.



# Directly Querying the MySQL Database
Enter the following command to connect to the database Docker container:
```
docker exec -it capstone-project-2025-t1-25t1-3900-h12b-banana-db-1 mysql -u root -p
```
The default password is `3900banana`.

To change the password of the database after it has been created, use the following
commands:
```
docker exec -it capstone-project-2025-t1-25t1-3900-h12b-banana-db-1 mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '<YOUR_NEW_PASSWORD>';
FLUSH PRIVILEGES;
quit
```

# Running Django Migrations
All existing models in the Django backend have had migrations created.

If any updates to a model are made, please run the following commands:
```
docker exec -it capstone-project-2025-t1-25t1-3900-h12b-banana-web-1 python manage.py makemigrations <affected-django-app>
docker exec -it capstone-project-2025-t1-25t1-3900-h12b-banana-web-1 python manage.py migrate --fake-initial
```
