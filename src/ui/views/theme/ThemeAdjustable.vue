<template>
  <div>
    <h2 class="margin-block-row">Layout panes</h2>

    <div>
      <h3 class="margin-block-column">Horizontal</h3>
      <div class="sticky-buttons bg-gray-2">
        <el-button class="-borderless" @click="horizontal.one = !horizontal.one">1</el-button>
        <el-button class="-borderless" @click="horizontal.two = !horizontal.two">2</el-button>
        <el-button class="-borderless" @click="horizontal.three = !horizontal.three">3</el-button>
        <el-button class="-borderless" @click="horizontal.four = !horizontal.four">4</el-button>
      </div>

      <div class="layout-wrapper">
        <AdjustableGrid>
          <div v-if="horizontal.one" class="bg-error">1</div>
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper" style="height: 60px">
        <AdjustableGrid>
          <div v-if="horizontal.one" class="bg-error">1</div>
          <div v-if="horizontal.two" class="bg-gray-3">2</div>
        </AdjustableGrid>
      </div>
      <div>1 has min 30px, 3 has init 50%</div>
      <div class="layout-wrapper" style="height: 70px">
        <AdjustableGrid>
          <div v-if="horizontal.one" class="bg-error" min="30px">1</div>
          <div v-if="horizontal.two" class="bg-gray-3">2</div>
          <div v-if="horizontal.three" class="bg-gray-1" init="50%">3</div>
        </AdjustableGrid>
      </div>
      <div>all have min set (multiple inline comments)</div>
      <div class="layout-wrapper" style="height: 80px">
        <AdjustableGrid>
          <div v-if="horizontal.one" class="bg-error" min="30px">1</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="horizontal.two" class="bg-gray-3" min="50px">2</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="horizontal.three" class="bg-gray-1" min="100px">3</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="horizontal.four" class="bg-error-heavy" min="20px">4</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper" style="height: 100px">
        <AdjustableGrid>
          <div v-if="horizontal.one" class="bg-error" min="10px">1</div>
          <div v-if="horizontal.two" class="bg-gray-3" min="20px">2</div>
          <div v-if="horizontal.three" class="bg-gray-1" min="30px">3</div>
          <div v-if="horizontal.four" class="bg-error-heavy" min="40px">4</div>
          <div v-if="horizontal.one" class="bg-error" min="10px">1</div>
          <div v-if="horizontal.two" class="bg-gray-3" min="20px">2</div>
          <div v-if="horizontal.three" class="bg-gray-1" min="30px">3</div>
          <div v-if="horizontal.four" class="bg-error-heavy" min="40px">4</div>
        </AdjustableGrid>
      </div>
    </div>

    <div>
      <h3 class="margin-block-column">Vertical</h3>
      <div class="sticky-buttons bg-gray-2">
        <el-button class="-borderless" @click="vertical.one = !vertical.one">1</el-button>
        <el-button class="-borderless" @click="vertical.two = !vertical.two">2</el-button>
        <el-button class="-borderless" @click="vertical.three = !vertical.three">3</el-button>
        <el-button class="-borderless" @click="vertical.four = !vertical.four">4</el-button>
      </div>

      <div class="layout-wrapper">
        <AdjustableGrid :vertical="true">
          <div v-if="vertical.one" class="bg-error">1</div>
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper" style="height: 100px">
        <AdjustableGrid :vertical="true">
          <div v-if="vertical.one" class="bg-error">1</div>
          <div v-if="vertical.two" class="bg-gray-3">2</div>
        </AdjustableGrid>
      </div>
      <div>1 has min 30px, 3 has init 50%</div>
      <div class="layout-wrapper" style="height: 150px">
        <AdjustableGrid :vertical="true">
          <div v-if="vertical.one" class="bg-error" min="30px">1</div>
          <div v-if="vertical.two" class="bg-gray-3">2</div>
          <div v-if="vertical.three" class="bg-gray-1" init="50%">3</div>
        </AdjustableGrid>
      </div>
      <div>all have min set (multiple inline comments)</div>
      <div class="layout-wrapper" style="height: 200px">
        <AdjustableGrid :vertical="true">
          <div v-if="vertical.one" class="bg-error" min="10px">1</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="vertical.two" class="bg-gray-3" min="20px">2</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="vertical.three" class="bg-gray-1" min="20px">3</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
          <div v-if="vertical.four" class="bg-error-heavy" min="10px">4</div>
          <!-- <AdjustableHandle v-on:resize="resize" v-on:resizeEnd="resizeEnd" /> -->
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper" style="height: 400px">
        <AdjustableGrid :vertical="true">
          <div v-if="vertical.one" class="bg-error" min="10px">1</div>
          <div v-if="vertical.two" class="bg-gray-3" min="20px">2</div>
          <div v-if="vertical.three" class="bg-gray-1" min="30px">3</div>
          <div v-if="vertical.four" class="bg-error-heavy" min="40px">4</div>
          <div v-if="vertical.one" class="bg-error" min="10px">1</div>
          <div v-if="vertical.two" class="bg-gray-3" min="20px">2</div>
          <div v-if="vertical.three" class="bg-gray-1" min="30px">3</div>
          <div v-if="vertical.four" class="bg-error-heavy" min="40px">4</div>
        </AdjustableGrid>
      </div>
    </div>

    <div>
      <h3 class="margin-block-column">Normalizing init values</h3>
      <div class="layout-wrapper">
        <AdjustableGrid>
          <div class="bg-error" init="50%">50%</div>
          <div class="bg-gray-3" init="125%">125%</div>
          <div class="bg-gray-1" init="25%">25%</div>
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper">
        <AdjustableGrid>
          <div class="bg-error" init="40%">40%</div>
          <div class="bg-gray-3" init="25%">20%</div>
          <div class="bg-gray-1" init="15%">15%</div>
        </AdjustableGrid>
      </div>
    </div>

    <div>
      <h3 class="margin-block-column">Nested</h3>
      <div class="layout-wrapper" style="height: 200px">
        <AdjustableGrid>
          <div class="bg-error" min="75px">1</div>
          <AdjustableGrid :vertical="true" init="75%">
            <div class="bg-gray-3" min="30px">2</div>
            <div class="bg-gray-1" min="15px">3</div>
          </AdjustableGrid>
          <div class="bg-error-heavy" min="50px">4</div>
        </AdjustableGrid>
      </div>
      <div class="layout-wrapper" style="height: 200px">
        <AdjustableGrid :vertical="true">
          <div class="bg-error" min="15px">1</div>
          <AdjustableGrid init="75%">
            <div class="bg-gray-3" min="30px">2</div>
            <div class="bg-gray-1" min="15px">3</div>
          </AdjustableGrid>
          <div class="bg-error-heavy" min="20px">4</div>
        </AdjustableGrid>
      </div>
    </div>

    <div>
      <h3 class="margin-block-column">React to changes</h3>
      <div class="sticky-buttons bg-gray-2">
        <el-button class="-borderless" @click="layout.one = !layout.one">1</el-button>
        <el-button class="-borderless" @click="layout.two = !layout.two">2</el-button>
        <el-button class="-borderless" @click="layout.three = !layout.three">3</el-button>
        <el-button class="-borderless" @click="layout.four = !layout.four">4</el-button>
      </div>

      <div>No start sizes, minSizes set to quite low.</div>
      <div class="layout-wrapper" style="height: 150px">
        <AdjustableGrid>
          <div v-if="layout.one" class="bg-error" min="75px">1</div>
          <AdjustableGrid v-if="layout.two || layout.three" :vertical="true" min="100px">
            <div v-if="layout.two" class="bg-gray-3" min="30px">2</div>
            <div v-if="layout.three" class="bg-gray-1" min="15px">3</div>
          </AdjustableGrid>
          <div v-if="layout.four" class="bg-error-heavy" min="50px">4</div>
        </AdjustableGrid>
      </div>

      <div>Start sizes set on every pane (middle column has sizes that are 125%), minSizes set to quite low.</div>
      <div class="layout-wrapper" style="height: 150px">
        <AdjustableGrid>
          <div v-if="layout.one" class="bg-error" min="50px" init="20%">1</div>
          <AdjustableGrid v-if="layout.two || layout.three" :vertical="true" init="65%">
            <div v-if="layout.two" class="bg-gray-3" min="30px" init="75%">2</div>
            <div v-if="layout.three" class="bg-gray-1" min="15px" init="50%">3</div>
          </AdjustableGrid>
          <div v-if="layout.four" class="bg-error-heavy" min="40px" init="15%">4</div>
        </AdjustableGrid>
      </div>

      <div>Start sizes set on every pane (but total to 90%), minSizes set to quite low.</div>
      <div class="layout-wrapper" style="height: 100px">
        <AdjustableGrid>
          <div v-if="layout.one" class="bg-error" init="20%" min="50px">1</div>
          <div v-if="layout.two" class="bg-gray-3" init="15%" min="30px">2</div>
          <div v-if="layout.three" class="bg-gray-1" init="40%" min="15px">3</div>
          <div v-if="layout.four" class="bg-error-heavy" init="15%" min="40px">4</div>
        </AdjustableGrid>
      </div>

      <div>Start sizes set on every pane (but total to 90%), minSizes set to quite low. Overflow reading.</div>
      <div class="layout-wrapper" style="height: 100px">
        <AdjustableGrid @overrun="overflow = $event.px">
          <div v-if="layout.one" class="bg-error" init="20%" min="50px">1</div>
          <div v-if="layout.two" class="bg-gray-3" init="15%" min="30px">2</div>
          <div v-if="layout.three" class="bg-gray-1" init="40%" min="15px">3</div>
          <div v-if="layout.four" class="bg-error-heavy" init="15%" min="40px">4</div>
          <div v-if="layout.one" class="bg-error" init="20%" min="50px">1</div>
          <div v-if="layout.two" class="bg-gray-3" init="15%" min="30px">2</div>
          <div v-if="layout.three" class="bg-gray-1" init="40%" min="15px">3</div>
          <div v-if="layout.four" class="bg-error-heavy" init="15%" min="40px">4</div>
        </AdjustableGrid>
      </div>
      <div>A pane grid is overflowing by {{ overflow }} pixels.</div>

      <div>CSS Element queries, aka change element based on it's size.</div>
      <div class="layout-wrapper" style="height: 200px">
        <AdjustableGrid>
          <div v-responsive="{ small: el => el.width <= 100 }" class="element-query bg-error" min="100px" />
          <Pane v-responsive="{ 'responsive-test': el => el.width <= 200 }">
            <template #title>
              <div class="title-big">Two</div>
              <div class="title-small">T</div>
            </template>
            Some content for this pretty pane.
          </Pane>
        </AdjustableGrid>
      </div>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';

import AdjustableGrid from '../../components/layout/AdjustableGrid.vue';
import Pane from '../../components/layout/Pane.vue';

export default {
  components: { Pane, AdjustableGrid },

  setup() {
    return {
      horizontal: ref({
        one: true,
        two: true,
        three: true,
        four: true,
      }),

      vertical: ref({
        one: true,
        two: true,
        three: true,
        four: true,
      }),

      layout: ref({
        one: true,
        two: true,
        three: true,
        four: true,
      }),

      overflow: ref(0),
    };
  },
};
</script>


<style scoped lang="less">
.sticky-buttons {
  position: sticky;
  top: 0;
  z-index: 1;
}

.layout-wrapper {
  margin-bottom: 2rem;
  padding: 1px;
  border: dotted lightgrey 1px;
}

.element-query {
  &:after {
    content: 'Variable size';
  }

  &.small {
    &:after {
      content: 'Minimum.';
    }
  }
}

.title-small {
  display: none;
}
.responsive-test {
  .title-big {
    display: none;
  }
  .title-small {
    display: block;
  }
}
</style>
