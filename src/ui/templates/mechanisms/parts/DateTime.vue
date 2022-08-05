<template>
  <el-collapse-item>
    <template #title>
      <div class="drag-handle" />
      <h3 class="title-header">{{ $t('During') }}</h3>
      <span class="title-header" style="text-transform: none">{{ title.day }} {{ title.time }}</span>
    </template>

    <div class="mechanism-part-wrapper">
      <div class="mechanism-part">
        <div v-for="({ days }, index) in (part.between || [{}])" :key="index">
          <h4 class="m-down"><Icon type="multiSelect" class="m-end" />{{ $t('Active days') }}</h4>
          <div class="days-grid grid">
            <el-checkbox v-for="day in sortedDays" :key="day" :model-value="!days || days.indexOf(day) >= 0" class="day-checkbox -circle" @input="toggleDay(index, day)">{{ $t(`dayShort${day}`) }}</el-checkbox>
          </div>

          <h4 class="m-down"><Icon type="clock" class="m-end" />{{ $t('Active time') }}</h4>
          <div class="time-grid grid">
            <el-time-picker v-model="timeDate(index, 'start').value" format="HH:mm" />
            <div>To</div>
            <el-time-picker v-model="timeDate(index, 'stop').value" format="HH:mm" />
          </div>
        </div>
      </div>
    </div>
  </el-collapse-item>
</template>

<script>
import i18next from 'i18next';
import _ from 'lodash';
import { computed } from 'vue';

export const TYPE = 'dateTime';

export function setup(parameters) {
  const { year, month, date, hour, minute } = _.cloneDeep(parameters);

  return {
    type: TYPE,
    year,
    month,
    date,
    hour,
    minute,
  };
}

const firstWeekday = 1;
const weekdays = [0, 1, 2, 3, 4, 5, 6];
const movedDays = weekdays.splice(0, firstWeekday);
const sortedDays = weekdays.concat(movedDays);

function padTime(number) {
  return number < 10 ? `0${number || 0}` : number;
}

export default {
  props: {
    part: { type: Object, required: true },
  },

  setup(props) {
    /* eslint-disable no-param-reassign,vue/no-mutating-props */
    function setupItem(index) {
      if (!props.part.between) {
        props.part.between = [];
      }
      const { between } = props.part;
      if (between.length <= index) {
        between[index] = {};
      }
      if (!between[index].timeZone) {
        // Getting the time zone in the format 'Europe/Stockholm'.
        between[index].timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      return between[index];
    }

    return {
      sortedDays,

      title: computed(() => {
        const title = { time: '', day: i18next.t('every day') };
        const { between } = props.part;

        if (between) {
          const { days, start, stop } = (between && between[0]) || {};

          if (Array.isArray(days)) {
            if (!days.length) {
              title.day = i18next.t('no day');
            } else {
              const sorted = _.intersection(sortedDays, days);
              if (sorted.length === 1) {
                title.day = i18next.t(`day${sorted[0]}`);
              } else if (sorted.length === 2) {
                title.day = i18next.t('{{ from }} and {{ to }}', { from: i18next.t(`day${sorted[0]}`), to: i18next.t(`day${sorted[sorted.length - 1]}`) });
              } else if (sorted.length !== 7) { // If length is 7, don't write out any days.
                const hasGap = sorted.find((day, index) => (index + 1) < sorted.length && ((day + 1) % 7) !== sorted[index + 1]);
                if (hasGap >= 0) {
                  title.day = sorted.map((day) => i18next.t(`dayShort${day}`)).join(', ');
                } else {
                  title.day = i18next.t('{{ from }} to {{ to }}', { from: i18next.t(`day${sorted[0]}`), to: i18next.t(`day${sorted[sorted.length - 1]}`) });
                }
              }
            }
          }

          const startTime = (start && (start.hour || start.minute)) ? `${padTime(start.hour)}:${padTime(start.minute)}` : '';
          const stopTime = (stop && (stop.hour || stop.minute)) ? `${padTime(stop.hour)}:${padTime(stop.minute)}` : '';
          const substitute = { start: startTime, stop: stopTime };
          if (startTime) {
            title.time = stopTime ? i18next.t('between {{ start }} - {{ stop }}', substitute) : i18next.t('from {{ start }}', substitute);
          } else if (stopTime) {
            title.time = i18next.t('to {{ stop }}', substitute);
          }
        }

        return title;
      }),

      timeDate: (index, key) => computed({
        get() {
          const value = props.part.between?.[index]?.[key];
          if (typeof value !== 'object') {
            return null;
          }
          const { hour, minute } = value;
          const date = new Date();
          date.setHours(hour);
          date.setMinutes(minute);
          return date;
        },
        set(date) {
          const item = setupItem(index);
          if (!item[key]) {
            item[key] = {};
          }
          if (date && !Number.isNaN(date)) {
            const hour = date.getHours();
            const minute = date.getMinutes();
            if (item[key].hour !== hour) {
              item[key].hour = hour;
            }
            if (item[key].minute !== minute) {
              item[key].minute = minute;
            }
          } else {
            delete item[key];
          }
        },
      }),

      toggleDay(index, day) {
        const item = setupItem(index);
        if (!item.days) {
          item.days = [0, 1, 2, 3, 4, 5, 6];
        }
        const i = item.days.indexOf(day);
        if (i < 0) {
          item.days.push(day);
        } else {
          item.days.splice(i, 1);
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.days-grid,
.time-grid {
  justify-content: center;
}

.days-grid {
  grid-template-columns: repeat(auto-fit, var(--field-size));
  margin-bottom: calc(var(--row-gap) * 1.5);

  .el-checkbox {
    margin-left: 0;
  }
}

.time-grid {
  grid-template-columns: 1fr auto 1fr;
}
</style>
