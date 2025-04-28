import React, { useState } from 'react';
import { Link } from 'react-router';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Password reset requested for:', email);
    // Add your password reset logic here
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-light text-gray-900 tracking-tight">AutoBros</h2>
        <h3 className="mt-2 text-center text-base text-gray-500 font-light">Reset your password</h3>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-md sm:px-10">
          {!submitted ? (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="input input-bordered w-full rounded-md bg-gray-50 border-gray-300"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn w-full rounded-md bg-gray-800 text-white hover:bg-gray-700"
                  >
                    Send reset link
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-200">
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Reset link sent</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a password reset link to <span className="font-medium">{email}</span>.
                Please check your email and follow the instructions.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="btn btn-outline btn-sm rounded-md bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  onClick={() => setSubmitted(false)}
                >
                  Send again
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/login" className="font-medium text-gray-600 hover:text-gray-800">
                Back to login
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} AutoBros. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;