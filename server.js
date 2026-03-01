/**
 * server.js — Express + Neo4j backend for Stellar Papers
 *
 * Expected Neo4j schema:
 *   (:Paper { paperId, title, year, citationCount, abstract, fieldsOfStudy })
 *   (:Paper)-[:REFERENCES]->(:Paper)
 *
 * Run:  node server.js
 * Needs: npm install express neo4j-driver cors dotenv
 */

import express from 'express';
import neo4j from 'neo4j-driver';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Neo4j connection ──────────────────────────────────────────────────────────
const driver = neo4j.driver(
  process.env.NEO4J_URI     || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER  || 'neo4j',
    process.env.NEO4J_PASS  || 'password'
  )
);

// Verify connection on startup
driver.verifyConnectivity()
  .then(() => console.log('✅ Connected to Neo4j'))
  .catch(e => {
    console.error('❌ Neo4j connection failed:', e.message);
    process.exit(1);
  });

// ── Helper: run a Cypher query ────────────────────────────────────────────────
async function runQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

// ── Helper: parse a Neo4j Paper node into a plain object ─────────────────────
function parsePaper(node, isPrimary = true) {
  const p = node.properties;
  return {
    paperId:       p.paperId       || node.identity.toString(),
    title:         p.title         || 'Untitled',
    year:          p.year          ? neo4j.integer.toNumber(p.year) : null,
    citationCount: p.citationCount ? neo4j.integer.toNumber(p.citationCount) : 0,
    abstract:      p.abstract      || '',
    fieldsOfStudy: Array.isArray(p.fieldsOfStudy) ? p.fieldsOfStudy : [],
    isPrimary,
  };
}

// ── GET /api/graph ────────────────────────────────────────────────────────────
// Query params: q, maxNodes, minYear, minCitations
//
// Returns: { nodes: [...], links: [...] }
// Each node: { id, title, year, citationCount, abstract, fieldsOfStudy, isPrimary, color }
// Each link: { source, target }
app.get('/api/graph', async (req, res) => {
  const query        = (req.query.q          || '').trim();
  const maxNodes     = Math.min(parseInt(req.query.maxNodes     || '30',  10), 200);
  const minYear      = parseInt(req.query.minYear      || '0',    10);
  const minCitations = parseInt(req.query.minCitations || '0',    10);

  if (!query) return res.status(400).json({ error: 'q parameter is required' });

  try {
    // Step 1: find matching primary papers
    const primaryRecords = await runQuery(
      `MATCH (p:Paper)
       WHERE toLower(p.title) CONTAINS toLower($query)
          OR toLower(p.abstract) CONTAINS toLower($query)
          OR ANY(f IN p.fieldsOfStudy WHERE toLower(f) CONTAINS toLower($query))
       AND (p.year IS NULL OR p.year >= $minYear)
       AND (p.citationCount IS NULL OR p.citationCount >= $minCitations)
       RETURN p
       ORDER BY p.citationCount DESC
       LIMIT $maxNodes`,
      {
        query,
        minYear:      neo4j.int(minYear),
        minCitations: neo4j.int(minCitations),
        maxNodes:     neo4j.int(maxNodes),
      }
    );

    const nodeMap = new Map();
    primaryRecords.forEach(r => {
      const paper = parsePaper(r.get('p'), true);
      nodeMap.set(paper.paperId, paper);
    });

    if (nodeMap.size === 0) {
      return res.json({ nodes: [], links: [] });
    }

    // Step 2: fetch references for those papers
    const primaryIds = Array.from(nodeMap.keys());
    const refRecords = await runQuery(
      `MATCH (p:Paper)-[:REFERENCES]->(ref:Paper)
       WHERE p.paperId IN $ids
       RETURN p.paperId AS sourceId, ref`,
      { ids: primaryIds }
    );

    const links = [];
    refRecords.forEach(r => {
      const sourceId = r.get('sourceId');
      const refPaper = parsePaper(r.get('ref'), false);
      if (!nodeMap.has(refPaper.paperId)) {
        nodeMap.set(refPaper.paperId, refPaper);
      }
      links.push({ source: sourceId, target: refPaper.paperId });
    });

    res.json({ nodes: Array.from(nodeMap.values()), links });
  } catch (e) {
    console.error('Graph query error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
app.get('/api/health', async (_req, res) => {
  try {
    await driver.verifyConnectivity();
    res.json({ status: 'ok', neo4j: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', neo4j: e.message });
  }
});

// ── GET /api/schema-hint ──────────────────────────────────────────────────────
// Returns a sample Cypher script to seed Neo4j with the expected schema
app.get('/api/schema-hint', (_req, res) => {
  res.json({
    description: 'Expected Neo4j schema for Stellar Papers',
    nodeLabel: 'Paper',
    nodeProperties: ['paperId (string, unique)', 'title (string)', 'year (int)', 'citationCount (int)', 'abstract (string)', 'fieldsOfStudy (string[])'],
    relationship: '(:Paper)-[:REFERENCES]->(:Paper)',
    sampleCypher: `
// Create index for fast title search
CREATE INDEX paper_paperId IF NOT EXISTS FOR (p:Paper) ON (p.paperId);
CREATE FULLTEXT INDEX paper_search IF NOT EXISTS FOR (p:Paper) ON EACH [p.title, p.abstract];

// Example paper nodes
MERGE (p1:Paper { paperId: 'arxiv-1706-03762' })
  SET p1.title = 'Attention Is All You Need',
      p1.year = 2017,
      p1.citationCount = 91000,
      p1.abstract = 'The dominant sequence transduction models...',
      p1.fieldsOfStudy = ['Computer Science'];

MERGE (p2:Paper { paperId: 'arxiv-1810-04805' })
  SET p2.title = 'BERT: Pre-training of Deep Bidirectional Transformers',
      p2.year = 2018,
      p2.citationCount = 55000,
      p2.fieldsOfStudy = ['Computer Science'];

// Reference relationship
MATCH (a:Paper { paperId: 'arxiv-1810-04805' })
MATCH (b:Paper { paperId: 'arxiv-1706-03762' })
MERGE (a)-[:REFERENCES]->(b);
    `.trim(),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Stellar Papers API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
  console.log(`   Schema hint:  http://localhost:${PORT}/api/schema-hint`);
});

process.on('exit', () => driver.close());
