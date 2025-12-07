// 견적서 템플릿 API 엔드포인트
export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const path = url.pathname.split('/api/templates')[1] || '';

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
    const result = await db.prepare('SELECT * FROM quote_templates WHERE id = ?').bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(parseTemplate(result)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const { searchParams } = new URL(request.url);
  const createdBy = searchParams.get('created_by');
  
  let query = 'SELECT * FROM quote_templates WHERE 1=1';
  const binds = [];
  
  if (createdBy) {
    query += ' AND created_by = ?';
    binds.push(createdBy);
  }
  
  query += ' ORDER BY created_at DESC';
  
  const stmt = db.prepare(query);
  if (binds.length > 0) {
    stmt.bind(...binds);
  }
  
  const results = await stmt.all();
  const templates = results.results.map(parseTemplate);
  
  return new Response(JSON.stringify(templates), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(request, env) {
  const db = env.DB;
  const data = await request.json();
  
  const id = data.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO quote_templates (
      id, name, items, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.name || '',
    JSON.stringify(data.items || []),
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
    UPDATE quote_templates SET
      name = ?,
      items = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    data.name || '',
    JSON.stringify(data.items || []),
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
  
  await db.prepare('DELETE FROM quote_templates WHERE id = ?').bind(id).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function parseTemplate(row) {
  return {
    id: row.id,
    name: row.name,
    items: JSON.parse(row.items || '[]'),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}




