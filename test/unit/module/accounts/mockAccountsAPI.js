import { rest } from 'msw';

export const accounts = [
  {
    id: 'acc1',
    name: 'first account',
    groups: [
      {
        id: 'group1',
        authorisationId: 'auth1',
        name: 'first group',
      },
      {
        id: 'group2',
        authorisationId: 'auth2',
        name: 'second group',
      },
    ],
    image: null,
  },
  {
    id: 'acc2',
    name: 'second account',
    groups: [
      {
        id: 'group3',
        authorisationId: 'auth3',
        name: 'third group',
      },
    ],
  },
  {
    id: 'acc3',
    name: 'third account',
    groups: [
      {
        id: 'group5',
        authorisationId: 'auth3',
        name: 'fifth group',
      },
    ],
  },
];
function getAccounts({ id }) {
  return accounts.filter((account) => account.id === id);
}

function getAccount({ id }) {
  return accounts.find((account) => account.id === id);
}

function getAccountGroups({ id }) {
  return getAccount({ id })?.groups;
}

function getAccountGroup({ id, groupId }) {
  return getAccountGroups({ id })?.find((group) => group.id === groupId);
}

export const restAccountHandlers = [

  rest.post(`http://localhost/api/accounts/:id/image`, (req, res, ctx) => {
    const account = getAccount(req.params);
    if (account) {
      account.image = 'testing storage url';
      return res(ctx.status(200), ctx.json(account));
    }
    return res(ctx.status(400));
  }),

  rest.get(`http://localhost/api/accounts/:id/groups`, (req, res, ctx) => {
    const groups = getAccountGroups(req.params);
    if (groups) {
      return res(ctx.status(200), ctx.json(groups));
    }
    return res(ctx.status(400));
  }),

  rest.get(`http://localhost/api/accounts/:id/groups/:groupId`, (req, res, ctx) => {
    const group = getAccountGroup(req.params);
    if (group) {
      return res(ctx.status(200), ctx.json(group));
    }
    return res(ctx.status(400));
  }),

  rest.post(`http://localhost/api/accounts/:id/groups`, (req, res, ctx) => {
    const account = getAccount(req.params);
    if (account) {
      const group = {
        id: Number.parseInt(Math.random() * 1000, 10),
        authorisationId: Number.parseInt(Math.random() * 1000, 10),
        name: req.body.name,
      };
      account.groups.push(group);
      return res(ctx.status(200), ctx.json(group));
    }
    return res(ctx.status(400));
  }),

  rest.put(`http://localhost/api/accounts/:id/groups/:groupId`, (req, res, ctx) => {
    const group = getAccountGroup(req.params);
    if (group) {
      group.name = req.body.name;
    }
    return res(ctx.status(200), ctx.json(group));
  }),

  rest.delete(`http://localhost/api/accounts/:id/groups/:groupId`, (req, res, ctx) => {
    const account = getAccount(req.params);
    const groupIndex = account.groups.findIndex((group) => group.id === req.params.groupId);
    if (groupIndex >= 0) {
      account.groups.splice(groupIndex, 1);
      return res(ctx.status(200), ctx.json({}));
    }
    return res(ctx.status(400));
  }),
];

