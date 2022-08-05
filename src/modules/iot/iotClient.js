// https://aws.github.io/aws-iot-device-sdk-js-v2/index.html
import { mqtt } from 'aws-iot-device-sdk-v2';

export default function iotClient({ clientId, accessKeyId, secretKey, sessionToken, region, host, protocol }) {
  // options for connection: https://aws.github.io/aws-iot-device-sdk-js-v2/interfaces/mqtt.mqttconnectionconfig.html
  // events for connection:  https://aws.github.io/aws-iot-device-sdk-js-v2/classes/mqtt.mqttclientconnection.html
  const client = new mqtt.MqttClient();
  const connection = client.new_connection({
    clean_session: false,
    client_id: clientId,
    credentials: {
      aws_access_id: accessKeyId,
      aws_region: region,
      aws_secret_key: secretKey,
      aws_sts_token: sessionToken,
    },
    host_name: host,
    keep_alive: 30,
    websocket: {
      protocol,
    },
  });

  return {
    connection,

    connected: connection.connect(),

    disconnect() {
      connection.disconnect();
    },

    // AtMostOnce, AtLeastOnce, ExactlyOnce
    subscribe(topic, callback, qos = mqtt.QoS.AtMostOnce) {
      connection.subscribe(topic, qos, callback);
    },

    unsubscribe(topic) {
      connection.unsubscribe(topic); // This will remove all callbacks to this topic.
    },

    async publish(topic, payload, qos = mqtt.QoS.AtMostOnce) {
      try {
        await connection.publish(topic, JSON.stringify(payload), qos);
      } catch (error) {
        if (error.message !== 'packet is undefined') {
          console.error(error); // eslint-disable-line no-console
        }
      }
    },
  };
}
