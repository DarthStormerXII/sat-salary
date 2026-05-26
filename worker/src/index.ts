interface Env {
  DB: D1Database;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const match = url.pathname.match(/^\/profile\/(.+)$/);
    if (!match) return json({ error: "not found" }, 404);

    const address = match[1].toLowerCase();

    if (request.method === "GET") {
      const row = await env.DB.prepare(
        "SELECT role, org_name, person_name, company_size, industry, job_title FROM profiles WHERE address = ?",
      )
        .bind(address)
        .first();

      if (!row)
        return new Response(null, { status: 204, headers: CORS_HEADERS });

      if (row.role === "employer") {
        return json({
          role: "employer",
          orgName: row.org_name,
          personName: row.person_name,
          companySize: row.company_size ?? "",
          industry: row.industry ?? "",
        });
      }
      return json({
        role: "employee",
        personName: row.person_name,
        jobTitle: row.job_title ?? "",
      });
    }

    if (request.method === "PUT") {
      const body = (await request.json()) as Record<string, string>;
      if (!body.role) return json({ error: "role required" }, 400);

      await env.DB.prepare(
        `INSERT INTO profiles (address, role, org_name, person_name, company_size, industry, job_title, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
         ON CONFLICT(address) DO UPDATE SET
           role = excluded.role,
           org_name = excluded.org_name,
           person_name = excluded.person_name,
           company_size = excluded.company_size,
           industry = excluded.industry,
           job_title = excluded.job_title,
           updated_at = datetime('now')`,
      )
        .bind(
          address,
          body.role,
          body.orgName ?? null,
          body.personName ?? null,
          body.companySize ?? null,
          body.industry ?? null,
          body.jobTitle ?? null,
        )
        .run();

      return json({ ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  },
};
