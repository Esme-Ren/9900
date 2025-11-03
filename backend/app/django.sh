#!/bin/sh 
echo "Creating Migrations..."
flag=0
for app in *
do
  if [ $flag -eq 0 ]
  then
    (python3 manage.py makemigrations $app && echo -e "\t\xE2\x9C\x94 " $app) || {
      flag=1
      echo "Failed Migrations for"
      echo -e "\t\xE2\x9C\x97 " $app
    }
  else
    echo -e "\t\xE2\x9C\x97 " $app
  fi
done

if [ $flag -eq 0 ]
then
  echo "Starting Migrations..."
  python3 manage.py migrate --fake-initial
fi

