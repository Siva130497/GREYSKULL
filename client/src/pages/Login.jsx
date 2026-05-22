import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

import { api } from "../lib/api";
import { saveSession, getSession } from "../lib/storage";

export default function Login() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, send straight to their home
  useEffect(() => {
    const s = getSession();
    if (s?.token && s?.user) {
      nav(s.user.role === "super_admin" ? "/app/admin" : "/app/diary", {
        replace: true,
      });
    }
  }, [nav]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const timeLabel = useMemo(
    () => now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    [now]
  );
  const dateLabel = useMemo(
    () =>
      now.toLocaleDateString([], {
        weekday: "long",
        month: "long",
        day: "2-digit",
      }),
    [now]
  );

  const canSubmit = email.trim() && password.length >= 6 && !submitting;

  async function login(e) {
    e?.preventDefault?.();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setErr("");
      const res = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const { token, user } = res.data.data;
      saveSession({ token, user });
      nav(user.role === "super_admin" ? "/app/admin" : "/app/diary", {
        replace: true,
      });
    } catch (e) {
      const code = e?.response?.data?.message;
      setErr(
        code === "INVALID_CREDENTIALS"
          ? "Wrong email or password."
          : "Login failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="
        relative
        min-h-[100dvh]
        w-full
        flex items-center justify-center
        px-4 sm:px-6 lg:px-8
        py-[max(env(safe-area-inset-top),24px)]
        pb-[max(env(safe-area-inset-bottom),24px)]
      "
      style={{
        background: `
          radial-gradient(900px 500px at 70% 20%, #f59e0b22 0%, transparent 55%),
          linear-gradient(135deg, #0b1220 0%, #334155 100%)
        `,
      }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_35%)]" />
      </div>

      <div className="relative w-full max-w-md sm:max-w-lg">
        {/* Clock row */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="text-white/90 min-w-0">
            <div className="text-2xl sm:text-3xl font-extrabold leading-none tabular-nums">
              {timeLabel}
            </div>
            <div className="text-[11px] sm:text-sm text-white/70 mt-1 truncate">
              {dateLabel}
            </div>
          </div>

          <div className="shrink-0 px-3 py-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-white/85 text-xs sm:text-sm font-semibold">
            Grayskull
          </div>
        </div>

        {/* Main card */}
        <form
          onSubmit={login}
          className="
            bg-white/95 backdrop-blur-xl
            border border-white/60
            rounded-3xl
            shadow-[0_20px_60px_rgba(0,0,0,0.30)]
            p-5 sm:p-6 lg:p-7
            space-y-4 sm:space-y-5
          "
        >
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Station Diary
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Sign in with your work email & password
            </p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <div className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Email
            </div>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@grayskull.com"
                className="
                  w-full h-12 rounded-xl
                  border border-gray-200 bg-white
                  pl-9 pr-3
                  text-gray-900 text-base
                  shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-red-500/40
                "
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="text-[11px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Password
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="
                  w-full h-12 rounded-xl
                  border border-gray-200 bg-white
                  pl-9 pr-12
                  text-gray-900 text-base
                  shadow-sm
                  focus:outline-none focus:ring-2 focus:ring-red-500/40
                "
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-95 transition"
                title={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {err && (
            <div className="text-sm text-red-600 font-medium text-center bg-red-50 border border-red-100 rounded-xl py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="
              w-full h-12
              rounded-xl font-bold tracking-wide
              text-white text-base
              bg-gradient-to-r from-red-600 to-red-700
              shadow-md
              hover:brightness-110
              active:scale-[0.99]
              transition
              disabled:opacity-40 disabled:active:scale-100
            "
          >
            {submitting ? "Signing in…" : "SIGN IN"}
          </button>

          <div className="text-center text-[11px] sm:text-xs text-gray-500 pt-1">
            Grayskull • Station Operations
          </div>
        </form>
      </div>
    </div>
  );
}
