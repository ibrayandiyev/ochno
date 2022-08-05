import _ from 'lodash';
import { reactive, computed } from 'vue';

import iotClient from './iotClient';
import spacesApi from '../spaces/api';

export const STATUS = {
  connecting: 'connecting',
  connected: 'connected',
  disconnected: 'disconnected',
};

const initTimeout = 1000;
const maxTimeout = 60 * 1000;

const iot = {
  client: null,
  options: null,
  listeners: [],
  timeout: initTimeout,
};

const state = reactive({
  accessData: null,
  fetching: false,
  status: STATUS.disconnected,
});

const getters = {
  connected: computed(() => (state.status === STATUS.connected)),
  connecting: computed(() => (state.fetching || state.status === STATUS.connecting)),
  disconnected: computed(() => (state.accessData && state.status === STATUS.disconnected)),
};

const isClient = (client) => iot.client && iot.client === client;

const machine = {
  async fetch(data = state.accessData) {
    const { spaceId } = data;
    if (!spaceId) {
      throw new Error(`Unable to set up IoT access token with supplied data: ${data}`);
    }

    state.fetching = true;
    try {
      iot.options = await spacesApi.iotAccess(spaceId);
      state.fetching = false;
    } catch (error) {
      iot.options = null;
      state.fetching = false;
      throw error;
    }
  },

  async connect(options = iot.options) {
    if (!options) {
      throw new Error('Missing IoT connection options');
    }

    state.status = STATUS.connecting;

    const client = iotClient(options);
    const { connection, connected, subscribe } = client;

    connection.on('connect', () => {
      if (isClient(client)) {
        state.status = STATUS.connected;
      }
    });
    connection.on('disconnect', () => {
      if (isClient(client)) {
        state.status = STATUS.disconnected;
      }
    });
    connection.on('reconnect', () => {
    });
    connection.on('error', (error) => {
      console.warn('IoT connection error', error); // eslint-disable-line no-console
      machine.restart(client);
    });
    connection.on('close', () => {
      machine.restart(client);
    });
    connection.on('interrupt', (error) => {
      console.log('IoT connection interrupt', error); // eslint-disable-line no-console
      if (isClient(client)) {
        state.status = STATUS.disconnected;
      }
    });
    connection.on('resume', () => {
      if (isClient(client)) {
        state.status = STATUS.connected;
      }
    });
    // connection.on('message', (topic, payload) => console.log(topic, payload));

    iot.client = client;
    // Subscribe to topics in case they have already been setup.
    iot.listeners.forEach(({ topic, callback }) => subscribe(topic, callback));

    return connected;
  },

  async start() {
    if (!state.accessData || state.status !== STATUS.disconnected) {
      // If there is no request token data, that means there should be no connection.
      // Do nothing if we already are trying to get connection details, or connecting.
      return;
    }

    if (!navigator.onLine) {
      // The browser does not have any internet connection, wait for a signal that it is restored.
      window.removeEventListener('online', machine.start); // Just in case it is already setup.
      window.addEventListener('online', machine.start, { once: true });
      return;
    }

    if (!iot.options) {
      try {
        await machine.fetch();
        await machine.connect();
        iot.timeout = initTimeout;
      } catch (error) {
        console.warn('Unable to start IoT connection', error); // eslint-disable-line no-console
        machine.restart();
      }
    }
  },

  stop(client = iot.client) {
    if (client) {
      client.disconnect();
    }
    if (isClient(client)) {
      iot.client = null;
      iot.options = null;
      state.status = STATUS.disconnected;
    }
  },

  async restart(client = iot.client) {
    const doReconnect = !client || isClient(client);
    machine.stop(client);

    if (doReconnect) {
      await new Promise((resolve) => setTimeout(() => resolve(), iot.timeout)); // eslint-disable-line no-promise-executor-return
      iot.timeout = Math.min(iot.timeout * 2, maxTimeout);
      machine.start();
    }
  },
};

const dispatch = {
  connect: (accessTokenData) => {
    state.accessData = accessTokenData;
    if (iot.client) {
      machine.restart();
    } else {
      machine.start();
    }
  },

  disconnect: () => {
    state.accessData = null;
    machine.stop();
  },

  /**
   * Listen to a message from the iot cloud.
   * @param {String} topic - A topic to listen/subscribe to.
   * @param {Function} callback - A callback function for when the subscription triggers.
   */
  listen: (topic, callback) => {
    if (!topic || !callback) {
      console.warn(`Adding listener is missing something: { topic: ${topic}, callback: ${callback} }`); // eslint-disable-line no-console
      return;
    }

    // Check if we already subscribe to the topic.
    if (!iot.listeners.find((listener) => listener.topic === topic && listener.callback === callback)) {
      iot.listeners.push({ topic, topicRegex: new RegExp(`^${topic.replace(/\+/g, '[^/]+').replace(/#+$/g, '')}`), callback });
      // topicRegex is for matching a message to a listener.
      // In case the user listens to an escaped topic, ex: p/+/example/#
      // The wildcards are never seen in the message trigger, it gets the full topic. See trigger function.

      if (iot.client) {
        iot.client.subscribe(topic, callback);
      }
    }
  },

  unlisten: (topic, callback) => {
    if (!topic) {
      // If no topic is set, clear all listeners.
      iot.listeners = [];
      return;
    }

    // NOTE: Splicing in looped array below, so let's not use forEach since it is not index protected.
    for (let i = 0; i < iot.listeners.length; i++) {
      const listener = iot.listeners[i];
      if (listener.topic === topic && (!callback || listener.callback === callback)) {
        iot.listeners.splice(i, 1);
        i -= 1;
      }
    }
  },

  /**
   * Publish a message to the iot cloud.
   * @param {String} topic - The topic of the message to publish.
   * @param {*} payload - Data that goes with the message. If no timestamp exists, it will be added to the payload as "t".
   */
  publish: ({ topic, payload }) => {
    if (!topic) {
      return console.warn(`Unable to send mqtt action due to missing topic. Payload: ${payload}`); // eslint-disable-line no-console
    }
    if (_.isEmpty(payload)) {
      return console.warn('Unable to send mqtt action due to empty payload.'); // eslint-disable-line no-console
    }
    if (!iot.client) {
      machine.reconnect();
      return console.warn('Unable to send mqtt action due to client missing.'); // eslint-disable-line no-console
    }

    const data = payload.t ? payload : { ...payload, t: Date.now() };
    return iot.client.publish(topic, data);
  },
};

export default {
  name: 'iot',
  state,
  getters,
  dispatch,
};
