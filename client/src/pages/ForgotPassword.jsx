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
        <h1 style={{ textAlign: "center" }}>Forgot password</h1>
        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Enter your email and we'll send you a link to reset your password.
        </p>
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {devLink && (
          <div className="alert alert-success">
            Dev mode (no email service yet):{" "}
            <Link to={devLink}>Click here to reset your password</Link>
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
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <p className="form-footer-link">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
