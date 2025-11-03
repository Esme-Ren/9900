# See Docker Django guide for a more optimised production-stage Dockerfile
FROM python:3.13.2-alpine

# Set the working directory in the container to /backend
WORKDIR /backend

# Prevent Python from writing .pyc files to disk and enable unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Upgrade pip
RUN pip install --upgrade pip

# Copy and install dependencies
COPY requirements.txt /backend/
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your code into the container
COPY . /backend

EXPOSE 8000

# Starts the Django server
CMD [ "/backend/app/start.sh" ]
