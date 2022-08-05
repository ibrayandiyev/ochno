<template>
  <div class="side-menu grid no-gap" :class="{ open }">
    <div class="menu-toggle cursor-pointer -square -common-height is-enabled" @click="open = !open">
      <el-checkbox class="-circle" style="pointer-events: none">
        <Icon :type="open ? 'delete' : 'menu'" />
      </el-checkbox>
    </div>

    <div class="side-menu-container relative">
      <Scrollbar class="scrollbar-fill bg-black">
        <div class="fill-height flex flex-column">
          <div class="side-menu-header centered p-block-s text-center row-lines-inner">
            <Icon type="deviceOchnoOperated" class="font-big2" />
            <h4 class="header-text">{{ $t('Ochno Operated') }}</h4>
          </div>

          <div class="side-menu-main row-lines-inner">
            <slot />
          </div>

          <div class="side-menu-footer row-lines-inner">
            <slot name="footer">
              <router-link to="/app" class="block row-lines-inner">
                <el-button class="-common-height -quadratic -borderless -block">
                  <div class="auto-fr-grid">
                    <Icon type="location" />
                    <span>{{ $t('Dashboard') }}</span>
                  </div>
                </el-button>
              </router-link>
            </slot>

            <router-link v-if="isLoggedIn" to="/signout" class="block row-lines-inner">
              <el-button class="-common-height -quadratic -borderless -block">
                <div class="auto-fr-grid">
                  <Icon type="user" />
                  <span>{{ $t('Sign out') }}</span>
                </div>
              </el-button>
            </router-link>
          </div>
        </div>
      </Scrollbar>
    </div>

    <div class="side-menu-sidebar">
      <slot name="sidebar" />
    </div>

    <div v-if="open" class="click-trap" @click="open = false" />
  </div>
</template>


<script>
import { ref, watch } from 'vue';

import authStore from '../../../modules/auth/store';

export default {
  emits: ['open'],

  setup(props, { emit }) {
    const open = ref(false);

    watch(open, () => emit('open', open.value));

    return {
      open,
      isLoggedIn: authStore.state.isLoggedIn,
    };
  },
};
</script>


<style scoped lang="less">
.side-menu {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  grid-template-columns: minmax(calc(var(--common-size) * 2), calc(var(--common-size) * 5)) 1fr; // NOTE: If this changes, change the media query for the side menu button as well.
  align-items: stretch;
  pointer-events: none; // So the menu isn't clickable on it's own.
  z-index: var(--z-side-menu);
}

.menu-toggle {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 2;

  &:not(:hover) {
    opacity: var(--opacity-white-to-gray-5);
  }

  .el-checkbox {
    background-color: rgb(var(--color-gray-2a)) !important;
  }
}

.side-menu-container {
  transform: translateX(-100%);
  transition: transform var(--transition-duration-close);
  pointer-events: auto; // Making the main menu interactable.
  z-index: 1;
}

.side-menu-header {
  flex-grow: 2;
  max-height: calc(var(--common-size) * 3);

  .icon {
    margin-bottom: 2rem;
  }
}

.p-block-s {
  padding-top: var(--column-gap);
  padding-bottom: var(--column-gap);
}

.side-menu-main {
  flex-grow: 1;
}

.side-menu-footer {
  &:deep(.el-button) {
    justify-content: flex-start;
    padding-left: var(--row-gap);
  }
}

.side-menu-sidebar {
  position: relative;
  margin-top: var(--common-size);
}

.side-menu:deep(.side-menu-sidebar) > * {
  pointer-events: auto; // Making eventual sidebars interactable.
}

// STATES
.open {
  .side-menu-container {
    transform: translateX(0);
    transition: transform var(--transition-duration-open);
  }
}

@media screen and (max-width: 768px) {
  .side-menu-sidebar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin-top: 0;
    z-index: 2;
  }
}

@media screen and (max-height: 400px) {
  .side-menu-header {
    .icon {
      margin-bottom: 0;
    }

    .header-text {
      display: none;
    }
  }
}
</style>
