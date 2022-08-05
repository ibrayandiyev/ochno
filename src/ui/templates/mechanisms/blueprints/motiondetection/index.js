import { setup as setupAssert } from '../../parts/Assert.vue';
import { setup as setupOnPortData } from '../../parts/OnPortData.vue';
import { setup as setupPortAction } from '../../parts/PortAction.vue';
import { setup as setupWait } from '../../parts/Wait.vue';

const tenMinutesInMs = 10 * 60 * 1000;

export default {
  name: 'Motion detection',
  description: 'Control your devices by triggering on motion detection.',

  setup({ ids }) {
    return {
      parts: [
        setupOnPortData({ ids, data: ['sensor.motion'] }),
        setupAssert({ assert: '{data.sensor.motion}' }),
        setupPortAction({ ids, options: { activeMs: 1050 } }),
        setupWait({ ms: tenMinutesInMs }),
        setupPortAction({ ids }),
      ],
    };
  },
};
