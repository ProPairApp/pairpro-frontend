"use client";

import { useRef, useState } from "react";

export default function SignupPage() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setMsg(null);
    setOk(false);
    setLoading(true);
    try {
      const email = emailRef.current?.value?.trim() || "";
      const pw = passRef.current?.value || "";
      const role = roleRef.current?.value || "client";
      if (!email || !pw) throw new Error("Enter email and password");

      const r = await fetch(`${base}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw, role }),
      });
      if (!r.ok) throw new Error(await r.text());

      setOk(true);
      setMsg("Account created! You can log in now.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  @app.post("/auth/signup", response_model=UserOut)
def signup(data: SignupIn, db: Session = Depends(get_db)):
    try:
        exists = db.query(User).filter(User.email == data.email.lower()).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already registered")
        if data.role not in ("client", "provider"):
            raise HTTPException(status_code=400, detail="Invalid role")
        user = User(
            email=data.email.lower(),
            hashed_password=hash_password(data.password),
            role=data.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return UserOut(id=user.id, email=user.email, role=user.role)
    except IntegrityError as ie:
        db.rollback()
        # Likely duplicate email or constraint
        raise HTTPException(status_code=400, detail="Integrity error: possibly duplicate email")
    except SQLAlchemyError as se:
        db.rollback()
        # DB/table/column issues will show here
        raise HTTPException(status_code=500, detail=f"DB error: {str(se)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

  
  return (
    <main>
      <h1>Sign up</h1>
      <form onSubmit={handleSignup} style={{display:"grid", gap:10, maxWidth:380}}>
        <input
          ref={emailRef}
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
          style={{padding:10, border:"1px solid #ccc", borderRadius:8}}
        />
        <input
          ref={passRef}
          type="password"
          placeholder="password (min 6)"
          autoComplete="new-password"
          style={{padding:10, border:"1px solid #ccc", borderRadius:8}}
        />
        <select
          ref={roleRef}
          defaultValue="client"
          style={{padding:10, border:"1px solid #ccc", borderRadius:8}}
        >
          <option value="client">Client (free)</option>
          <option value="provider">Provider</option>
        </select>
        <button
          disabled={loading}
          style={{padding:"10px 14px", background:"black", color:"white", border:"none", borderRadius:8}}
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      {msg && (
        <p style={{color: ok ? "green" : "crimson", marginTop:10}}>
          {msg}
        </p>
      )}
      <p style={{marginTop:8}}>
        Already have an account? <a href="/auth/login">Log in</a>
      </p>
    </main>
  );
}
