export default function ServicesSection() {
  const services = [
    {
      title: "IT Consulting & Strategy",
      description:
        "Clear roadmaps and practical plans to modernize systems and reduce complexity.",
      features: [
        "Tech assessments & audits",
        "Architecture & roadmap",
        "Change management & enablement",
      ],
    },
    {
      title: "AI & Automation",
      description:
        "Automate repetitive work and unlock insights with LLMs and workflow orchestration.",
      features: [
        "Process automation",
        "AI copilots & chatbots",
        "RAG & data pipelines",
      ],
    },
    {
      title: "Business Process Optimization",
      description:
        "Streamline operations with measurable KPIs and lean, efficient processes.",
      features: [
        "Process mapping & SOPs",
        "Integrations & APIs",
        "Analytics & dashboards",
      ],
    },
    {
      title: "Training & Knowledge Transfer",
      description:
        "Hands-on upskilling for teams to adopt tools with confidence and clarity.",
      features: [
        "Workshops & bootcamps",
        "Playbooks & enablement",
        "On-demand support",
      ],
    },
    {
      title: "Custom Software Development",
      description:
        "From concept to production—build reliable apps that users love.",
      features: [
        "Full-stack web & mobile",
        "Security & best practices",
        "CI/CD & cloud hosting",
      ],
    },
  ];

  return (
    <section className="py-20 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What We <span className="text-[#44559e]">Do</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Approachable, effective technology—delivered with clear methods.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#44559e] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed text-base">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-start gap-3 text-gray-700 group-hover:translate-x-1 transition-transform duration-300"
                      style={{
                        transitionDelay: `${featureIndex * 50}ms`,
                      }}
                    >
                      <span className="text-[#44559e] text-xl font-bold mt-0.5">•</span>
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
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

