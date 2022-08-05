import { typeProperties, propertyGroupedSettings } from '../utils/deviceTypeProperties';
import portsStore from '../../modules/ports/store';

export default function useDevice() {
  const { types: portsTypes } = portsStore.getters;

  const deviceProperties = ({
    portIds = [],
    types = portsTypes.value(portIds),
    subtypes = portsTypes.value(portIds, 'subtypes'),
  }) => typeProperties(types, subtypes);

  const deviceSettings = ({
    portIds = [],
    types = portsTypes.value(portIds),
    subtypes = portsTypes.value(portIds, 'subtypes'),
    properties = deviceProperties({ portIds, types, subtypes }),
  }) => propertyGroupedSettings(properties);

  return {
    deviceProperties,
    deviceTypeProperties: ({ portIds, type }) => deviceProperties({ portIds, types: [type] })[type],

    deviceSettings,
    deviceTypeSettings: ({ portIds, type, paths }) => deviceSettings({ portIds, types: [type], properties: paths && { [type]: paths } })[type],
  };
}
