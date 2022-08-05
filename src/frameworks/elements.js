// This file should import all the elements used in the code.
import {
  ElButton,
  ElCheckbox,
  ElCollapse,
  ElCollapseItem,
  ElDatePicker,
  ElDialog,
  ElMessageBox,
  ElOption,
  ElOptionGroup,
  ElPopover,
  ElRadio,
  ElScrollbar,
  ElSelect,
  ElSlider,
  ElSwitch,
  ElTabPane,
  ElTabs,
  ElTimePicker,
  ElTooltip,
} from 'element-plus';

// The css for each element needs to be imported.
// When adding a new component, make sure to check the css inheritance of that component: /node_modules/element-plus/lib/components/<name>/style
import 'element-plus/theme-chalk/base.css'; // Inherited
import 'element-plus/theme-chalk/el-button.css';
import 'element-plus/theme-chalk/el-checkbox.css';
import 'element-plus/theme-chalk/el-collapse.css';
import 'element-plus/theme-chalk/el-collapse-item.css';
import 'element-plus/theme-chalk/el-date-picker.css';
import 'element-plus/theme-chalk/el-dialog.css';
import 'element-plus/theme-chalk/el-input.css'; // Inherited
import 'element-plus/theme-chalk/el-input-number.css'; // Inherited
import 'element-plus/theme-chalk/el-message-box.css';
import 'element-plus/theme-chalk/el-option.css';
import 'element-plus/theme-chalk/el-option-group.css';
import 'element-plus/theme-chalk/el-overlay.css'; // Inherited
import 'element-plus/theme-chalk/el-popover.css';
import 'element-plus/theme-chalk/el-popper.css'; // Inherited
import 'element-plus/theme-chalk/el-radio.css';
import 'element-plus/theme-chalk/el-scrollbar.css'; // Inherited
import 'element-plus/theme-chalk/el-select.css';
import 'element-plus/theme-chalk/el-slider.css';
import 'element-plus/theme-chalk/el-switch.css';
import 'element-plus/theme-chalk/el-tab-pane.css';
import 'element-plus/theme-chalk/el-tabs.css';
import 'element-plus/theme-chalk/el-tag.css'; // Inherited
import 'element-plus/theme-chalk/el-time-picker.css';
import 'element-plus/theme-chalk/el-tooltip.css';

export default (vueApp) => {
  // Make it possible to use Elements components in templates.
  [
    ElButton,
    ElCheckbox,
    ElCollapse,
    ElCollapseItem,
    ElDatePicker,
    ElDialog,
    ElMessageBox,
    ElOption,
    ElOptionGroup,
    ElPopover,
    ElRadio,
    ElScrollbar,
    ElSelect,
    ElSlider,
    ElSwitch,
    ElTabPane,
    ElTabs,
    ElTimePicker,
    ElTooltip,
  ].forEach((el) => vueApp.component(el.name, el));
};
