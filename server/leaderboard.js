var io,
	user_list
;

function getLeaderboard() {
	var id, leaderboard = [];

	for (id in user_list) {
		leaderboard.push({
			name: user_list[id].first_name,
			score: user_list[id].score,
			timestamp: user_list[id].timestamp
		});
	}

	// sort the leadboard, high scores first, newest logins first
	leaderboard.sort(function(u1,u2){
		if (u1.score > u2.score) return -1;
		else if (u1.score < u2.score) return 1;
		else if (u1.timestamp > u2.timestamp) return -1;
		else if (u1.timestamp < u2.timestamp) return 1;
		else return 0;
	});

	return leaderboard.slice(0,10);
}

function update(userID,score) {
	if (user_list[userID]) {
		user_list[userID].score = score;
		io.of("/leaderboard").emit("update",getLeaderboard());
	}
}

function connection(socket) {

	function user(userID) {
		if (user_list[userID] && !user_list[userID].connected) {
			user_id = userID;
			user_list[user_id].connected = true;
			io.of("/leaderboard").emit("update",getLeaderboard());
		}
		else {
			socket.emit("invalid_user");
			doDisconnect();
		}
	}

	function killSocket() {
		socket.removeListener("user",user);
		socket.removeListener("disconnect",disconnected);
	}

	function disconnected() {
		if (user_id && user_list[user_id]) {
			user_list[user_id].connected = false;
			if (socket) {
				killSocket();
				socket = null;
			}
		}
	}

	function doDisconnect() {
		if (socket) {
			killSocket();
			socket.disconnect();
			socket = null;
		}
	}

	var user_id;

	socket.on("user",user);
	socket.on("disconnect",disconnected);
}

function init(socketio,users) {
	io = socketio;
	user_list = users;

	io.of("/leaderboard").on("connection",connection);
}

exports.init = init;
exports.update = update;
