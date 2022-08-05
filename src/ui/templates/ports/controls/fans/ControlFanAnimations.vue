<template>
  <div v-if="rpms.length" class="rpms-grid grid">
    <div v-for="(rpm, index) in rpms" :key="index" class="rpm-grid inline-grid">
      <h4>{{ rpm.label }}</h4>
      <Icon :type="rpm.icon" class="fan-icon font-big2" :style="{ 'animation-play-state': rpm.value ? 'running' : 'paused', 'animation-duration': rpm.anim }" />
      <div class="rpm">{{ rpm.value }} {{ $t('rpmUnit') }}</div>
    </div>
  </div>
</template>


<script>
import i18next from 'i18next';
import _ from 'lodash';
import { computed } from 'vue';

import portsStore from '../../../../../modules/ports/store';
import { RPM, TARGET, TARGET_KEYS } from '../../../../../modules/ports/info/fan';

const maxRpm = 3000;

export default {
  props: {
    portIds: { type: Array, default: () => [] },
    paths: { type: Array, default: () => TARGET_KEYS },
  },

  setup(props) {
    const rpmKeys = computed(() => props.paths.map((path) => path.replace(TARGET, RPM)));

    return {
      rpms: computed(() => {
        const values = Object.values(_.pick(portsStore.state.fan, props.portIds));
        const rpms = {};
        rpmKeys.value.forEach((key) => {
          const sum = _.sumBy(values, key);
          if (_.isNumber(sum)) {
            rpms[key] = sum;
          }
        });

        // The fan icon has a "max" spinning value of 1/6 seconds, where it looks completely still. Less than that and it looks like it's going backwards.
        return Object.keys(rpms).map((key) => {
          const value = Math.round(rpms[key]);
          return {
            value,
            icon: 'fan',
            label: i18next.t(`Fan ${key.split(RPM)[1]}`),
            anim: `${(maxRpm / 6) / value}s`,
          };
        });
      }),
    };
  },
};
</script>


<style scoped lang="less">
.rpms-grid {
  grid-template-columns: repeat(auto-fit, minmax(55px, 1fr));
}

.rpm-grid {
  justify-items: center;
  margin-top: 0;
}

.fan-icon {
  animation: rotate 0.5s infinite linear;
}
</style>
