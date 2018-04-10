const PlantServiceConfig = {
    enabled: true,
    name: 'Plant Sensor Monitoring Service',
    arduinoAddress: '/dev/ttyACM0',
    serialPort: 0,
    baud: 115200,
    polling: {
        enabled: true,
        interval: 50
    }
}

module.exports = PlantServiceConfig;