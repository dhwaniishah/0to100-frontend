import React from 'react';
import { ArrowRight, BarChart, ShoppingBag, Users, CheckCircle } from 'lucide-react';
import hero from "./assets/hero2.webp"

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="bg-gray-100 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between lg:space-x-12">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Premium Quality</span>
                <span className="block text-gray-700">Performance Parts</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                Experience the difference with our precision-engineered automotive components designed to enhance your vehicle's performance. Trusted by mechanics and enthusiasts worldwide.
              </p>
              <div className="mt-8 flex space-x-4">
                <a
                  href="/shop"
                  className="px-6 py-3 rounded-md shadow bg-gray-800 text-white font-medium hover:bg-gray-700 flex items-center"
                >
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
                <a
                  href="#learn-more"
                  className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="bg-black p-3 rounded-md shadow-xl">
                <img
                  src={hero}
                  alt="High-performance engine component"
                  className="rounded-sm w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="py-12 bg-white" id="analytics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Our Impact</h2>
            <p className="mt-4 text-lg text-gray-500">
              We're proud of the numbers that demonstrate our commitment to excellence
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gray-50 pt-6 px-6 pb-8 rounded-lg text-center">
                <div className="flex justify-center">
                  <Users className="h-12 w-12 text-gray-700" />
                </div>
                <h3 className="mt-6 text-3xl font-extrabold text-gray-900">50,000+</h3>
                <p className="mt-2 text-lg text-gray-500">Happy customers</p>
              </div>

              <div className="bg-gray-50 pt-6 px-6 pb-8 rounded-lg text-center">
                <div className="flex justify-center">
                  <ShoppingBag className="h-12 w-12 text-gray-700" />
                </div>
                <h3 className="mt-6 text-3xl font-extrabold text-gray-900">10,000+</h3>
                <p className="mt-2 text-lg text-gray-500">Products sold</p>
              </div>

              <div className="bg-gray-50 pt-6 px-6 pb-8 rounded-lg text-center">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-gray-700" />
                </div>
                <h3 className="mt-6 text-3xl font-extrabold text-gray-900">99%</h3>
                <p className="mt-2 text-lg text-gray-500">Satisfaction rate</p>
              </div>

              <div className="bg-gray-50 pt-6 px-6 pb-8 rounded-lg text-center">
                <div className="flex justify-center">
                  <BarChart className="h-12 w-12 text-gray-700" />
                </div>
                <h3 className="mt-6 text-3xl font-extrabold text-gray-900">24/7</h3>
                <p className="mt-2 text-lg text-gray-500">Customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-12 bg-gray-50" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">What Our Customers Say</h2>
            <p className="mt-4 text-lg text-gray-500">
              We value the feedback from our community
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-800 font-bold">JD</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Jane Doe</h4>
                  <p className="text-gray-500">Verified Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The quality exceeded my expectations. I've been using this product daily for three months now and it still looks brand new."
              </p>
              <div className="mt-4 flex text-gray-400">
                <span>★★★★★</span>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-800 font-bold">MS</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Michael Smith</h4>
                  <p className="text-gray-500">Verified Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Customer service was exceptional. They went above and beyond to ensure I was satisfied with my purchase."
              </p>
              <div className="mt-4 flex text-gray-400">
                <span>★★★★★</span>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-800 font-bold">LJ</span>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900">Lisa Johnson</h4>
                  <p className="text-gray-500">Verified Customer</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Fast shipping and the product was exactly as described. Will definitely be ordering again in the future."
              </p>
              <div className="mt-4 flex text-gray-400">
                <span>★★★★★</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-12 bg-white" id="faq">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Find answers to common questions about our products and services
            </p>
          </div>

          <div className="mt-12 space-y-6 max-w-3xl mx-auto">
            {/* FAQ Item 1 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">How long does shipping take?</h3>
              <p className="mt-2 text-gray-600">
                Standard shipping takes 3-5 business days. Express shipping options are available at checkout for 1-2 day delivery.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">What is your return policy?</h3>
              <p className="mt-2 text-gray-600">
                We offer a 30-day satisfaction guarantee. If you're not completely satisfied, you can return the product for a full refund or exchange.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">Do you ship internationally?</h3>
              <p className="mt-2 text-gray-600">
                Yes, we ship to over 50 countries worldwide. International shipping times vary by location, typically taking 7-14 business days.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">How can I track my order?</h3>
              <p className="mt-2 text-gray-600">
                Once your order ships, you'll receive a confirmation email with a tracking number and link to monitor your delivery in real-time.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/shop"
              className="px-6 py-3 rounded-md shadow bg-gray-800 text-white font-medium hover:bg-gray-700 inline-flex items-center"
            >
              Visit Our Shop
              <ShoppingBag className="ml-2 w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;