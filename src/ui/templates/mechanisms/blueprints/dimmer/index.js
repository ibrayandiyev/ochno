import { setup as setupAssert } from '../../parts/Assert.vue';
import { setup as setupOnPortData } from '../../parts/OnPortData.vue';
import { setup as setupPortAction } from '../../parts/PortAction.vue';

export default {
  name: 'Dimmer control',
  description: 'Control your devices using a physical dimmer.',

  setup({ ids }) {
    return {
      parts: [
        setupOnPortData({ ids, data: ['dimmer.dimming'] }),
        setupAssert({ assert: '{data.dimmer.dimming}' }),
        setupPortAction({ ids, actionValue: '{data.dimmer.dimming}', options: { manual: true, relative: true } }),
      ],
    };
  },
};
