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
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const travelSlides = [
  { image: "/images/relaxing.jpg", category: "Relaxing" },
  { image: "/images/adventure.jpg", category: "Adventure" },
  { image: "/images/family.jpg", category: "Family" },
  { image: "/images/cultural.jpg", category: "Cultural" },
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    preferredCurrency: "INR",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % travelSlides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  function updateForm(field: keyof typeof form, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim() || !form.country.trim()) {
      setError("Name and country are required.");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,128}$/;

    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must contain 8–128 characters, including an uppercase letter, lowercase letter, number, and special character.",
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          country: form.country.trim(),
          preferredCurrency: form.preferredCurrency,
          password: form.password,
        }),
      });

      if (!response.ok) {
        let message = "Registration failed. Please try again.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Keep the default error message.
        }

        throw new Error(message);
      }

      setSuccess(
        "Registration successful! Please check your email inbox and click the verification link to activate your account.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-blue-100 bg-[#e7f0ff] py-3.5 pl-12 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 p-3 sm:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-[1600px] flex-col overflow-hidden rounded-[28px] bg-blue-100 shadow-2xl lg:flex-row">
        {/* LEFT: TRAVEL SLIDESHOW */}
        <section className="relative min-h-[360px] overflow-hidden lg:min-h-[850px] lg:w-[55%]">
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

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/10 to-slate-950/65" />

          <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between p-6 text-white sm:p-10 lg:min-h-[850px] lg:p-14">
            <div className="flex items-center gap-3">
              <Plane className="h-9 w-9 text-blue-300" />
              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                AI Travel Planner
              </span>
            </div>

            <div className="my-12 max-w-xl">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl xl:text-7xl">
                Your Next Journey
                <br />
                <span className="text-blue-300">Starts Here.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/90 sm:text-xl">
                Create your account and start planning personalized adventures
                with your AI-powered travel companion.
              </p>
            </div>

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
                  { icon: Compass, name: "Adventure", slide: 1 },
                  { icon: MapPin, name: "Relaxing", slide: 0 },
                  { icon: Users, name: "Family", slide: 2 },
                  { icon: Globe2, name: "Cultural", slide: 3 },
                ].map(({ icon: Icon, name, slide }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setActiveSlide(slide)}
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

        {/* RIGHT: REGISTRATION FORM */}
        <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#edf5ff] to-[#dcecff] px-5 py-12 sm:px-10 lg:px-12">
          <div className="w-full max-w-[470px] rounded-[28px] border border-white/70 bg-[#f3f8ff] p-6 shadow-xl shadow-blue-900/10 sm:p-10">
            {/* Branding */}
            <div className="mb-7 text-center">
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

            <div className="mb-6">
              <h3 className="text-3xl font-bold text-slate-900">
                Create Account
              </h3>
              <p className="mt-2 text-slate-500">
                Join us and start exploring the world.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="register-name"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Full Name
                </label>

                <div className="relative">
                  <UserRound
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-name"
                    type="text"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Enter your full name"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="register-email"
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
                    id="register-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="Enter your email"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="register-country"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Country
                </label>

                <div className="relative">
                  <Globe2
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-country"
                    type="text"
                    required
                    autoComplete="country-name"
                    value={form.country}
                    onChange={(e) => updateForm("country", e.target.value)}
                    placeholder="Enter your country"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Currency */}
              <div>
                <label
                  htmlFor="register-currency"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Preferred Currency
                </label>

                <div className="relative">
                  <Wallet
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="register-currency"
                    value={form.preferredCurrency}
                    onChange={(e) =>
                      updateForm("preferredCurrency", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="AED">AED — UAE Dirham</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="register-password"
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
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
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
              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateForm("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className={`${inputClass} pr-12`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide passwords" : "Show passwords"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:text-blue-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Feedback */}
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="rounded-lg bg-green-50 p-4 text-sm text-green-700"
                >
                  {success}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || Boolean(success)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  "Creating Account..."
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/")}
                className="font-semibold text-blue-700 hover:underline"
              >
                Sign In
              </button>
            </p>

            <div className="mt-8 flex items-start gap-4 rounded-2xl bg-blue-100/80 p-4">
              <div className="rounded-full bg-blue-200 p-3">
                <Sparkles className="h-6 w-6 text-blue-700" />
              </div>

              <div>
                <h4 className="font-semibold text-slate-900">
                  Your adventure awaits
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">
                  Personalized travel plans are just a few clicks away.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
