// 견적서 API 엔드포인트
export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const path = url.pathname.split('/api/quotes')[1] || '';

  try {
    switch (method) {
      case 'GET':
        return handleGet(path, env);
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

async function handleGet(path, env) {
  const db = env.DB;
  
  if (path && path !== '/') {
    // 특정 견적서 조회
    const id = path.substring(1);
    const result = await db.prepare('SELECT * FROM quotes WHERE id = ?').bind(id).first();
    
    if (!result) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(parseQuote(result)), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // 전체 견적서 목록 조회
  const { searchParams } = new URL(request.url);
  const createdBy = searchParams.get('created_by');
  const status = searchParams.get('status');
  
  let query = 'SELECT * FROM quotes WHERE 1=1';
  const binds = [];
  
  if (createdBy) {
    query += ' AND created_by = ?';
    binds.push(createdBy);
  }
  
  if (status) {
    query += ' AND status = ?';
    binds.push(status);
  }
  
  query += ' ORDER BY quote_date DESC, created_at DESC';
  
  const stmt = db.prepare(query);
  if (binds.length > 0) {
    stmt.bind(...binds);
  }
  
  const results = await stmt.all();
  const quotes = results.results.map(parseQuote);
  
  return new Response(JSON.stringify(quotes), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handlePost(request, env) {
  const db = env.DB;
  const data = await request.json();
  
  const id = data.id || `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  await db.prepare(`
    INSERT INTO quotes (
      id, quote_title, quote_date, company_name, customer_id, purpose,
      manager_name, status, status_history, items, total_amount, note,
      is_temp, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    data.quoteTitle || '',
    data.quoteDate || now.split('T')[0],
    data.companyName || null,
    data.customerId || null,
    data.purpose || null,
    data.managerName || null,
    data.status || '접수',
    JSON.stringify(data.statusHistory || {}),
    JSON.stringify(data.items || []),
    data.totalAmount || 0,
    data.note || null,
    data.isTemp ? 1 : 0,
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
    UPDATE quotes SET
      quote_title = ?,
      quote_date = ?,
      company_name = ?,
      customer_id = ?,
      purpose = ?,
      manager_name = ?,
      status = ?,
      status_history = ?,
      items = ?,
      total_amount = ?,
      note = ?,
      is_temp = ?,
      updated_at = ?
    WHERE id = ?
  `).bind(
    data.quoteTitle || '',
    data.quoteDate || now.split('T')[0],
    data.companyName || null,
    data.customerId || null,
    data.purpose || null,
    data.managerName || null,
    data.status || '접수',
    JSON.stringify(data.statusHistory || {}),
    JSON.stringify(data.items || []),
    data.totalAmount || 0,
    data.note || null,
    data.isTemp ? 1 : 0,
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
  
  await db.prepare('DELETE FROM quotes WHERE id = ?').bind(id).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function parseQuote(row) {
  return {
    id: row.id,
    quoteTitle: row.quote_title,
    quoteDate: row.quote_date,
    companyName: row.company_name,
    customerId: row.customer_id,
    purpose: row.purpose,
    managerName: row.manager_name,
    status: row.status,
    statusHistory: JSON.parse(row.status_history || '{}'),
    items: JSON.parse(row.items || '[]'),
    totalAmount: row.total_amount || 0,
    note: row.note,
    isTemp: row.is_temp === 1,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}




