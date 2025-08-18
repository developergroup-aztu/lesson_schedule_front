import React from 'react';

interface PaginationProps {
  currentPage: number; // Cari səhifənin nömrəsi
  totalPages: number; // Ümumi səhifə sayı
  onPageChange: (page: number) => void; // Səhifə dəyişdikdə çağrılacaq funksiya
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null; // Yalnız bir səhifə varsa, pagination göstərmə

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3; // Eyni anda görünən səhifə düymələrinin maksimum sayı

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // İlk səhifəni əlavə et (əgər lazım gələrsə)
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push(-1); // Ellipsis (üç nöqtə) üçün xüsusi dəyər
    }

    // Cari səhifənin ətrafındakı səhifələri əlavə et
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Son səhifəni əlavə et (əgər lazım gələrsə)
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(-1); // Ellipsis (üç nöqtə) üçün xüsusi dəyər
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center pt-4">
      <nav className="inline-flex rounded-md gap-2.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-green-100 hover:border-green-100 disabled:opacity-50"
        >
          «
        </button>

        {getPageNumbers().map((page, idx) => (
          page === -1 ? (
            <span key={`ellipsis-${idx}`} className="px-3 py-1 text-gray-500">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 border rounded-lg ${page === currentPage
                ? 'bg-green-500 text-white' // Aktiv səhifənin rəngi
                : 'bg-white text-slate-700 hover:bg-green-100 hover:border-green-100 border-stroke' // Digər səhifələrin rəngi
                }`}
            >
              {page}
            </button>
          )
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-stroke rounded-lg bg-white text-slate-500 hover:bg-green-100 hover:border-green-100 disabled:opacity-50"
        >
          »
        </button>
      </nav>
    </div>
  );
};

export default Pagination;