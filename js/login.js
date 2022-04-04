var input = document.getElementById("password");

input.addEventListener("keyup",function(event){
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("btn-dang-nhap").click();
      }
})

function login(){
    //get username and password from input
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // to do validate
    if (!username || !password) {
        // show error message
        pushNotification('Login Fail', 'Vui lòng nhập Username/Password', 'warning');
        return;
    } else if (username.length < 4 || username.length > 50 || password.length < 4 || password.length > 50) {
        // show error message
        pushNotification('Login Fail', 'Username/Password không đúng định dạng', 'warning');
        return;
    }
    
    callLoginAPI(username, password);

}

function callLoginAPI(username, password) {

    $.ajax({
        url: 'http://localhost:8080/api/v1/auth/login',
        type: 'GET',
        contentType: "application/json",
        dataType: 'json', // datatype return
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        success: function (data, textStatus, xhr) {
            console.log(data);
            // save remember me
            // var isRememberMe = document.getElementById("rememberMe").checked;
            // storage.saveRememberMe(isRememberMe);

            // save data to storage
            // https://www.w3schools.com/html/html5_webstorage.asp
            localStorage.setItem("ID", data.id);
            localStorage.setItem("FULL_NAME", data.fullName);
            localStorage.setItem("FIRST_NAME", data.firstName);
            localStorage.setItem("LAST_NAME", data.lastName);
            localStorage.setItem("ROLE", data.role);
            localStorage.setItem("USERNAME", username);
            localStorage.setItem("PASSWORD", password);

            // redirect to home page
            window.location.replace("http://127.0.0.1:5501/html/index.html");
        },
        error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                pushNotification('Login Fail', 'Thông tin đăng nhập không hợp lệ', 'warning');
            } else {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        }
    });
}