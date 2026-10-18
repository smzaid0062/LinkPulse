import { useEffect, useState } from 'react';

async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const loadLinks = async () => {
    try {
      setLinks(await api('/api/links'));
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const shorten = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const link = await api('/api/links', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      setLinks((prev) => [link, ...prev].slice(0, 10));
      setUrl('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async (shortUrl) => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(shortUrl);
    setTimeout(() => setCopied(''), 1500);
  };

  return (
    <main className="page">
      <header className="masthead">
        <h1>LinkPulse</h1>
        <p>Lamba link paste karo, chhota link lo, aur dekho kitne log click karte hain.</p>
      </header>

      <form className="shorten" onSubmit={shorten}>
        <input
          type="url"
          placeholder="https://example.com/very/long/link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          aria-label="Long URL"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening…' : 'Shorten link'}
        </button>
      </form>
      {error && <p className="error" role="alert">{error}</p>}

      <section className="links">
        <div className="links-head">
          <h2>Recent links</h2>
          <button className="ghost" onClick={loadLinks}>Refresh clicks</button>
        </div>

        {links.length === 0 ? (
          <p className="empty">Abhi koi link nahi hai. Upar se pehla link banao.</p>
        ) : (
          <ul>
            {links.map((l) => (
              <li key={l.code}>
                <div className="link-main">
                  <a href={l.shortUrl} target="_blank" rel="noreferrer">{l.shortUrl}</a>
                  <span className="long" title={l.longUrl}>{l.longUrl}</span>
                </div>
                <div className="link-side">
                  <span className="clicks"><strong>{l.clicks}</strong> clicks</span>
                  <button className="ghost" onClick={() => copy(l.shortUrl)}>
                    {copied === l.shortUrl ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
