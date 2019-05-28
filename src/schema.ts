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
          buildScript: { type: 'string' },
          linkFrom: { type: 'string' }
        },
        required: ['branch', 'package', 'remote'],
        additionalProperties: false
      }
    },
    typeDefs: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          branch: { type: 'string' },
          remote: { type: 'string' },
          typesPath: { type: 'string' },
          depth: { type: 'integer' }
        },
        required: ['branch', 'remote', 'typesPath']
      }
    }
  },
  additionalProperties: false,
  required: ['projects']
};
