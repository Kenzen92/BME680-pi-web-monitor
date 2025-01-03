# BME680 Pi Sensor Suite

A Raspberry Pi-based project for reading values from the BME680 sensor, storing them in a PostgreSQL database, and serving them through a Go-based server with a React frontend for monitoring and analysis over the historical values.

---

## Features

- **BME680 Sensor Integration**: Reads temperature, humidity, pressure, and air quality data.
- **Data Storage**: Logs sensor readings into a PostgreSQL database.
- **Go Server**: Serves sensor data and the React-based web dashboard.
- **React Frontend**: Interactive interface for visualizing and analyzing sensor readings.

---

## Installation Instructions

### Requirements

Make sure the following are installed on your Raspberry Pi before proceeding:

- **Docker** & **Docker Compose**: To manage the Go server, database, and React frontend containers.
- **Node.js** & **npm**: To build and manage the React frontend.

### Steps to Set Up

1. **Clone or Download the Repository**:  
   Download and extract the repository or clone it directly:
   ```bash
   git clone https://github.com/Kenzen92/BME680-pi-web-monitor.git
   cd <repo-name>
   ```
2. **Run the Setup Script**:
   Execute the provided script to set up and install dependencies:

```bash
./sensor.sh
```

3. **Access the Application**:
   Once the setup completes, access the web dashboard via the Raspberry Pi's IP address on port 5000.
   React frontend: http://<raspberry-pi-ip>:5000
   Raw Data: frontend: http://<raspberry-pi-ip>:5000/readings?days=7 # Change the number of days to limit or extend the scope. The default is 7.

---

## Usage

The system runs the following components:

Sensor Reader: Reads data at five minute intervals from the BME680 sensor and stores it in the database.
Go Server: Handles API requests to fetch sensor readings. Serves either raw data, or the React frontend.
React Frontend: A web-based interface for visualizing data, containing beautiful graphs with a responsive layout.

### Contributing

This project is open-source and welcomes contributions. To suggest changes or improvements:

1. Fork the repository.
2. Make your changes.
3. Open a Pull Request (PR) for review.

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute the code as you wish. Contributions are encouraged through PRs to ensure improvements benefit the community.

### Support

For issues or questions, please open an issue in the repository.

Thank you for using the BME680 Pi Sensor Suite! 🎉
