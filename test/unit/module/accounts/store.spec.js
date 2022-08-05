import { describe, expect, it } from 'vitest';
import { accounts, restAccountHandlers } from './mockAccountsAPI';
import buildMockAPI, { buildNormalRestController } from '../../../utils/mockAPI';
import api from '../../../../src/modules/accounts/api';
import store from '../../../../src/modules/accounts/store';

const commonRestHandlers = buildNormalRestController(api, accounts);
buildMockAPI([...restAccountHandlers, ...commonRestHandlers]);

describe('module/accounts/store testing', () => {
  describe('store.dispatch.get() testing', () => {
    it('should get 3 accounts', () => {
      store.dispatch.get().then((res) => {
        expect(res.length).toBe(3);
      });
    });
  });

  describe('store.dispatch.getOne({ id }) testing', () => {
    it('should get 1 account when id = acc2 ', () => {
      const account = accounts[1];
      store.dispatch.getOne({ id: account.id }).then((res) => {
        expect(res.id).toBe(account.id);
        expect(res.name).toBe(account.name);
      });
    });
    it('should get empty array when invalid ID ', () => {
      store.dispatch.getOne({ id: '4444444' }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });
    it('should fail when id is undefined or null', () => {
      store.dispatch.getOne({ id: null }).then(res => {
        expect(res).toBe(null);
      });
    });
  });

  describe('store.dispatch.post(data) testing', () => {
    it('should fail when data = undefined', () => {
      store.dispatch.post().then(res => {
        expect(res).toBeUndefined();
      })
    });

    it('should return 400 error when data is empty', () => {
      store.dispatch.post({ }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });

    it('should succeed when valid payload', () => {
      const data = {
        name: 'fourth account',
        groups: [
          {
            id: 'group4',
            authorisationId: 'auth4',
            name: 'seventh group',
          }
        ],
        image: null,
      };
      store.dispatch.post(data).then((res) => {
        expect(res.id).toBeDefined();
      });
    });
  });

  describe('store.dispatch.put({ id, data }) testing', () => {
    it('should fail when data = undefined', () => {
      store.dispatch.put({ id: undefined }).then(res => {
        expect(res).toBeUndefined();
      });
    });

    it('should return 400 error when data is undefined or empty', () => {
      const account = accounts[0];
      store.dispatch.put({ id: account.id }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });

    it('should return 404 error when id does not exist', () => {
      store.dispatch.put({ id: '2234242423' }).catch((err) => {
        expect(err.response.status).toBe(404);
      });
    });

    it('should succeed when valid payload', () => {
      const account = accounts[0];
      const data = {
        name: 'updated account',
      };
      store.dispatch.put({id: account.id, data }).then((res) => {
        expect(res.id).toBeDefined();
        expect(res.name).toBe(data.name);
      });
    });
  });

  describe('store.dispatch.delete({ id }) testing', () => {
    it('should fail when id is undefined or null', () => {
      expect(api.delete({ id: undefined })).toBe(undefined);
    });

    it('should delete a group when groupId is valid', () => {
      const account = accounts[2];
      store.dispatch.delete({ id: account.id }).then((res) => {
        expect(res).toBeDefined();
      });
    });

    it('should 400 error when groupId is not valid', () => {
      store.dispatch.delete({ id: '44444' }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });
  });

  describe('store.dispatch.postImage({ id, data }) testing', () => {
    it('should fail when id is undefined or null', () => {
      store.dispatch.postImage({ id: undefined, data: { name: 'tester' }}).then(res => {
        expect(res).toBe(undefined);
      });
    });

    it('should return 400 error when id does not exist', () => {
      store.dispatch.postImage({ id: '123456', data: { name: 'tester' }}).catch(err => {
        expect(err.response.status).toBe(400);
      });
    });

    it('should succeed when valid id', () => {
      const account = accounts[0];
      store.dispatch.postImage({ id: account.id, data: { name: 'tester' }}).then(res => {
        expect(res.id).toBe(account.id);
        expect(res.name).toBe(account.name);
      });
    });
  });
  
  describe('store.dispatch.groups.get({ id }) testing', () => {
    it('should get 2 groups when id = acc1 ', () => {
      const account = accounts[0];
      store.dispatch.groups.get({ id: account.id }).then((res) => {
        expect(res.length).to.be.eql(2);
      });
    });

    it('should get 1 groups when id = acc2 ', () => {
      const account = accounts[1];
      store.dispatch.groups.get({ id: account.id }).then((res) => {
        expect(res.length).to.be.eql(1);
      });
    });

    it('should get empty array when invalid ID ', () => {
      store.dispatch.groups.get({ id: '4444444' }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });
    it('should fail when id is undefined or null', () => {
      store.dispatch.groups.get({ id: null }).then(res => {
        expect(res).toBe(null);
      });
    });
  });

  describe('store.dispatch.groups.getOne({ id, groupId }) testing', () => {
    it('should get one Group when id = acc1, groupId = group1', () => {
      const account = accounts[0];
      store.dispatch.groups.getOne({ id: account.id, groupId: account.groups[0].id }).then((res) => {
        expect(res).to.be.eql(account.groups[0]);
      });
    });

    it('should fail 400 error when invalid ID & invalid groupId', () => {
      store.dispatch.groups.getOne({ id: '4444444', groupId: 'a12312312' }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });

    it('should fail when id is undefined or null', () => {
      store.dispatch.groups.getOne({ id: undefined, groupId: 'a12312312' }).then((res) => {
        expect(res).toBe(undefined);
      });
    });
  });

  describe('store.dispatch.groups.post({ id, data }) testing', () => {
    it('should fail when id is undefined or null', () => {
      store.dispatch.groups.post({ id: undefined }).then((res) => {
        expect(res).toBe(undefined);
      });
    });

    it('should post new group when id = acc1, data = undefined', () => {
      const account = accounts[0];
      store.dispatch.groups.post({ id: account.id }).then((res) => {
        expect(res.name).toBe(undefined);
        expect(res).toHaveProperty('id');
        expect(res).toHaveProperty('authorisationId');
      });
    });

    it('should post new group when id = acc1, data', () => {
      const account = accounts[0];
      const data = { name: 'fourth group' };
      store.dispatch.groups.post({ id: account.id, data }).then((res) => {
        expect(res.name).toBe(data.name);
        expect(res).toHaveProperty('id');
        expect(res).toHaveProperty('authorisationId');
      });
    });
  });

  describe('store.dispatch.groups.put({ id, groupId, data }) testing', () => {
    it('should fail when id is undefined or null', () => {
      store.dispatch.groups.put({ id: undefined }).then((res) => {
        expect(res).toBe(undefined);
      });
    });

    it('should fail when groupId is not specified', () => {
      const account = accounts[0];
      store.dispatch.groups.put({ id: account.id, groupId: undefined }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });

    it('should update group when groupId is valid', () => {
      const account = accounts[0];
      const data = { name: 'updated group' };
      store.dispatch.groups.put({ id: account.id, groupId: account.groups[1].id, data }).then((res) => {
        expect(res.id).toBe(account.groups[1].id);
        expect(res.name).toBe(data.name);
      });
    });
  });

  describe('store.dispatch.groups.delete(id, groupId) testing', () => {
    it('should fail when id is undefined or null', () => {
      store.dispatch.groups.delete({ id: undefined }).then(res => {
        expect(res).toBe(undefined);
      })
    });

    it('should delete a group when groupId is valid', () => {
      const account = accounts[1];
      store.dispatch.groups.delete({ id: account.id, groupId: account.groups[0].id }).then((res) => {
        expect(res).toBeDefined();
      });
    });

    it('should 400 error when groupId is not valid', () => {
      const account = accounts[1];
      store.dispatch.groups.delete({ id: account.id, groupId: 'bbbbbb' }).catch((err) => {
        expect(err.response.status).toBe(400);
      });
    });
  });

  describe('store.getters.title testing', () => {
    it('should fail when id is undefined or null', () => {
      console.log(store.getters.title);
    });
  });
});