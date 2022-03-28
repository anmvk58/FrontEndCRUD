function pushNotification(title, message, type) {
    toastr[type](message, title, {
        positionClass: "toast-bottom-right",
        closeButton: true,
        progressBar: true,
        newestOnTop: true,
        rtl: false,
        timeOut:2500
    });
}