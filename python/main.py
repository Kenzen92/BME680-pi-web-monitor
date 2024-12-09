import os
import time
import board
import busio
from adafruit_bme680 import Adafruit_BME680_I2C
import psycopg2
import statistics
import redis

def main():
    print("Running main")

    # Ensure the shared directory exists
    os.makedirs('../shared', exist_ok=True)

    # Create I2C bus
    i2c = busio.I2C(board.SCL, board.SDA)

    # Create sensor object
    bme680 = Adafruit_BME680_I2C(i2c)
    print("BME680 sensor initialized")

    # Test Redis connection
    try:
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        # Check if Redis server is reachable
        r.ping()
        print("Connected to Redis successfully")
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        print("Make sure the Redis server is running and accessible.")
        return  # Exit the script if Redis is not available

    # Connect to the PostgreSQL database
    connection = psycopg2.connect(
        dbname='sensor_db',
        user='postgres',
        password='postgres',
         host='localhost',
        port='5432'
    )
    cursor = connection.cursor()
    print("Connection & cursor made:", cursor, connection)

    # Create the table if it doesn't exist
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS environmental_readings (
        id SERIAL PRIMARY KEY,             -- Unique ID for each record
        temperature REAL NOT NULL,        -- Temperature in Celsius
        humidity REAL NOT NULL,           -- Humidity in percentage
        pressure REAL NOT NULL,           -- Pressure in hPa
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of the reading
    );
    ''')
    connection.commit()

    # Main loop to print sensor readings
    while True:
        i = 0

        temp_measurements = []
        humidity_measurements = []
        pressure_measurements = []
        while i < 60:
            # Add recordings to the array for historical logs
            temp_measurements.append(bme680.temperature)
            humidity_measurements.append(bme680.humidity)
            pressure_measurements.append(bme680.pressure)
            
            # Add data to the redis queue for instant monitoring
            data = {
            "temperature": bme680.temperature,
            "humidity": bme680.humidity,
            "pressure": bme680.pressure,
            }
            r.publish("sensor-data", str(data))
            time.sleep(5)
            i += 1

        # Now we have 5 mins worth of data. Time to find the median for each value and create a single database input
        median_temperature = statistics.median(temp_measurements)
        median_humidity = statistics.median(humidity_measurements)
        median_pressure = statistics.median(pressure_measurements)

        cursor.execute('''
        INSERT INTO environmental_readings (temperature, humidity, pressure)
        VALUES (%s, %s, %s);
        ''', (median_temperature, median_humidity, median_pressure))
        connection.commit()

if __name__ == '__main__':
    main()
