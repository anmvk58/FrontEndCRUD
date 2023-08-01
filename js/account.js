$(function() {
    setupSearchEvent();
    setupFilter();
    buildAccountTable();
});

function buildAccountTable() {
    $('#datatables-basic tbody').empty();
    console.log("ok1")
    //Call API and put data into table
    getListAccounts();

    //function to fill nav-paging

    //function to fill select dropdown list
}

// paging
var currentPage = 1;
var size = 5;

// sorting
var sortField = "id";
var isAsc = true;

function getListAccounts() {
    var url = "http://localhost:8080/api/v1/accounts";

    //paging
    url += '?page=' + currentPage + '&size=' + size;

    //sorting
    url += "&sort=" + sortField + "," + (isAsc ? "asc" : "desc");

    //search typing
    var search = document.getElementById("search-content").value;
    if(search){
        url += "&search=" + search;
    }

    //filter param
    var role = document.getElementById("filter-role-select").value;
    if (role && role != "All Roles") {
        url += "&role=" + role;
    }

    var departmentName = $("#filter-department-select option:selected").text();
    if (departmentName && departmentName != "All Departments" && departmentName != "Select a department") {
        url += "&departmentName=" + departmentName;
    }

    console.log(url)

    $.ajax({
    url: url,
    type: 'GET',
    contentType: "application/json",
    dataType: 'json', // datatype return
    beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
    },
    success: function (data, textStatus, xhr) {
        // success
        data.content.forEach(function(item, index){
            $("#datatables-basic tbody").append(
                '<tr>' + 
                    '<td> ' +
                        '<label class="custom-control custom-checkbox">' +
                            '<input id="checkbox-' + index + '" type="checkbox" class="custom-control-input" >' +
                            '<span class="custom-control-label"></span>'+
                        '</label>' +
                    '</td>' +
                    '<td>' + item.username + '</td>' +
                    '<td>' + item.fullName + '</td>' +
                    '<td>' + item.role + '</td>' +
                    '<td>' + item.departmentName + '</td>' +
                    '<td class="table-action width-table-action">'+
                        '<a href="#" onclick="showUpdateAccountModal(' + item.id + ')"><i class="fa-solid fa-pencil"></i></a>'+
                        '<a href="#" data-toggle="modal" data-target="#delete-single-account" onclick="showDeleteSingleAccountModal(' + item.id + ', \'' + item.fullName + '\')"><i class="fa-regular fa-trash-can"></i></a>' +
                    '</td>'+
                '</tr>'
            )
        });
        fillAccountPaging(data.numberOfElements, data.totalPages, data.totalElements);
    },
    error(jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }
});
}

function pressSearchButton(){
    currentPage = 1;
    buildAccountTable();
}

//function to check all/ not check all
function onChangeAccountCheckboxAll() {
    var i = 0;
    while (true) {
        var checkboxItem = document.getElementById("checkbox-" + i);
        if (checkboxItem !== undefined && checkboxItem !== null) {
            checkboxItem.checked = document.getElementById("checkbox-all").checked
            i++;
        } else {
            break;
        }
    }
}

//function for Enter key on Search
function setupSearchEvent() {
    $("#search-content").on("keyup", function (event) {
        // enter key code = 13
        if (event.keyCode === 13) {
            currentPage = 1;
            buildAccountTable();
        }
    });
}

function setupFilter() {
    // setupRole();
    setupDepartmentFilter();
}

function setupDepartmentFilter() {
    // change selectboxes to selectize mode to be searchable
    // setup call API
    $("#filter-department-select").select2({
        placeholder: "Select a department",
        ajax: {
            url: "http://localhost:8080/api/v1/accounts/departments",
            dataType: 'json',
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
            },
            type: "GET",
            data: function (params) {
                var query = {
                    // paging
                    page: 1,
                    size: 10,
                    // sorting
                    sort: "id,asc",
                    // search
                    search: params.term
                }

                // Query parameters will be ?page=1&size=5&sort=id,asc&search=[term]
                return query;
            },
            processResults: function (data) {
                var defaultValue = {
                    "id": 0,
                    "name": "All Departments"
                };

                var departments = data.content;
                departments.splice(0, 0, defaultValue);

                return {
                    results: $.map(departments, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            }
        }
    });
}

function setupDepartmentSelectionInForm() {
    // change selectboxes to selectize mode to be searchable
    // setup call API
    $("#modal-department-select").select2({
        placeholder: "Select a department",
        ajax: {
            url: "http://localhost:8080/api/v1/accounts/departments",
            dataType: 'json',
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
            },
            data: function (params) {
                var query = {
                    // paging
                    page: 1,
                    size: 10,
                    // sorting
                    sort: "id,asc",
                    // search
                    search: params.term
                }

                // Query parameters will be ?page=1&size=5&sort=id,asc&search=[term]
                return query;
            },
            processResults: function (data) {
                return {
                    results: $.map(data.content, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            }
        }
    });
}


//Show modal to delete single
function showDeleteSingleAccountModal(accountId, fullName) {
    document.getElementById('delete-single-account-confirm-mess').innerHTML = 'This action can not be undone. Are you sure you want to delete <span style="color:red;">' + fullName + '</span>?';
    document.getElementById('delete-single-account-btn').onclick = function () { deleteSingleAccount(accountId) };
}

//Delete single accounts
function deleteSingleAccount(accountId) {
    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts/' + accountId,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
        },
        type: 'DELETE',
        success: function (result) {
            // error
            if (result == undefined || result == null) {
                alert("Error when loading data");
                return;
            }

            //hide modal
            $("#delete-single-account").modal('hide');

            // success
            pushNotification('Delete successfully', 'Xóa thành công !', 'success');

            // $('#deleteSingleAccountModal').modal('hide');
            buildAccountTable();
        }
    });
}

// API create new Accounts from parameter
function createAccountViaAPI(username, firstName, lastName, role, departmentId) {
    // call api create department
    var newAccount = {
        "username": username,
        "firstName": firstName,
        "lastName": lastName,
        "role": role,
        "departmentId": departmentId
    }

    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts',
        type: 'POST',
        data: JSON.stringify(newAccount), // add body
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
        },
        contentType: "application/json", // type of body (json, xml, text)
        success: function (data, textStatus, xhr) {
            // success
            $("#add-accounts-modal").modal('hide');
            pushNotification('Account created', 'Tạo mới account thành công!', 'success');
            buildAccountTable();
        },
        error(jqXHR, textStatus, errorThrown) {
            alert("Error when loading data");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

//Function to add an Account
function addAccount() {
    var username = document.getElementById("modal-username").value;
    var firstName = document.getElementById("modal-first-name").value;
    var lastName = document.getElementById("modal-last-name").value;
    var role = document.getElementById("modal-role-select").value;
    var departmentId = $('#modal-department-select option:selected').val();

    // validate
    // var validUsername = isValidUsername(username);
    // var validfirstname = isValidfirstname(firstName);
    // var validlastname = isValidlastname(lastName);
    // var validRole = isValidRole(role);
    // var validDepartment = isValidDepartment(departmentId);

    // format
    // if (!validUsername || !validfirstname || !validlastname || !validRole || !validDepartment) {
    //     return;
    // }

    // check username unique
    $.ajax({
        url: "http://localhost:8080/api/v1/accounts/username/exists/" + username,
        type: 'GET',
        contentType: "application/json",
        dataType: 'json', // datatype return
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
        },
        success: function (data, textStatus, xhr) {
            // success
            if (textStatus == "error") {
                // TODO
                pushNotification('Error', 'Lỗi: Có lỗi xảy ra!', 'danger');
                return;
            }
            
            if (data) {
            // show error message
                pushNotification('Account already exists', 'Lỗi: Username đã tồn tại!', 'warning');
                return;
            } else {
                createAccountViaAPI(username, firstName, lastName, role, departmentId);
            }
        },
        error(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}

// function to reset modal form
function resetAddAccountForm() {
    // set title
    document.getElementById("title-modal-form").innerHTML = "Add new Accounts";

    // Reset all input value
    document.getElementById("modal-username").value = "";
    document.getElementById("modal-first-name").value = "";
    document.getElementById("modal-last-name").value = "";
    document.getElementById("modal-role-select").value = "Choose a role";
    document.getElementById("modal-department-select").value = "Choose a department";

    // role
    // setupRoleSelectionInForm();

    // department
    setupDepartmentSelectionInForm();

    // Reset all error message
    // resetAccountModalErrMessage();
}

// open create modal 
function openAddAccountModal() {
    // document.getElementById("modal-role-select").selectedIndex = 1;
    // openAccountModal();
    resetAddAccountForm();
}

// save function for create and update
function saveAccount() {
    var id = document.getElementById("account-id").value;
    if (!id) {
        addAccount();
    } else {
        updateAccount();
    }
}


// paging
function fillAccountPaging(currentSize, totalPages, totalElements) {
    console.log(currentPage)
    // prev
    if (currentPage > 1) {
        $("#account-previousPage-btn").removeClass('disabled')
    } else {
        $("#account-previousPage-btn").addClass('disabled');
    }

    // next
    if (currentPage < totalPages) {
        $("#account-nextPage-btn").removeClass('disabled')
    } else {
        $("#account-nextPage-btn").addClass('disabled')
    }

    // text
    document.getElementById("account-page-info").innerHTML = 'Showing '+ ((currentPage-1)*size+1) + ' to ' + ((currentPage-1)*size + currentSize) + ' of ' + totalElements + ' entries' ;

    // number slot page
    var pageNumbString = '';
    for (let i = 1; i <= totalPages; i++) {
        if(i == currentPage){
            pageNumbString += '<li class="page-item active" onclick="changeAccountPage(' + i + ')"><a class="page-link" href="#">' + i + '</a></li>'    
        } else {
            pageNumbString += '<li class="page-item" onclick="changeAccountPage(' + i + ')"><a class="page-link" href="#">' + i + '</a></li>'
        }
    }
    document.getElementById("page-number").innerHTML = pageNumbString;
}

function prevAccountPage() {
    changeAccountPage(currentPage - 1);
}

function nextAccountPage() {
    changeAccountPage(currentPage + 1);
}

function changeAccountPage(page) {
    currentPage = page;
    buildAccountTable();
}

//update account
function showUpdateAccountModal(id){
    $('#add-accounts-modal').modal('show');
    prepareUpdateAccountForm(id);
}

function prepareUpdateAccountForm(id) {
    // set title
    document.getElementById("title-modal-form").innerHTML = "Update an Account";
    setupDepartmentSelectionInForm();

    // call api get details Account
    $.ajax({
        url: "http://localhost:8080/api/v1/accounts/" + id,
        type: 'GET',
        contentType: "application/json",
        dataType: 'json', // datatype return
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
        },
        success: function (data, textStatus, xhr) {
            console.log(data)
            // success
            // Map input value
            document.getElementById("account-id").value = data.id;
            document.getElementById("modal-username").value = data.username;
            document.getElementById("modal-first-name").value = data.firstName;
            document.getElementById("modal-last-name").value = data.lastName;
            document.getElementById("modal-role-select").value = data.role;
            $("#modal-department-select").append('<option selected="" value="'+ data.departmentId +'">'+ data.departmentName + '</option>')
            
        
        },
        error(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}


function updateAccount(){
    console.log('UPDATEEEEE')
    var id =  $("#account-id").val();
    var username =  $("#modal-username").val();
    var firstName =  $("#modal-first-name").val();
    var lastName =  $("#modal-last-name").val();
    var role =  $("#modal-role-select").val();
    var departmentId = $('#modal-department-select option:selected').val();

    var createAccountForm = {
        "username": username,
        "firstName": firstName,
        "lastName": lastName,
        "role": role,
        "departmentId": departmentId
    }

    $.ajax({
        url: 'http://localhost:8080/api/v1/accounts/'+ id,
        type: 'PUT',
        data: JSON.stringify(createAccountForm), // add body
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(localStorage.getItem("USERNAME") + ":" + localStorage.getItem("PASSWORD")));
        },
        contentType: "application/json", // type of body (json, xml, text)
        success: function (data, textStatus, xhr) {
            // success
            $("#add-accounts-modal").modal('hide');
            pushNotification('Account Updated !', 'Update account thành công!', 'success');
            buildAccountTable();
        },
        error(jqXHR, textStatus, errorThrown) {
            alert("Error when loading data");
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
        }
    });
}
