import { describe, expect, it } from 'vitest';
import { accounts, restAccountHandlers } from './mockAccountsAPI';
import buildMockAPI, { buildNormalRestController } from '../../../utils/mockAPI';
import api from '../../../../src/modules/accounts/api';

const commonRestHandlers = buildNormalRestController(api, accounts);
buildMockAPI([...restAccountHandlers, ...commonRestHandlers]);

describe('module/accounts/api testing', () => {
  describe('api/accounts endpoint testing', () => {
    describe('GET api.get() testing', () => {
      it('should get 3 accounts', () => {
        api.get().then((res) => {
          expect(res.length).toBe(3);
        });
      });
    });

    describe('GET api.getOne({ id }) testing', () => {
      it('should get 1 account when id = acc2 ', () => {
        const account = accounts[1];
        api.getOne({ id: account.id }).then((res) => {
          expect(res.id).toBe(account.id);
          expect(res.name).toBe(account.name);
        });
      });
      it('should get empty array when invalid ID ', () => {
        api.getOne({ id: '4444444' }).catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
      it('should fail when id is undefined or null', () => {
        expect(api.getOne({ id: null })).toBe(null);
      });
    });

    describe('POST api.post(data) testing', () => {
      it('should fail when data = undefined', () => {
        expect(api.post()).toBe(undefined);
      });
  
      it('should return 400 error when data is empty', () => {
        api.post({ }).catch((err) => {
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
        api.post(data).then((res) => {
          expect(res.id).toBeDefined();
        });
      });
    });

    describe('PUT api.put({ id, data }) testing', () => {
      it('should fail when data = undefined', () => {
        expect(api.put({ id: undefined })).toBe(undefined);
      });
  
      it('should return 400 error when data is undefined or empty', () => {
        const account = accounts[0];
        api.put({ id: account.id }).catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });

      it('should return 404 error when id does not exist', () => {
        api.put({ id: '2234242423' }).catch((err) => {
          expect(err.response.status).toBe(404);
        });
      });
  
      it('should succeed when valid payload', () => {
        const account = accounts[0];
        const data = {
          name: 'updated account',
        };
        api.put({id: account.id, data }).then((res) => {
          expect(res.id).toBeDefined();
          expect(res.name).toBe(data.name);
        });
      });
    });

    describe('DELETE api.delete(id) testing', () => {
      it('should fail when id is undefined or null', () => {
        expect(api.delete({ id: undefined })).toBe(undefined);
      });
  
      it('should delete a group when groupId is valid', () => {
        const account = accounts[2];
        api.delete({ id: account.id }).then((res) => {
          expect(res).toBeDefined();
        });
      });
  
      it('should 400 error when groupId is not valid', () => {
        api.delete({ id: '44444' }).catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
    });

    describe('POST api.postImage(id, image) testing', () => {
      it('should fail when id is undefined or null', () => {
        expect(api.postImage(undefined, { name: 'tester' })).toBe(undefined);
      });
  
      it('should return 400 error when id does not exist', () => {
        api.postImage('123456', { name: 'tester' }).catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
  
      it('should succeed when valid id', () => {
        const account = accounts[0];
        api.postImage(account.id, { name: 'tester' }).then((res) => {
          expect(res.id).toBe(account.id);
          expect(res.image).toBe(account.image);
        });
      });
    });
  });

  describe('api/accounts/:id/groups endpoint testing', () => {
    describe('GET api.groups.get(id) testing', () => {
      it('should get 2 groups when id = acc1 ', () => {
        const account = accounts[0];
        api.groups.get(account.id).then((res) => {
          expect(res.length).to.be.eql(2);
        });
      });
  
      it('should get 1 groups when id = acc2 ', () => {
        const account = accounts[1];
        api.groups.get(account.id).then((res) => {
          expect(res.length).to.be.eql(1);
        });
      });
  
      it('should get empty array when invalid ID ', () => {
        api.groups.get('4444444').catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
      it('should fail when id is undefined or null', () => {
        expect(api.groups.get(null)).toBe(null);
      });
    });
  
    describe('GET api.groups.getOne(id, groupId) testing', () => {
      it('should get one Group when id = acc1, groupId = group1', () => {
        const account = accounts[0];
        api.groups.getOne(account.id, account.groups[0].id).then((res) => {
          expect(res).to.be.eql(account.groups[0]);
        });
      });
  
      it('should fail 400 error when invalid ID & invalid groupId', () => {
        api.groups.getOne('4444444', 'a12312312').catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
  
      it('should fail when id is undefined or null', () => {
        expect(api.groups.getOne(undefined, 'a12312312')).toBe(undefined);
      });
    });
  
    describe('POST api.groups.post(id, data) testing', () => {
      it('should fail when id is undefined or null', () => {
        expect(api.groups.post(undefined)).toBe(undefined);
      });
  
      it('should post new group when id = acc1, data = undefined', () => {
        const account = accounts[0];
        api.groups.post(account.id).then((res) => {
          expect(res.name).toBe(undefined);
          expect(res).toHaveProperty('id');
          expect(res).toHaveProperty('authorisationId');
        });
      });
  
      it('should post new group when id = acc1, data', () => {
        const account = accounts[0];
        const data = { name: 'fourth group' };
        api.groups.post(account.id, data).then((res) => {
          expect(res.name).toBe(data.name);
          expect(res).toHaveProperty('id');
          expect(res).toHaveProperty('authorisationId');
        });
      });
    });
  
    describe('PUT api.groups.put(id, groupId, data) testing', () => {
      it('should fail when id is undefined or null', () => {
        expect(api.groups.put(undefined)).toBe(undefined);
      });
  
      it('should fail when groupId is not specified', () => {
        const account = accounts[0];
        api.groups.put(account.id, undefined).catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
  
      it('should update group when groupId is valid', () => {
        const account = accounts[0];
        const data = { name: 'updated group' };
        api.groups.put(account.id, account.groups[1].id, data).then((res) => {
          expect(res.id).toBe(account.groups[1].id);
          expect(res.name).toBe(data.name);
        });
      });
    });
  
    describe('DELETE api.groups.delete(id, groupId) testing', () => {
      it('should fail when id is undefined or null', () => {
        expect(api.groups.delete(undefined)).toBe(undefined);
      });
  
      it('should delete a group when groupId is valid', () => {
        const account = accounts[1];
        api.groups.delete(account.id, account.groups[0].id).then((res) => {
          expect(res).toBeDefined();
        });
      });
  
      it('should 400 error when groupId is not valid', () => {
        const account = accounts[1];
        api.groups.delete(account.id, 'bbbbbb').catch((err) => {
          expect(err.response.status).toBe(400);
        });
      });
    });
  });
});
