<body
  style={{
    maxWidth: 720,
    margin: "0 auto",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  }}
>
  <header
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
    }}
  >
    <strong>PairPro</strong>
    <nav style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <a href="/">Home</a>
      <a href="/providers">Providers</a>
      <a href="/providers/new">Add Provider</a>
      <a href="/jobs/new">Create Job</a>
      <a href="/dashboard">Dashboard</a>
      <a href="/auth/login">Log in</a>
      <a href="/auth/signup">Sign up</a>
    </nav>
  </header>

  {children}

  <footer style={{ marginTop: 48, opacity: 0.6 }}>
    © {new Date().getFullYear()} PairPro
  </footer>
</body>
