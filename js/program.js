$(function () {
    if (!isLogin()) {
        // redirect to login page
        window.location.replace("http://127.0.0.1:5501/html/page-login.html");
        return;
    }

    $("#sidebar").load("./common/side-bar.html");

    document.getElementById("name-admin").innerHTML = localStorage.getItem("USERNAME");
});

function isLogin() {
    if (localStorage.getItem("ID")) {
        return true;
    }
    return false;
}

function logOut(){
    localStorage.removeItem("ID");
    localStorage.removeItem("FULL_NAME");
    localStorage.removeItem("FIRST_NAME");
    localStorage.removeItem("LAST_NAME");
    localStorage.removeItem("ROLE");
    localStorage.removeItem("USERNAME");
    localStorage.removeItem("PASSWORD");

    // redirect to login page
    window.location.reload();
}
