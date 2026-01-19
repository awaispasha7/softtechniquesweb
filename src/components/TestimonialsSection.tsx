export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "SoftTechniques made complex tools easy for our team—results showed up fast.",
      author: "Director of Operations",
    },
    {
      quote:
        "The best part was the training. Our people actually use the new systems confidently.",
      author: "Head of Customer Success",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Clients <span className="text-[#44559e]">Say</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-10 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-gray-200 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <p className="text-xl text-gray-700 italic leading-relaxed mb-6 font-medium">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <p className="text-gray-600 font-semibold group-hover:text-[#44559e] transition-colors duration-300">
                  — {testimonial.author}
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

