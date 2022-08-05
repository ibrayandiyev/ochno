import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export function buildNormalRestController(api, items) {

  return [
    rest.get(`http://localhost${api.route}`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(items));
    }),
    
    rest.get(`http://localhost${api.route}/:id`, (req, res, ctx) => {
      const { id } = req.params;
      const item = items.find((item) => item.id === id);
      if (item) {
        return res(ctx.status(200), ctx.json(item));
      }
      return res(ctx.status(400));
    }),

    // TODO
    rest.post(`http://localhost${api.route}`, (req, res, ctx) => {
      if (req.body && Object.keys(req.body).length > 0) {
        const item = Object.assign(
          {
            id: Number.parseInt(Math.random() * 1000, 10),
          },
          req.body
        );
        items.push(item);
        return res(ctx.status(200), ctx.json(item));
      }
      return res(ctx.status(400));
    }),

    rest.put(`http://localhost${api.route}/:id`, (req, res, ctx) => {
      const { id } = req.params;
      const item = items.find((item) => item.id === id);
      if (!item) {
        return res(ctx.status(404));
      }
      if (req.body && Object.keys(req.body).length > 0) {
        const updatedItem = Object.assign(
          item,
          req.body
        );
        return res(ctx.status(200), ctx.json(updatedItem));
      }
      return res(ctx.status(400));
    }),

    rest.delete(`http://localhost${api.route}/:id`, (req, res, ctx) => {
      const { id } = req.params;
      const itemIndex = items.findIndex((item) => item.id === id);
      if (itemIndex >= 0) {
        items.splice(itemIndex, 1);
        return res(ctx.status(200), ctx.json({}));
      }
      return res(ctx.status(400));
    }),
  ]
};

export default function buildMockAPI(restHandlers) {
  const FormDataMock = vi.fn(() => ({
    append: vi.fn(),
  }));
  vi.stubGlobal('FormData', FormDataMock);
  
  const server = setupServer(...restHandlers);
  
  // Start server before all tests
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  
  //  Close server after all tests
  afterAll(() => server.close());
  
  afterEach(() => server.resetHandlers());
}
  