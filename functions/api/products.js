// 상품 API 엔드포인트
export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const path = url.pathname.split('/api/products')[1] || '';

  try {
    switch (method) {
      case 'GET':
        return handleGet(path, request, env);
      case 'POST':
        return handlePost(request, env);
      case 'PUT':
        return handlePut(path, request, env);
      case 'DELETE':
        return handleDelete(path, env);
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleGet(path, request, env) {
  const db = env.DB;
  
  if (path && path !== '/') {
    const id = path.substring(1);
    const result = await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(parseProduct(result)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const results = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  const products = results.results.map(parseProduct);
  
  return new Response(JSON.stringify(products), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(request, env) {
  const db = env.DB;
  const data = await request.json();
  
  const id = data.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO products (
      id, name, description, proposal_file, basic_areas, demo_areas,
      case_areas, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.name || '',
    data.description || null,
    data.proposalFile || null,
    JSON.stringify(data.basicAreas || []),
    JSON.stringify(data.demoAreas || []),
    JSON.stringify(data.caseAreas || []),
    data.createdBy || '',
    now,
    now
  ).run();
  
  return new Response(JSON.stringify({ id, success: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePut(path, request, env) {
  const db = env.DB;
  const id = path.substring(1);
  const data = await request.json();
  const now = new Date().toISOString();
  
  await db.prepare(`
    UPDATE products SET
      name = ?,
      description = ?,
      proposal_file = ?,
      basic_areas = ?,
      demo_areas = ?,
      case_areas = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    data.name || '',
    data.description || null,
    data.proposalFile || null,
    JSON.stringify(data.basicAreas || []),
    JSON.stringify(data.demoAreas || []),
    JSON.stringify(data.caseAreas || []),
    now,
    id
  ).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleDelete(path, env) {
  const db = env.DB;
  const id = path.substring(1);
  
  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function parseProduct(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    proposalFile: row.proposal_file,
    basicAreas: JSON.parse(row.basic_areas || '[]'),
    demoAreas: JSON.parse(row.demo_areas || '[]'),
    caseAreas: JSON.parse(row.case_areas || '[]'),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}




