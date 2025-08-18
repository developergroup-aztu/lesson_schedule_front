import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex h-[80vh]  items-center justify-center p-4">
      <div className="text-center">
        <h1 className="mb-4 text-9xl font-bold text-meta-5">404</h1>
        <h2 className="mb-6 text-3xl font-bold">Səhifə Tapılmadı</h2>
        <p className="mb-8 text-lg">
          Axtardığınız səhifə mövcud deyil.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-white transition hover:bg-opacity-90"
        >
          Ana səhifəyə qayıt
        </Link>
      </div>
    </div>
  );
};

export default NotFound;