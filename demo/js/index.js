import Live from '../node_modules/live/Live.js'

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
    console.log(id);
    console.log(msg);
    const div = document.createElement('div');
    const text = document.createElement('div');
    const textarea = document.createElement('textarea');
    div.appendChild(text);
    div.appendChild(textarea)
    text.textContent = `message send to ${id} ${msg.type}`;
    switch (msg.type) {
        case 'offer':
            break;
        case 'answer':     
            break;
        case "candidate":
            if(!msg.ice){
                textarea.value = live.peerConnections.getConnection(id).peer.localDescription.sdp
                document.body.appendChild(div)
            }
            else{
                console.log(msg)
            }
            break;
        default:
            break;
    }
}

function onicedisconnect(){
    let video = document.getElementById('remote_video');
    video.srcObject = null;
}
