const { getClient } = require('../config/elasticsearch');

exports.indexRecord = async (record) => {
  const client = getClient();
  if (!client) return;
  await client.index({
    index: 'knowledge_records',
    id: record.id,
    document: {
      id: record.id,
      title: record.title,
      titleSwahili: record.titleSwahili,
      description: record.description,
      content: record.content,
      category: record.category,
      accessTier: record.accessTier,
      tags: record.tags,
      communityId: record.communityId,
      createdAt: record.createdAt,
    },
  });
};

exports.deleteRecord = async (id) => {
  const client = getClient();
  if (!client) return;
  await client.delete({ index: 'knowledge_records', id });
};

exports.search = async ({ q, category, communityId, accessTiers, page = 1, limit = 20 }) => {
  const client = getClient();
  if (!client) return { hits: [], total: 0 };

  const must = [];
  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: ['title^3', 'titleSwahili^3', 'description^2', 'content', 'tags'],
        fuzziness: 'AUTO',
      },
    });
  }

  const filter = [
    { terms: { accessTier: accessTiers } },
    ...(category ? [{ term: { category } }] : []),
    ...(communityId ? [{ term: { communityId } }] : []),
  ];

  const result = await client.search({
    index: 'knowledge_records',
    from: (page - 1) * limit,
    size: limit,
    query: { bool: { must: must.length ? must : [{ match_all: {} }], filter } },
    highlight: {
      fields: { title: {}, titleSwahili: {}, description: {}, content: {} },
      pre_tags: ['<mark>'], post_tags: ['</mark>'],
    },
  });

  return {
    hits: result.hits.hits.map(h => ({ ...h._source, highlights: h.highlight })),
    total: result.hits.total.value,
  };
};
