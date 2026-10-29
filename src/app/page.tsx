"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Compass,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  MapPin,
  Plane,
  Sparkles,
  Users,
} from "lucide-react";

const travelSlides = [
  {
    image: "/images/relaxing.jpg",
    category: "Relaxing",
    description: "Unwind and recharge",
  },
  {
    image: "/images/adventure.jpg",
    category: "Adventure",
    description: "Discover thrilling experiences",
  },
  {
    image: "/images/family.jpg",
    category: "Family",
    description: "Create memories together",
  },
  {
    image: "/images/cultural.jpg",
    category: "Cultural",
    description: "Explore local traditions",
  },
];

export default function Home() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % travelSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Invalid email or password");
      }

      const data = await response.json();

      if (!data.token) {
        throw new Error("Login response did not contain a token");
      }

      sessionStorage.setItem("token", data.token);

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-3 sm:p-6">
      <div className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-[1600px] flex-col overflow-hidden rounded-[28px] bg-blue-100 shadow-2xl lg:flex-row">

        {/* TRAVEL IMAGE SECTION */}
        <section className="relative min-h-[360px] overflow-hidden lg:min-h-[850px] lg:w-[55%]">

          {/* Background slideshow */}
          {travelSlides.map((slide, index) => (
            <div
              key={slide.image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{
                backgroundImage: `url("${slide.image}")`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/10 to-slate-950/65" />

          <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between p-6 text-white sm:p-10 lg:min-h-[850px] lg:p-14">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <Plane className="h-9 w-9 text-blue-300" />
              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                AI Travel Planner
              </span>
            </div>

            {/* Hero */}
            <div className="my-12 max-w-xl">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-7xl">
                Plan Smarter.
                <br />
                <span className="text-blue-700">
                  Travel Better.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/90 sm:text-xl">
                Get personalized itineraries, discover amazing
                destinations, and plan unforgettable journeys
                with the power of AI.
              </p>
            </div>

            {/* Bottom travel categories */}
            <div>
              <div className="mb-5 flex justify-center gap-2">
                {travelSlides.map((slide, index) => (
                  <button
                    key={slide.category}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    aria-label={`Show ${slide.category} travel image`}
                    aria-pressed={activeSlide === index}
                    className={`h-2.5 rounded-full transition-all ${
                      activeSlide === index
                        ? "w-9 bg-white"
                        : "w-2.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>

              {/* <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { icon: Compass, name: "Adventure" },
                  { icon: MapPin, name: "Relaxing" },
                  { icon: Users, name: "Family" },
                  { icon: Globe2, name: "Cultural" },
                ].map(({ icon: Icon, name }, index) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSlide(index === 0 ? 1 : index === 1 ? 0 : index)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-white/30 bg-white/90 px-3 py-4 text-slate-900 shadow-lg backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white"
                  >
                    <Icon className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-semibold">
                      {name}
                    </span>
                  </button>
                ))}
              </div> */}
            </div>
          </div>
        </section>

        {/* LOGIN SECTION */}
        <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#edf5ff] to-[#dcecff] px-5 py-12 sm:px-10 lg:px-12">

          <div className="w-full max-w-[470px] rounded-[28px] border border-white/70 bg-[#f3f8ff] p-6 shadow-xl shadow-blue-900/10 sm:p-10">

            {/* Logo */}
            <div className="mb-10 text-center">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Plane className="h-8 w-8" />
                <h2 className="text-2xl font-bold tracking-tight">
                  AI Travel Planner
                </h2>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Your AI-powered travel companion
              </p>
            </div>

            {/* Welcome */}
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h3>

              <p className="mt-2 text-slate-500">
                Sign in to continue your journey
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-blue-100 bg-[#e7f0ff] py-4 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-blue-100 bg-[#e7f0ff] py-4 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {/* Sign in */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Registration */}
            <p className="mt-8 text-center text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/register")}
                className="font-semibold text-blue-700 hover:underline"
              >
                Create Account
              </button>
            </p>

            {/* Information card */}
            <div className="mt-10 flex items-start gap-4 rounded-2xl bg-blue-100/80 p-5">
              <div className="rounded-full bg-blue-200 p-3">
                <Sparkles className="h-6 w-6 text-blue-700" />
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">
                  Explore the world with AI
                </h4>

                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  From weekend getaways to dream vacations,
                  we help you plan it all.
                </p>
              </div>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}