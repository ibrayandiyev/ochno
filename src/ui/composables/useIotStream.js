import _ from 'lodash';
import { watch, watchEffect, onUnmounted } from 'vue';

import useIotPublish from './useIotPublish';
import iotStore from '../../modules/iot/store';

const maxStreams = 10;
const forceDuration = 60;

export default function useIotStream(props) {
  const { publish } = useIotPublish(props);

  const streamingThrottle = _.throttle(() => {
    if (Array.isArray(props.ports.value) && props.ports.value.length <= maxStreams) {
      publish({ duration: forceDuration });
      streamingThrottle();
    }
  }, forceDuration * 1000, { leading: false });
  // Leading needs to be set to false since the throttle calls itself, otherwise it will fire both on leading and trailing.

  watch(
    () => props.ports.value,
    (newValue, oldValue) => {
      if (!Array.isArray(newValue) || !newValue.length) {
        streamingThrottle.cancel();
      } else if (!Array.isArray(oldValue) || _.without(newValue, ...oldValue).length) {
        streamingThrottle(newValue);
        if (iotStore.getters.connected.value) {
          streamingThrottle.flush();
        }
      }
    },
  );

  watchEffect(() => {
    if (iotStore.getters.connected.value) {
      streamingThrottle.flush();
    }
  });

  onUnmounted(() => streamingThrottle.cancel());
}
