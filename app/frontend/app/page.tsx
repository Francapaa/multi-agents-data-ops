import Link from "next/link";
import { HeaderControls } from "@/app/components/HeaderControls";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center h-16">
          <span className="text-2xl font-bold text-blue-600">PRD2Post</span>
          <div className="flex items-center gap-4">
            <HeaderControls />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6 animate-fade-in">
            From PRD to{" "}
            <span className="text-blue-600">Blog Post</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transform your Product Requirements Documents into polished,
            publication-ready blog posts with an AI-powered multi-agent
            pipeline.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl hover:shadow-blue-200 dark:hover:shadow-blue-900/50"
          >
            Start Transforming
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </section>

        <section className="border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.title} className="text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-6">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">
              Key Features
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white dark:bg-gray-950 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 hover:border-blue-200 dark:hover:border-blue-800 transition-colors animate-fade-in"
                >
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to streamline your documentation?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto">
              From rough PRD to polished blog post in minutes, not days.
            </p>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-lg transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-xl"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-400 dark:text-gray-600">
          &copy; {new Date().getFullYear()} PRD2Post. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

const steps = [
  {
    title: "Upload Your PRD",
    description:
      "Submit your Product Requirements Document. The platform parses and structures the content for AI processing.",
  },
  {
    title: "AI Multi-Agent Pipeline",
    description:
      "Specialized agents research, write, fact-check, and polish your content with confidence-based validation.",
  },
  {
    title: "Publish & Share",
    description:
      "Get a publication-ready blog post. Monitor token usage and costs throughout the process.",
  },
];

const features = [
  {
    title: "Multi-Agent Pipeline",
    description:
      "Four specialized AI agents — research, writing, fact-checking, and editing — work together to produce high-quality blog posts.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Quality Control",
    description:
      "Built-in validation with confidence scoring and automatic retries ensures consistent, reliable output quality.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Real-Time Processing",
    description:
      "Async task queues with Server-Sent Events provide live updates on your document's transformation progress.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Usage Tracking",
    description:
      "Monitor token consumption and associated costs across all projects with detailed analytics and reporting.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];
