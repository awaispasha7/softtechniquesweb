export default function AboutSection() {
  return (
    <section className="py-20 bg-white" id="about">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-[#44559e]">SoftTechniques</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We bridge the gap between people and technology.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Description Card */}
          <div
            className="group bg-white rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
            style={{ animationDelay: "0ms" }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                SoftTechniques is a consulting and solutions company focused on
                the human side of tech. We prioritize clarity, adoption, and
                measurable outcomes—ensuring your investment turns into real
                business value. Whether you&apos;re launching AI initiatives or
                modernizing legacy systems, we guide you with soft techniques and
                strong fundamentals.
              </p>

              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "0ms" }}>
                  <span className="text-[#44559e] text-xl font-bold mt-0.5">•</span>
                  <span className="text-lg font-medium">Outcome-first consulting</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "50ms" }}>
                  <span className="text-[#44559e] text-xl font-bold mt-0.5">•</span>
                  <span className="text-lg font-medium">
                    Human-centered adoption & enablement
                  </span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 group-hover:translate-x-1 transition-transform duration-300" style={{ transitionDelay: "100ms" }}>
                  <span className="text-[#44559e] text-xl font-bold mt-0.5">•</span>
                  <span className="text-lg font-medium">
                    Modern architectures and pragmatic automation
                  </span>
                </li>
              </ul>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          </div>

          {/* Side Cards */}
          <div className="space-y-8">
            {/* Industries Card */}
            <div
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
              style={{ animationDelay: "150ms" }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#44559e] transition-colors duration-300">
                  Industries
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  SMBs, enterprise teams, and specialized sectors like finance,
                  retail, and field services.
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>

            {/* Tech Stack Card */}
            <div
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
              style={{ animationDelay: "300ms" }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#44559e] transition-colors duration-300">
                  Tech Stack
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  React, Node, Python, FastAPI, PostgreSQL, Supabase, Next.js,
                  n8n/Make, OpenAI & HuggingFace, Vercel/AWS/GCP.
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

