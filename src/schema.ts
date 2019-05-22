export const configSchema = {
  $id: 'http://example.com/schemas/schema.json',
  type: 'object',
  properties: {
    baseDir: { type: 'string' },
    projects: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          branch: { type: 'string' },
          package: { type: 'string' },
          remote: { type: 'string' },
          lerna: { type: 'boolean' },
          links: { type: 'array', items: { type: 'string' } },
          types: { type: 'array', items: { type: 'string' } },
          buildCommand: { type: 'string' },
          linkFrom: { type: 'string' }
        },
        required: ['branch', 'package', 'remote']
      }
    },
    typeDefs: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          branch: { type: 'string' },
          remote: { type: 'string' },
          typeName: { type: 'string' }
        },
        required: ['branch', 'remote', 'typeName']
      }
    }
  },
  required: ['baseDir', 'projects']
};
