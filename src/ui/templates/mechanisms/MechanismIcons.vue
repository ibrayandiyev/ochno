<template>
  <div class="mechanism-icons">
    <Icon v-for="(type, index) in icons" :key="index" :type="type" />
  </div>
</template>


<script>
import _ from 'lodash';
import { computed } from 'vue';

import { SENSOR } from '../../../modules/ports/info/sensor';

function getIcons(part) {
  if (Array.isArray(part)) {
    return part.map(getIcons);
  }

  const { type } = part;
  if (type === 'assert') {
    return 'filter';
  }
  if (type === 'dateTime') {
    return 'history';
  }
  if (type === 'onPortData') {
    const deviceTypes = part.data ? _.uniq(part.data.map((dat) => dat.split('.')[0])) : [];
    if (!deviceTypes.length) {
      return 'port';
    }
    if (deviceTypes.length === 1) {
      const deviceType = deviceTypes[0];
      if (part.data.length === 1 && deviceType === SENSOR) {
        return [deviceType, part.data[0].split('.')[1]].join(' ');
      }
    }
    return deviceTypes.join(' ');
  }
  if (type === 'portAction') {
    const deviceTypes = part.action ? Object.keys(part.action) : [];
    return deviceTypes.length ? ['arrow', ...deviceTypes].join(' ') : 'arrow port';
  }
  if (type === 'setState') {
    return 'manage';
  }
  if (type === 'wait') {
    return 'clock';
  }

  return [];
}

export default {
  props: {
    parts: { type: Array, default: () => [] },
    limit: { type: Number },
  },

  setup(props) {
    return {
      icons: computed(() => {
        const icons = props.parts.map(getIcons);
        const flattened = icons.flat(Infinity).filter((val) => val);
        const counts = _.countBy(flattened);
        const sliced = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, props.limit);
        const final = [];

        flattened.forEach((icon, i) => {
          const index = sliced.indexOf(icon);
          const exists = index >= 0;
          if (exists && (!i || icon !== flattened[i - 1])) {
            if (props.limit) {
              sliced.splice(index, 1);
            }
            final.push(icon);
          }
        });

        const divided = final.join(' ').split(' ');
        if (!props.limit || divided.length < props.limit) {
          return divided;
        }

        let diff = divided.length - props.limit;
        return final
          .map((icon) => icon.split(' '))
          .map((iconArr) => {
            if (diff <= 0 || iconArr.length <= 1) {
              return iconArr;
            }

            const removeTo = Math.max(iconArr[0] === 'arrow' ? 2 : 1, iconArr.length - diff);
            diff -= iconArr.length - removeTo;
            return iconArr.slice(0, removeTo);
          })
          .flat(Infinity)
          .join(' ')
          .split(' ');
      }),
    };
  },
};
</script>


<style scoped lang="less">
.icon + .icon {
  margin-left: 3px;
}

.icon-arrow {
  transform: scale(0.5);
}

.icon-arrow + .icon {
  margin-left: 0;
}
</style>
