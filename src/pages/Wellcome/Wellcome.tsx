import { Calendar, Search, Zap, ArrowRight, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Wellcome() {
    const navigate = useNavigate();
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-32 sm:w-48 md:w-72 h-32 sm:h-48 md:h-72 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-8 w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96 bg-gradient-to-tr from-indigo-500/8 to-blue-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-gradient-to-tl from-indigo-400/12 to-violet-500/12 rounded-full blur-3xl"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-20 right-20 w-3 sm:w-4 h-3 sm:h-4 bg-indigo-500 rotate-45 opacity-60"></div>
        <div className="absolute top-1/2 left-20 w-4 sm:w-6 h-4 sm:h-6 bg-indigo-400 rounded-full opacity-40"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br rounded-xl p-1 flex items-center justify-center shadow-lg">
              <img src="https://smartjob.az/storage/avatars/USxbbHTzg3TYKNVI8dEiqtekJilnOGeFoi7Tp51j.png" alt="AzTU Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0D1F61]">AzTU</h2>
              <p className="text-xs sm:text-sm text-indigo-600 font-medium">Dərs Cədvəli</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
            <span className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Əlçatan</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-8 lg:py-12">
            <div className="relative">
              {/* Main Hero Shape */}
              <div className="absolute inset-0 -m-4 sm:-m-6 md:-m-8">
                <div className="w-full h-full bg-gradient-to-r from-indigo-600/5 via-indigo-500/10 to-purple-600/5 rounded-2xl sm:rounded-3xl md:rounded-[3rem] border border-indigo-200/30 backdrop-blur-sm"></div>
              </div>
              
              <div className="relative z-10 px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12">
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Yeni Nəsil Təhsil Texnologiyası
                </div>
                
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    AzTU Dərs Cədvəli
                  </span>
                  <br />
                  <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Sisteminə Xoş Gəlmisiniz</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-3 sm:mb-4 leading-relaxed max-w-4xl mx-auto px-2">
                  Bu platforma dərs cədvəllərinin hazırlanması və idarə edilməsini 
                  <span className="text-indigo-600 font-semibold"> daha asan, sürətli və dəqiq</span> etmək üçün hazırlanmışdır.
                </p>
                
                <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto px-2">
                  Artıq saatlarca vaxt aparan planlama prosesi bir neçə kliklə tamamlanır.
                </p>

                {/* CTA Button */}
                <button 
                  onClick={() => navigate("/signin")} 
                  className="group bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-base sm:text-lg font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 sm:space-x-3 mx-auto"
                >
                  <span>Giriş Et</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="py-12 sm:py-16 md:py-20">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                Nəyi Fərqli Edir?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                Ənənəvi metodlardan fərqli olaraq, sistemimiz tam avtomatlaşmış və istifadəçi dostu həlllər təklif edir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 px-4">
              {/* Feature 1 */}
              <div className="group">
                <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">📅 Avtomatik Planlama</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Dərslərin otaqlara və saatlara optimal yerləşdirilməsi. 
                    Sistem konfliktləri avtomatik aradan qaldırır və ən yaxşı həlli təklif edir.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">🔍 Asan İzləmə</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Müəllimlər yalnız öz dərslərini görə bilir. 
                    Şəxsiləşdirilmiş panellər və detallı hesabatlar ilə tam nəzarət.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">⚡ Sürətli Yeniləmə</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    İstənilən dəyişiklik dərhal cədvəldə əks olunur. 
                    Real vaxt sinxronizasiyası ilə hamı son informasiyaya çatır.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group">
                <div className="bg-white/70 backdrop-blur-sm border border-indigo-100/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/15 transform hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">👥 Tələbə Əlçatanlığı</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Dərs cədvəli qurulduqda hər bir tələbə LMS sistemində öz şəxsi dərs cədvəlini görə bilir.
                    Mobil və desktop platformalarda tam əlçatanlıq.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 px-4 sm:px-6 bg-white/50 backdrop-blur-sm border-t border-indigo-100">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br rounded-md sm:rounded-lg flex items-center justify-center">
              <img src="https://smartjob.az/storage/avatars/USxbbHTzg3TYKNVI8dEiqtekJilnOGeFoi7Tp51j.png" alt="AzTU Logo" className="w-full h-full object-cover rounded-md sm:rounded-lg" />
            </div>
            <span className="text-sm sm:text-base font-bold text-[#0D1F61]">AzTU Dərs Cədvəli Sistemi</span>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-[#0D1F61] px-4">© 2025 Azərbaycan Texniki Universiteti. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  );
}

export default Wellcome;