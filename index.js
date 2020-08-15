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
        }
    }
}

let live = new Live( emitTo, onicedisconnect, null, channelOption );
let video = document.getElementById('myvideo');
video.addEventListener( "loadedmetadata", function (e) {
    var width = this.videoWidth,height = this.videoHeight;
    canvasElm.width = width;
    canvasElm.height = height;
}, false );
const canvasElm = document.createElement('canvas')
document.body.appendChild( canvasElm );

function emitTo(id, msg) {
    msg.sendto = id;
    socket.emit('message', msg);
}
function onicedisconnect(){
    let video = document.getElementById('remote_video');
    video.srcObject = null;
}