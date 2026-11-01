from database import engine

try:
    with engine.connect() as connection:
        result = connection.exec_driver_sql("SHOW TABLES")

        print("Successfully connected to TiDB Cloud!")
        print("Database tables:")

        for row in result:
            print(row[0])

except Exception as e:
    print("Database connection failed:")
    print(e)