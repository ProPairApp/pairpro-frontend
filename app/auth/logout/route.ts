export async function GET() {
  // Return a tiny HTML page that runs in the browser,
  // clears localStorage, then redirects home.
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Signing out…</title></head>
  <body>
    <p>Signing you out…</p>
    <script>
      try { localStorage.removeItem('pairpro_token'); } catch (e) {}
      location.replace('/');
    </script>
  </body>
</html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
