import _ from 'lodash';
import { computed } from 'vue';

import iotStore from '../../modules/iot/store';
import { TOPICS, SUFFIX } from '../../modules/iot/topics';
import portsStore from '../../modules/ports/store';
import workspaceStore from '../../modules/workspace/store';

export default function useIotPublish(props = {}) {
  const { space } = workspaceStore.getters;

  const sendSpace = computed(() => props.space?.value || space.value);

  /**
   * Publish a command to an iot device.
   */
  const publish = (payload, { ports = props.ports?.value, force, optimistic, suffix = SUFFIX.action } = {}) => {
    _.castArray(ports).forEach((portId) => {
      const port = portsStore.getters.full.value(portId);
      if (force || !_.isMatch(port.data, payload)) {
        if (optimistic) { // Optimist approach, set the payload already and hope that the action will be a success.
          portsStore.dispatch.merge({ id: portId, data: payload });
        }

        const topic = TOPICS.port.in({ accountId: sendSpace.value.accountId, spaceId: sendSpace.value.id, locationId: sendSpace.value.attributes?.locationId, portId }, suffix);
        iotStore.dispatch.publish({ topic, payload });
      }
    });
  };

  /**
   * Publish an action command to the iot device using a path and a value.
   * This function only sends one value, if you want to send several, use portPublish.
   *
   * NOTE: By default this uses the property this.port. It needs to exist in the component that uses this mixin to work.
   *       Otherwise supply a port, or array of ports, as the third argument.
   *
   * Example:
   *  portPublishValue('lamp.level', 80);
   *  => Is the same as doing:
   *  portPublish({ lamp: { level: 80 } });
   */
  const publishValue = (path, value, options) => publish(_.set({}, path, value), options);

  /**
   * Send an action command to the iot device using a path and an explicit number.
   * This function only sends one number, if you want to send several, use portPublishValue.
   *
   * NOTE: By default this uses the property this.port. It needs to exist in the component that uses this mixin to work.
   *       Otherwise supply a port, or array of ports, as the third argument.
   *
   * Example:
   *  portPublishNumber('lamp.level', 80);
   *  => Is the same as doing:
   *  portPublish({ lamp: { level: 80 } });
   */
  const publishNumber = (path, number, options) => {
    const value = parseInt(number, 10);
    if (!_.isNaN(value)) {
      publishValue(path, value, options);
    }
  };

  return {
    publish,
    publishValue,
    publishNumber,
  };
}
