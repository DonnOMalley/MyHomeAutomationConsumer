var commandRoot = "http://www.omalleyland.com:8080?"
var SAAgent = null;
var SASocket = null;
var Queue = null;
var CHANNELID = 104;
var ProviderAppName = "MyHomeAutomationProvider";

function onerror(err) {
	console.log("err [" + err.name + "] msg[" + err.message + "]");
}

function sendCommand(cmd) {
	try {
		if (SASocket == null) {
			Queue = cmd;
			connect();
		}
		SASocket.setDataReceiveListener(onreceive);
		SASocket.sendData(CHANNELID, cmd);
		Queue = null;
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

var agentCallback = {
	onconnect : function(socket) {
		SASocket = socket;
		SASocket.setSocketStatusListener(function(reason){
			console.log("Service connection lost, Reason : [" + reason + "]");
			disconnect();
		});
		if(Queue != null) {
			sendCommand(Queue);
		}
	},
	onerror : onerror
};

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				alert("Not expected app!! : " + peerAgent.appName);
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	},
	onerror : onerror
}

function onsuccess(agents) {
	try {
		if (agents.length > 0) {
			SAAgent = agents[0];
			
			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents();
		} else {
			alert("Not found SAAgent!!");
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function connect() {
	if (SASocket) {
        return false;
    }
	try {
		webapis.sa.requestSAAgent(onsuccess, onerror);
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function disconnect() {
	try {
		if (SASocket != null) {
			SASocket.close();
			SASocket = null;
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function onreceive(channelId, data) {
}

function turnOn(code) {
	var cmd = commandRoot + code  + "1"
	sendCommand(cmd);
}

function turnOff(code) {
	var cmd = commandRoot + code  + "0"
	sendCommand(cmd);
}

window.onload = function () {
    // add eventListener for tizenhwkey
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
            tizen.application.getCurrentApplication().exit();
    });
    
    connect();
};
