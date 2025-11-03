import mysql.connector
from mysql.connector import errorcode
# make sure to add this to requirements in venv later
# pip install mysql-connector-python

def test_db_connection():
    # Update these settings if you change them in your docker-compose file
    config = {
        'user': 'root',
        'password': '3900banana',  # Must match MYSQL_ROOT_PASSWORD in docker-compose.yml
        'host': '127.0.0.1',            # Using localhost to connect to the exposed port
        'database': 'sdgdb',       # Must match MYSQL_DATABASE in docker-compose.yml if set
        'port': 3306,
    }

    try:
        conn = mysql.connector.connect(**config)
        print("Successfully connected to the database!")
        
        cursor = conn.cursor()
        db = cursor.fetchone()
        print("Connected to:", db[0])
        
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        print("Tables in the database:", tables)
        
        for table in tables:
            table_name = table[0]
            print(f"\nContents of table '{table_name}':")
            if table_name == "action_db" or table_name == "education_db" or "sdgtargets" in table_name:
                continue
            
            cursor.execute(f"SELECT * FROM `{table_name}`;")
            rows = cursor.fetchall()
            
            column_names = [desc[0] for desc in cursor.description]
            print("Columns:", column_names)
            
            if rows:
                for row in rows:
                    print(row)
            else:
                print("No data found.")
        
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Access denied: check your username or password.")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("Database does not exist.")
        else:
            print("Error:", err)

if __name__ == "__main__":
    test_db_connection()