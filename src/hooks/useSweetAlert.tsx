import Swal from "sweetalert2";
/**
 * SweetAlert ucun custom hook.
 */
export const useSweetAlert = () => {
    const baseClasses = {
        title: "text-lg font-semibold text-slate-800",
        content: "text-sm text-slate-600",
        confirmButton: "px-4 py-1 bg-blue500 text-white rounded-lg hover:bg-blue500/90",
        cancelButton: "px-4 py-1 ml-2 bg-slate-50 text-slate-800 rounded-lg border border-stroke hover:bg-slate-100",
    };
    const confirmAlert = async (
        title: string,
        text: string,
        confirmText: string = "Bəli",
        cancelText: string = "Xeyr"
    ) => {
        const result = await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            customClass: {
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg",
                confirmButton: confirmText === "Bəli" ? "bg-red-500 text-red-500 bg-opacity-10 hover:bg-red-600 hover:text-white py-1.5 px-5 rounded-lg" : baseClasses.confirmButton,
                cancelButton: cancelText === "Xeyr" ? "ml-2.5 bg-slate-500 text-slate-500 bg-opacity-10 hover:bg-opacity-25 py-1.5 px-5 rounded-lg" : baseClasses.cancelButton,
            },
            buttonsStyling: false,
        });
        return result.isConfirmed;
    };
    const successAlert = (title: string, text: string) => {
        Swal.fire({
            title,
            text,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            customClass: {
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg",
                confirmButton: baseClasses.confirmButton,
            },
        });
    };
    const errorAlert = (title: string, text: string) => {
        Swal.fire({
            title,
            text,
            icon: "error",
            showConfirmButton: false,
            allowOutsideClick: true,
            customClass: {
                title: baseClasses.title,
                popup: "p-6 bg-white shadow-md rounded-lg",
                confirmButton: baseClasses.confirmButton,
            },
        });
    };
    const showConfirmAlert = async (
        title: string,
        text: string,
    ) => {
        return await Swal.fire({
            title,
            text,
            icon: "warning",
            showCancelButton: false,
            showConfirmButton: false,
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