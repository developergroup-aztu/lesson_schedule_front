import Swal from "sweetalert2";

/**
 * SweetAlert üçün custom hook.
 * Bütün SweetAlert bildirişlərinin düzgün z-index ilə digər elementlərin üzərində görünməsini təmin edir.
 */
export const useSweetAlert = () => {
    // Ümumi SweetAlert sinifləri
    const baseClasses = {
        title: "text-lg font-semibold text-slate-800",
        content: "text-sm text-slate-600",
        confirmButton: "px-4 py-1 bg-blue500 text-white rounded-lg hover:bg-blue500/90",
        cancelButton: "px-4 py-1 ml-2 bg-slate-50 text-slate-800 rounded-lg border border-stroke hover:bg-slate-100",
    };

    // SweetAlert-in əsas konteyneri üçün çox yüksək z-index təyin edin
    // Bu, onun digər modalların və elementlərin üzərində görünməsini təmin edəcək.
    const sweetAlertContainerZIndex = "z-[100000]"; 

    /**
     * Təsdiq xəbərdarlığı göstərir. İstifadəçidən bir təsdiq (Bəli/Xeyr) tələb edir.
     * @param title - Bildirişin başlığı
     * @param text - Bildirişin mətni
     * @param confirmText - Təsdiq düyməsinin mətni (defolt: "Bəli")
     * @param cancelText - Ləğv düyməsinin mətni (defolt: "Xeyr")
     * @returns İstifadəçi təsdiq edibsə `true`, əks halda `false`.
     */
    const confirmAlert = async (
        title: string,
        text: string,
        confirmText: string = "Bəli",
        cancelText: string = "Xeyr"
    ): Promise<boolean> => {
        const result = await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            customClass: {
                container: sweetAlertContainerZIndex, // Əsas konteynerə z-index tətbiq olunur
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg", // Popup-a ayrıca z-index ehtiyac qalmır
                confirmButton: confirmText === "Bəli" 
                    ? "bg-red-500 text-red-500 bg-opacity-10 hover:bg-red-600 hover:text-white py-1.5 px-5 rounded-lg" 
                    : baseClasses.confirmButton,
                cancelButton: cancelText === "Xeyr" 
                    ? "ml-2.5 bg-slate-500 text-slate-500 bg-opacity-10 hover:bg-opacity-25 py-1.5 px-5 rounded-lg" 
                    : baseClasses.cancelButton,
            },
            buttonsStyling: false, // SweetAlert-in öz düymə stillərini ləğv edir
        });
        return result.isConfirmed;
    };

    /**
     * Uğurlu əməliyyat xəbərdarlığı göstərir. Avtomatik olaraq bağlanır.
     * @param title - Bildirişin başlığı
     * @param text - Bildirişin mətni
     */
    const successAlert = (title: string, text: string): void => {
        Swal.fire({
            title,
            text,
            icon: "success",
            timer: 3000, // 3 saniyədən sonra bağlanır
            showConfirmButton: false, // Təsdiq düyməsini göstərmir
            customClass: {
                container: sweetAlertContainerZIndex, // Əsas konteynerə z-index tətbiq olunur
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg",
                // confirmButton: baseClasses.confirmButton, // Düymə yoxdur
            },
        });
    };

    /**
     * Xəta xəbərdarlığı göstərir. İstifadəçi klik edənə qədər açıq qalır.
     * @param title - Bildirişin başlığı
     * @param text - Bildirişin mətni
     */
    const errorAlert = (title: string, text: string): void => {
        Swal.fire({
            title,
            text,
            icon: "error",
            showConfirmButton: false, // Təsdiq düyməsini göstərmir
            allowOutsideClick: true, // Popup-dan kənara kliklədikdə bağlanmasına icazə verir
            customClass: {
                container: sweetAlertContainerZIndex, // Əsas konteynerə z-index tətbiq olunur
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg",
                // confirmButton: baseClasses.confirmButton, // Düymə yoxdur
            },
        });
    };

    /**
     * Sadə təsdiq/məlumat xəbərdarlığı göstərir (düyməsiz).
     * @param title - Bildirişin başlığı
     * @param text - Bildirişin mətni
     */
    const showConfirmAlert = async (
        title: string,
        text: string,
    ): Promise<void> => {
        await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: false, // Ləğv düyməsini göstərmir
            showConfirmButton: false, // Təsdiq düyməsini göstərmir
            customClass: {
                container: sweetAlertContainerZIndex, // Əsas konteynerə z-index tətbiq olunur
                popup: "p-6 bg-white shadow-md rounded-lg",
                title: baseClasses.title,
            },
        });
    };

    return {
        confirmAlert,
        successAlert,
        errorAlert,
        showConfirmAlert,
    };
};

export default useSweetAlert;