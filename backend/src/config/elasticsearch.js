const { Client } = require('@elastic/elasticsearch');
const { logger } = require('../utils/logger');

let client;

exports.connectElasticsearch = async () => {
  client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
  try {
    await client.ping();
    logger.info('✅ Elasticsearch connected');
    await ensureIndex();
  } catch (err) {
    logger.warn('Elasticsearch unavailable, search features disabled:', err.message);
  }
};

async function ensureIndex() {
  const exists = await client.indices.exists({ index: 'knowledge_records' });
  if (!exists) {
    await client.indices.create({
      index: 'knowledge_records',
      body: {
        mappings: {
          properties: {
            id: { type: 'keyword' },
            title: { type: 'text', analyzer: 'standard' },
            titleSwahili: { type: 'text', analyzer: 'standard' },
            description: { type: 'text' },
            content: { type: 'text' },
            category: { type: 'keyword' },
            accessTier: { type: 'keyword' },
            tags: { type: 'keyword' },
            communityId: { type: 'keyword' },
            createdAt: { type: 'date' },
          },
        },
      },
    });
    logger.info('Elasticsearch index created: knowledge_records');
  }
}

exports.getClient = () => client;
