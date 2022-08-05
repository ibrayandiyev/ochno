const prefix = {
  in: 'in',
  out: 'out',

  port: 'p',
};

const suffix = {
  action: 'action',
  data: 'data',
  stream: 'stream',
};

function portOut({ accountId, spaceId, portId, companyId = accountId, locationId = accountId } = {}, ending) {
  return `${prefix.port}/${companyId}/${locationId}/${spaceId}/${portId}/${ending}`;
}

function portIn({ accountId, spaceId, portId, companyId = accountId, locationId = accountId } = {}, ending) {
  return `${prefix.port}/${companyId}/${locationId}/${spaceId}/${portId}/${prefix.in}/${ending}`;
}

const topics = {
  port: {
    // From port
    out: portOut,
    outData: (ids) => portOut(ids, suffix.data),
    outStream: (ids) => portOut(ids, suffix.stream),

    // To port
    in: portIn,
    inAction: (ids) => portIn(ids, suffix.action),
  },
};

export const PREFIX = prefix;
export const SUFFIX = suffix;
export const TOPICS = topics;
