function cors(env, origin) {
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(x => x.trim()).filter(Boolean);
  const ok = allowed.includes('*') || allowed.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : (allowed[0] || 'null'),
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Updated-At',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Cache-Control': 'no-store'
  };
}
function json(data, status, headers) { return new Response(JSON.stringify(data), {status, headers:{...headers,'Content-Type':'application/json; charset=utf-8'}}); }
function authorized(request, env) {
  const expected = env.APP_TOKEN;
  const actual = request.headers.get('Authorization') || '';
  return expected && actual === `Bearer ${expected}`;
}
function safeKey(value) { return /^[A-Za-z0-9._:-]{1,160}$/.test(value); }
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = cors(env, origin);
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers});
    if (!authorized(request, env)) return json({error:'Unauthorized'}, 401, headers);
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/health' && request.method === 'GET') return json({ok:true, service:'my-zepbound-journey-sync', time:new Date().toISOString()}, 200, headers);
      if (url.pathname === '/api/records' && request.method === 'GET') {
        const {results} = await env.DB.prepare('SELECT record_key, value_json, updated_at, device_id, deleted FROM records ORDER BY record_key').all();
        return json({records:results.map(r=>({key:r.record_key,value:r.value_json?JSON.parse(r.value_json):null,updated_at:r.updated_at,device_id:r.device_id,deleted:!!r.deleted}))}, 200, headers);
      }
      if (url.pathname === '/api/records' && request.method === 'POST') {
        const body = await request.json();
        if (!safeKey(body.key)) return json({error:'Invalid record key'}, 400, headers);
        const updatedAt = body.updatedAt || new Date().toISOString();
        await env.DB.prepare(`INSERT INTO records(record_key,value_json,updated_at,device_id,deleted) VALUES(?,?,?,?,?)
          ON CONFLICT(record_key) DO UPDATE SET value_json=excluded.value_json,updated_at=excluded.updated_at,device_id=excluded.device_id,deleted=excluded.deleted
          WHERE excluded.updated_at >= records.updated_at`).bind(body.key, JSON.stringify(body.value ?? null), updatedAt, body.deviceId || '', body.deleted ? 1 : 0).run();
        await env.DB.prepare('INSERT INTO audit_log(action,target_key,device_id,created_at) VALUES(?,?,?,?)').bind(body.deleted?'delete':'upsert',body.key,body.deviceId||'',new Date().toISOString()).run();
        return json({ok:true,key:body.key,updatedAt}, 200, headers);
      }
      if (url.pathname === '/api/photos' && request.method === 'GET') {
        const {results} = await env.DB.prepare('SELECT photo_key, content_type, size_bytes, updated_at FROM photos ORDER BY photo_key').all();
        return json({photos:results.map(r=>({key:r.photo_key,content_type:r.content_type,size_bytes:r.size_bytes,updated_at:r.updated_at}))}, 200, headers);
      }
      const match = url.pathname.match(/^\/api\/photos\/([^/]+)$/);
      if (match) {
        const key = decodeURIComponent(match[1]); if (!safeKey(key)) return json({error:'Invalid photo key'},400,headers);
        const objectKey = `progress/${key}`;
        if (request.method === 'PUT') {
          const updatedAt = request.headers.get('X-Updated-At') || new Date().toISOString();
          const existing = await env.DB.prepare('SELECT updated_at FROM photos WHERE photo_key=?').bind(key).first();
          if (!existing || updatedAt >= existing.updated_at) {
            const body = await request.arrayBuffer(); const type = request.headers.get('Content-Type') || 'application/octet-stream';
            await env.PHOTOS.put(objectKey, body, {httpMetadata:{contentType:type}, customMetadata:{updatedAt}});
            await env.DB.prepare(`INSERT INTO photos(photo_key,object_key,content_type,size_bytes,updated_at) VALUES(?,?,?,?,?)
              ON CONFLICT(photo_key) DO UPDATE SET object_key=excluded.object_key,content_type=excluded.content_type,size_bytes=excluded.size_bytes,updated_at=excluded.updated_at`).bind(key,objectKey,type,body.byteLength,updatedAt).run();
          }
          return json({ok:true,key,updatedAt},200,headers);
        }
        if (request.method === 'GET') {
          const object = await env.PHOTOS.get(objectKey); if (!object) return json({error:'Photo not found'},404,headers);
          const h = new Headers(headers);object.writeHttpMetadata(h);h.set('etag',object.httpEtag);h.set('Cache-Control','private, no-store');return new Response(object.body,{headers:h});
        }
        if (request.method === 'DELETE') { await env.PHOTOS.delete(objectKey);await env.DB.prepare('DELETE FROM photos WHERE photo_key=?').bind(key).run();return new Response(null,{status:204,headers}); }
      }
      return json({error:'Not found'},404,headers);
    } catch (error) { console.error(error); return json({error:'Server error',detail:String(error.message||error)},500,headers); }
  }
};
