import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export default function NavBar() {
  const history = useHistory();
  const { pathname } = useLocation();

  return (
    <div className="w-full bg-gray-800 flex items-center justify-between sm:border-b-2 sm:border-blue-500 py-2 sm:px-8 px-4 h-1/12">
      <button
        className="sm:text-2xl text-lg tracking-widest text-blue-300 hover:text-blue-200 focus:text-blue-200 font-open font-bold border-b-2 border-blue-200 hover:border-yellow-300 focus:border-yellow-300"
        onClick={() => (pathname !== '/' ? history.push('/') : null)}
      >
        Kinesis Blog
      </button>

      <button
        className="rounded-lg bg-blue-300 hover:bg-yellow-300 py-2 px-4 font-rale text-blue-900 font-bold"
        onClick={() => (pathname !== '/admin' ? history.push('/admin') : null)}
      >
        Sign In
      </button>
    </div>
  );
}
