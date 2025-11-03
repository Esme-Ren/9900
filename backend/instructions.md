docker compose up in root directory to start backend + sql database



to view sql container
docker exec -it capstone-project-2025-t1-25t1-3900-h12b-banana-db-1 mysql -u root -p


for migrations:
python manage.py makemigrations
python manage.py migrate
