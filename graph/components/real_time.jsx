import React, { useEffect, useState } from 'react';

const RealTime = () => {
  const [sensorData, setSensorData] = useState(null);

  useEffect(() => {
    const socket = new WebSocket('ws://raspberrypi:5000/ws');
    console.log(socket);

    socket.onmessage = (event) => {
      console.log(event);
      setSensorData(event.data);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => socket.close();
  }, []);

  return (
    <div>
      <h1>Real-Time Sensor Data</h1>
      {sensorData ? (
        <div>
          <p>Temperature: {sensorData.temperature} °C</p>
          <p>Humidity: {sensorData.humidity} %</p>
          <p>Pressure: {sensorData.pressure} hPa</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RealTime;
