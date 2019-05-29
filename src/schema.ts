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
          lerna: { type: 'boolean', default: false },
          links: { type: 'array', items: { type: 'string' } },
          types: { type: 'array', items: { type: 'string' } },
          buildScript: { type: 'string', default: 'build' },
          linkFrom: { type: 'string' },
          npmClient: {  
            type: 'string', 
            enum: ['npm', 'yarn', 'cnpm'], 
            default: 'yarn' 
          },
        },
        required: ['branch', 'package', 'remote'],
        additionalProperties: false,
      },
    },
    typeDefs: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          branch: { type: 'string' },
          remote: { type: 'string' },
          typesPath: { type: 'string' },
          depth: { type: 'integer', default: 1 },
        },
        required: ['branch', 'remote', 'typesPath'],
      },
    },
  },
  additionalProperties: false,
  required: ['projects'],
}
