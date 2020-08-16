import Live from '../node_modules/live/Live.js'

let socket = io.connect(`https://www.webproj.jp:31116/`, {});
socket.on('connect', (evt) => {
    console.log('connect');
    socket.emit('enter', {});
    socket.on('message', (message) => {
        console.log(`socket.on message.type: ${message.type}`)
        let fromId = message.from;
    
        if (message.type === 'offer') {
            let offer = new RTCSessionDescription(message);
            live.setOffer(fromId, {}, offer);
        }
        else if (message.type === 'answer') {
            let answer = new RTCSessionDescription(message);
            live.setAnswer(fromId, answer);
        }
        else if (message.type === 'candidate') {
            console.log('Received ICE candidate ...');
            let candidate = new RTCIceCandidate(message.ice);
            live.addIceCandidate(fromId, candidate);
        }
        else if (message.type === 'call me') {
            live.makeOffer(fromId, {});

        }
        else if (message.type === 'bye') {
            if (live.isConnectedWith(fromId)) {
                live.stopConnection(fromId);
            }
        }
    });
    socket.on('entered', (message) => {
        if( message.isSuccess ){
            socket.emit('message', {
                type: 'call me'
            });
        }else{
            console.log('you are not member of: ' + message.ch_id);
        }
    });
});

let channelOption = {
    labels: [
        "chat",
        "pose"
    ],
    callback_channel: {
        onmessage : (id, account, label, message) => {
            console.log(message)
        }
    }
}

var array = new Uint32Array(2);
let localid = window.crypto.getRandomValues(array)[0].toString();
let remoteid = window.crypto.getRandomValues(array)[1].toString();

const remoteaccount = {}
let live = new Live( emitTo, onicedisconnect, null, channelOption );

let button = document.getElementById('debug')
let makeoffer = document.getElementById('makeoffer')
let video = document.getElementById('myvideo');
let setdata = document.getElementById('setdata');
let setoffer = document.getElementById('setoffer');
let setanswer = document.getElementById('setanswer');

button.onclick = () => {
    console.log(live)
}

makeoffer.onclick = () => {
    live.makeOffer('remote', remoteaccount)
}

setoffer.onclick = () => {
    live.setOffer('remote', {}, {
        type: 'offer',
        sdp: setdata.value
    })
}

setanswer.onclick = () => {
    live.setAnswer('remote', {
        type: 'answer',
        sdp: setdata.value
    })
}

function emitTo(id, msg) {
    msg.sendto = id;
    socket.emit('message', msg);
}
/*
function emitTo(id, msg) {
    console.log(id);
    console.log(msg);
    const div = document.createElement('div');
    const text = document.createElement('div');
    text.textContent = `${id} ${msg.type}`;
    div.appendChild(text);
    const textarea = document.createElement('textarea');
    switch (msg.type) {
        case 'offer':
            break;
        case 'answer':     
            break;
        case "candidate":
            if(!msg.ice){
                textarea.value = live.peerConnections.getConnection(id).peer.localDescription.sdp
            }
            break;
            
        default:
            break;
    }

    div.appendChild(textarea)
    document.body.appendChild(div)
}
*/
function onicedisconnect(){
    let video = document.getElementById('remote_video');
    video.srcObject = null;
}
