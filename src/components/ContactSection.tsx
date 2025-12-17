"use client";

import { useState } from "react";
import emailjs from '@emailjs/browser';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS configuration - replace with your actual values
      const serviceId = 'service_zi9o7jq'; // Your EmailJS service ID
      const templateId = 'template_e3zn4ww'; // Replace with your EmailJS template ID
      const publicKey = 'TRk47q4krWxVvrZCs'; // Replace with your EmailJS public key

      // Send email using EmailJS
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: formData.name,
          from_email: formData.email,
          message: formData.message,
          to_email: 'ask@softtechniques.com', // Your Hostinger email
        },
        publicKey
      );

      setSubmitStatus('success');
      setFormData({ name: "", email: "", message: "" }); // Reset form
    } catch (error) {
      console.error('EmailJS Error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="py-20 bg-white" id="contact">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get in <span className="text-[#44559e]">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tell us what you&apos;re working on—let&apos;s map the next steps.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Message sent successfully!</p>
                  <p className="text-sm">We&apos;ll get back to you soon.</p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                  <p className="font-medium">Failed to send message</p>
                  <p className="text-sm">Please try again or email us directly.</p>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44559e] focus:border-transparent transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44559e] focus:border-transparent transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#44559e] focus:border-transparent transition-all outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#44559e] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#36447e] transition-colors shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>

              <p className="text-gray-500 text-center">
                Or email us directly at{" "}
                <a
                  href="mailto:hello@softtechniques.com"
                  className="text-[#44559e] hover:underline"
                >
                ask@softtechniques.com
                </a>
                .
              </p>
            </form>
          </div>

          {/* Company Details */}
          <div
            className="group bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 animate-fade-in-up hover:border-[#44559e] relative overflow-hidden"
            style={{ animationDelay: "200ms" }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#44559e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-[#44559e]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-[#44559e] transition-colors duration-300">
                Company Details
              </h3>

              <div className="space-y-6">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  SoftTechniques
                </p>
                <p className="text-gray-600">
                  Technology Consulting & Solutions
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href="mailto:hello@softtechniques.com"
                    className="text-[#44559e] hover:underline"
                  >
                     ask@softtechniques.com
                  </a>
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Phone:</span>{" "}
                  <a
                    href="tel:+15550123456"
                    className="text-[#44559e] hover:underline"
                  >
                    +1 (555) 012-3456
                  </a>
                </p>
              </div>

              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Location:</span> Remote /
                  Global
                </p>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex gap-6">
                  <a
                    href="https://www.linkedin.com/company/softtechniques/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-[#44559e] transition-colors underline font-medium"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com/softtechniques"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-[#44559e] transition-colors underline font-medium"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://github.com/gspec-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-[#44559e] transition-colors underline font-medium"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

