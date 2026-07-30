import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [devLink, setDevLink] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      const data = await api.forgotPassword(email);
      setMessage(data.message);
      // dev_reset_link only exists until a real email service is wired up —
      // see the backend README before deploying.
      if (data.dev_reset_link) setDevLink(data.dev_reset_link);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <div className="form-card">
        {/* CHANGED: Simplified heading */}
        <h1 style={{ textAlign: "center" }}>Reset Password</h1>

        {/* CHANGED: Shortened instructions */}
        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Enter your email to receive a reset link.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {devLink && (
          <div className="alert alert-success">
            Dev mode: <Link to={devLink}>Reset password link</Link>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="form-footer-link">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
