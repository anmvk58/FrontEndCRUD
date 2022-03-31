$(function () {
    if (!isLogin()) {
        // redirect to login page
        window.location.replace("http://127.0.0.1:5501/html/page-login.html");
        return;
    }

    $("#sidebar").load("./common/side-bar.html");
});

function isLogin() {
    if (localStorage.getItem("ID")) {
        return true;
    }
    return false;
}
