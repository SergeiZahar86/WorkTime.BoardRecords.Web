document.getElementById("login").addEventListener("click", login);
document.getElementById("callApi").addEventListener("click", callApi);
document.getElementById("refresh").addEventListener("click", refresh);
document.getElementById("logout").addEventListener("click", logout);
document.getElementById("registration").addEventListener("click", setEmpl);
document.getElementById("startTime").addEventListener("click", startTime);
document.getElementById("endTime").addEventListener("click", endTime);
document.getElementById("getList").addEventListener("click", getWorkedTime);


var settings = {
	userStore: new Oidc.WebStorageStateStore({store: window.localStorage}),
	authority: "https://localhost:10001",
	client_id: "client_id_js",
	response_type: "code",
	scope: "openid profile SwaggerAPI",
	//scope: "openid profile OrdersAPI",


	// перенаправление после залогирования
	redirect_uri: "https://localhost:9001/callback.html",
	silent_redirect_uri: "https://localhost:9001/refresh.html",
	post_logout_redirect_uri: "https://localhost:9001/index.html"
}

var manager = new Oidc.UserManager(settings);

let token;

// обращене к хранимому объекту (например в window.localStorage ) после входа
manager.getUser().then(function (user) {
	if (user) {
		token = user.access_token;
		print("Log in success", user);
		console.log("id user:", user.profile.sub)
		console.log("access_token :", token)
		if (user.profile.roles === 'Administrator') {
			$('.registration').toggleClass('lock');
		}
		if (user.profile.roles === 'Employee') {
			$('.worktimetable').toggleClass('lock');
			getWorkedTime();
		}
	} else {
		print("User not logged in");
		$('.worktimetable').addClass('lock');
		$('.registration').addClass('lock');
	}
});

function login() {
	manager.signinRedirect();
}

manager.events.addUserSignedOut(function () {
	print("User sing out. Good bye.");
	$('.worktimetable').addClass('lock');
	$('.registration').addClass('lock');
});

function logout() {
	manager.signoutRedirect();
}

function refresh() {
	manager.signinSilent()
		.then(function (user) {
			print("Token refreshed", user);
		}).catch(function (error) {
		print("Something went wrong");
	});
}

function callApi() {
	manager.getUser().then(function (user) {
		if (user === null) {
			print("Unauthorized");
		}

		const xhr = new XMLHttpRequest();
		//xhr.open("GET", "https://localhost:5001/site/secret");
		xhr.open("GET", "https://localhost:7001/Api/GetAll");
		xhr.onload = function () {
			if (xhr.status === 200) {
				print(xhr.responseText, xhr.response);
			} else {
				print("Something went wrong", xhr);
			}
		}

		xhr.setRequestHeader("Authorization", "Bearer " + user.access_token);
		xhr.send();

	}).catch(function (error) {
		print(error);
	});
}


function print(message, data) {
	if (message) {
		document.getElementById("message").innerText = message;
	} else {
		document.getElementById("message").innerText = "";
	}
	if (data && typeof data === "object") {
		document.getElementById("data").innerText = JSON.stringify(data, null, 5);
	} else {
		document.getElementById("data").innerText = "";
	}
}

//////////////////////////// добавление работника /////////////////////////////////////////////
function setEmpl() {
	console.log("вызов функции setEmpl")
	console.log("токен : ", `Bearer ${token}`)

	manager.getUser().then(function (user) {
		if (user === null) {
			print("Unauthorized");
		}

		axios.post('https://localhost:7001/Api/SetEmpl',
			{
				Name: document.getElementById('nameUser').value,
				Password: document.getElementById('passwordUser').value
			},
			{
				headers: {'Authorization': `Bearer ${token}`}
			})
			.then((response) => {
				console.log("ответ из setEmpl: ", response.data);
				document.getElementById('registration-status').innerText = response.data;
				document.getElementById('nameUser').value = '';
				document.getElementById('passwordUser').value = '';
			})
			.catch((error) => {
				console.error("ошибка в setEmpl ", error);
			});

	}).catch(function (error) {
		print(error);
	});
}

/////////////////////// добавление записи в таблицу отработанного времени /////////////////////////////
function startTime() {
	const date = new Date();

	console.log("вызов функции startTime")
	console.log("токен : ", `Bearer ${token}`)
	console.log("текущее время ", date.toLocaleTimeString('ru'));
	manager.getUser().then(function (user) {
		if (user === null) {
			print("Unauthorized");
		}

		axios.post('https://localhost:7001/Api/SetStartTime',
			{
				IdUser: user.profile.sub,
				StartTime: date
			},
			{
				headers: {'Authorization': `Bearer ${token}`}
			})
			.then((response) => {
				console.log("ответ из startTime: ", response);
				document.getElementById('worktimetable-status').innerText = response.data;
				getWorkedTime();
			})
			.catch((error) => {
				console.error("ошибка в startTime ", error);
				document.getElementById('worktimetable-status').innerText = "есть незакрытые записи";
			});

	}).catch(function (error) {
		print(error);
	});

}

/////////////////////// завершение записи в таблице отработанного времени /////////////////////////////
function endTime() {
	const date = new Date();

	console.log("вызов функции endTime")
	console.log("токен : ", `Bearer ${token}`)
	console.log("текущее время ", date.toLocaleTimeString('ru'));
	manager.getUser().then(function (user) {
		if (user === null) {
			print("Unauthorized");
		}

		axios.post('https://localhost:7001/Api/SetEndTime',
			{
				IdUser: user.profile.sub,
				EndTime: date
			},
			{
				headers: {'Authorization': `Bearer ${token}`}
			})
			.then((response) => {
				console.log("ответ из endTime: ", response);
				document.getElementById('worktimetable-status').innerText = response.data;
				getWorkedTime();
			})
			.catch((error) => {
				console.error("ошибка в endTime ", error);
				document.getElementById('worktimetable-status').innerText = "Нет открытых записей";
			});

	}).catch(function (error) {
		print(error);
	});
}
//////////////////////////// получение данных для таблицы  //////////////////////////////////////////////
function getWorkedTime() {

	console.log("вызов функции getWorkedTime")
	console.log("токен : ", `Bearer ${token}`)
	manager.getUser().then(function (user) {
		if (user === null) {
			print("Unauthorized");
		}
		console.log("user.profile.sub ", user.profile.sub)
		axios.post('https://localhost:7001/Api/GetListTime',
			{
				UserId: user.profile.sub
			},
			{
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			})
			.then((response) => {
				console.log("ответ из getWorkedTime: ", response);
				fillTable(response);
			})
			.catch((error) => {
				console.error("ошибка в getWorkedTime ", error.response.data);
			});

	}).catch(function (error) {
		print(error);
	});
}
////////////////////////// заполнение таблицы //////////////////////////////////////////////////////
function fillTable(Times) {
	var tbodyMain = $("#table-main");
	tbodyMain.empty();
	if (Times.data.length > 0) {
		$.each(Times.data, function (i, dat) {
			var tr = $('<tr>').append(
				$('<td>').text(dat.id),
				$('<td>').text(dat.user.userName),
				$('<td>').text(dat.startTime),
				$('<td>').text(dat.endTime),
			);
			tbodyMain.append(tr);
		});
	}
}
