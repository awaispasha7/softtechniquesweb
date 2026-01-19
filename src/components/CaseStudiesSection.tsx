export default function CaseStudiesSection() {
  const caseStudies = [
    {
      title: "AI Support Assistant",
      description:
        "Reduced response time by 48% with a retrieval-augmented assistant for a support team.",
    },
    {
      title: "Workflow Automation",
      description:
        "Automated lead routing and reporting, saving ~40 hours/month for operations.",
    },
    {
      title: "Legacy Modernization",
      description:
        "Moved an internal tool to a modern stack with role-based access and dashboards.",
    },
  ];

  return (
    <section className="py-20 bg-white" id="case-studies">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Case <span className="text-[#44559e]">Studies</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Recent wins and representative projects.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
              style={{
                animationDelay: `${index * 150}ms`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#44559e] transition-colors duration-300">
                  {study.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {study.description}
                </p>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

