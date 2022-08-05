import { unref, watch, onUnmounted } from 'vue';

import iotStore from '../../modules/iot/store';
import { TOPICS } from '../../modules/iot/topics';
import portsStore from '../../modules/ports/store';

function portListener(topic, payload) {
  const topicParts = topic.split('/');
  if (topicParts.length === 6 && payload) {
    portsStore.dispatch.message({ id: topicParts[4], payload });
  }
}

export default function useIotSubscribe({ space }) {
  watch(
    () => unref(space),
    () => {
      const spac = unref(space);
      if (spac?.id) {
        iotStore.dispatch.unlisten();
        iotStore.dispatch.connect({ spaceId: spac.id });

        const ids = { accountId: spac.accountId, spaceId: spac.id, portId: '+', locationId: spac.attributes?.locationId };
        iotStore.dispatch.listen(TOPICS.port.outData(ids), portListener);
        iotStore.dispatch.listen(TOPICS.port.outStream(ids), portListener);
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    // NOTE: If a user logs out, they are no longer allowed in this component.
    //       Hence this will be destroyed and the iot will be disconnected.
    iotStore.dispatch.unlisten();
    iotStore.dispatch.disconnect();
  });

  return {};
}
