#!/usr/bin/env python3

import os
import sys
import time
import board
import busio
from adafruit_bme680 import Adafruit_BME680_I2C
import psycopg2
import statistics
import redis
import json
import logging
from datetime import datetime

# Configure logging to append to file — never overwrites existing logs
log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sensor.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(log_path, mode='a'),
        logging.StreamHandler(sys.stdout),
    ]
)
logger = logging.getLogger(__name__)

DB_CONFIG = {
    'dbname': 'sensor_db',
    'user': 'postgres',
    'password': 'postgres',
    'host': 'localhost',
    'port': '5432',
}


def wait_for_redis(host='localhost', port=6379, retries=20, delay=5):
    """Wait for Redis to become available, retrying on failure."""
    for attempt in range(1, retries + 1):
        try:
            r = redis.Redis(host=host, port=port, decode_responses=True)
            r.ping()
            logger.info("Connected to Redis successfully")
            return r
        except redis.ConnectionError as e:
            logger.warning(f"Redis not ready (attempt {attempt}/{retries}): {e}")
            if attempt == retries:
                logger.error("Max retries reached for Redis. Giving up.")
                raise
            time.sleep(delay)


def wait_for_postgres(retries=20, delay=5):
    """Wait for PostgreSQL to become available, retrying on failure."""
    for attempt in range(1, retries + 1):
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            conn.close()
            logger.info("PostgreSQL is ready")
            return
        except psycopg2.OperationalError as e:
            logger.warning(f"PostgreSQL not ready (attempt {attempt}/{retries}): {e}")
            if attempt == retries:
                logger.error("Max retries reached for PostgreSQL. Giving up.")
                raise
            time.sleep(delay)


def connect_postgres():
    """Open a PostgreSQL connection and ensure the readings table exists."""
    connection = psycopg2.connect(**DB_CONFIG)
    cursor = connection.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS environmental_readings (
        id SERIAL PRIMARY KEY,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        pressure REAL NOT NULL,
        gas REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ''')
    connection.commit()
    logger.info("PostgreSQL connection established")
    return connection, cursor


def init_sensor(i2c):
    """Initialise the BME680, retrying indefinitely until it responds."""
    while True:
        try:
            sensor = Adafruit_BME680_I2C(i2c)
            logger.info("BME680 sensor initialised successfully")
            logger.info(f"Temperature: {sensor.temperature:.2f} C")
            logger.info(f"Humidity:    {sensor.humidity:.2f} %")
            logger.info(f"Pressure:    {sensor.pressure:.2f} hPa")
            logger.info(f"Gas:         {sensor.gas:.2f} Ω")
            return sensor
        except Exception as e:
            logger.error(f"BME680 init failed: {e}. Retrying in 5 s...")
            time.sleep(5)


def main():
    logger.info("=" * 60)
    logger.info(f"Sensor service starting — {datetime.now().isoformat()}")
    logger.info("=" * 60)

    os.makedirs('../shared', exist_ok=True)

    i2c = busio.I2C(board.SCL, board.SDA)
    bme680 = init_sensor(i2c)

    wait_for_postgres()
    r = wait_for_redis()
    connection, cursor = connect_postgres()

    while True:
        try:
            temp_measurements = []
            humidity_measurements = []
            pressure_measurements = []
            gas_measurements = []

            for _ in range(60):
                try:
                    temp = bme680.temperature
                    humidity = bme680.humidity
                    pressure = bme680.pressure
                    gas = bme680.gas

                    temp_measurements.append(temp)
                    humidity_measurements.append(humidity)
                    pressure_measurements.append(pressure)
                    gas_measurements.append(gas)

                    data = {
                        "temperature": temp,
                        "humidity": humidity,
                        "pressure": pressure,
                        "gas": gas,
                    }
                    try:
                        r.publish("sensor-data", json.dumps(data))
                    except redis.RedisError as e:
                        logger.error(f"Redis publish error: {e}. Reconnecting...")
                        r = wait_for_redis()
                        r.publish("sensor-data", json.dumps(data))

                except Exception as e:
                    logger.error(f"Sensor read error: {e}")

                time.sleep(5)

            if not temp_measurements:
                logger.warning("No measurements collected this cycle — skipping DB insert")
                continue

            median_temperature = statistics.median(temp_measurements)
            median_humidity = statistics.median(humidity_measurements)
            median_pressure = statistics.median(pressure_measurements)
            gas_resistance = statistics.median(gas_measurements)

            try:
                cursor.execute('''
                INSERT INTO environmental_readings (temperature, humidity, pressure, gas)
                VALUES (%s, %s, %s, %s);
                ''', (median_temperature, median_humidity, median_pressure, gas_resistance))
                connection.commit()
                logger.info(
                    f"DB insert — temp={median_temperature:.2f} C  "
                    f"hum={median_humidity:.2f}%  "
                    f"pres={median_pressure:.2f} hPa  "
                    f"gas={gas_resistance:.2f} Ω"
                )
            except psycopg2.Error as e:
                logger.error(f"DB insert error: {e}. Reconnecting to PostgreSQL...")
                try:
                    connection.rollback()
                except Exception:
                    pass
                connection, cursor = connect_postgres()

        except Exception as e:
            logger.exception(f"Unexpected error in main loop: {e}")
            time.sleep(10)


if __name__ == '__main__':
    main()
