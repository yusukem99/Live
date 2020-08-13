class Connection {
    constructor( id, account, callback_onicecandidate, onicedisconnect, callback_onaddStream, channelOption ){
        this.id = id;
        this.account = account;
        this.stream;
        this.channelOption = channelOption;
        this.channels = [];
        this.peer = new RTCPeerConnection({
            "iceServers":[
                {"urls": "stun:stun.l.google.com:19302"},
                {"urls": "stun:stun1.l.google.com:19302"},
                {"urls": "stun:stun2.l.google.com:19302"}
            ]
        });
        this.callback_onaddStream = callback_onaddStream;
        this.callback_onicecandidate = callback_onicecandidate;

        this.callback_channel_onmessage = this.channelOption.callback_channel.onmessage;
        this.onicedisconnect = onicedisconnect;
    }
    init( localStream ){
        //console.log('---Connection init id: ' + this.id);
        for( let i in this.channelOption.labels ){
            let label = this.channelOption.labels[i];
            this.channels[label] = this.peer.createDataChannel(label);
            this.channels[label].onopen = (event) => {
                //this.channels[label].send('Hi you! I\'m ' + this.id);
            }
            this.channels[label].onmessage = (event) => {
                this.callback_channel_onmessage(this.id, this.account, label, event.data);
            }

            this.peer.ondatachannel = (event) => {
                let channel = event.channel;
                let label = channel.label;
                this.channels[label] = channel;
                channel.onopen = (event) => {
                }
                channel.onmessage = (event) => {
                    this.callback_channel_onmessage(this.id, this.account, label, event.data);
                }
            }
        }
        this.peer.ontrack = async (event) => {
            console.log('---ontrack', event);
            this.callback_onaddStream( this.id, event.streams[0] );
        };
        this.peer.onicecandidate = (evt) => {
            if (evt.candidate) {
                //console.log(evt.candidate);
                this.callback_onicecandidate( this.id, evt.candidate );
            } else {
                console.log('empty ice event');
            }
        };
        this.peer.oniceconnectionstatechange = () => {
            console.log('== ice connection status=' + this.peer.iceConnectionState);
            if (this.peer.iceConnectionState === 'disconnected') {
                this.onicedisconnect( this.id);
            }
        };
        this.peer.onremovestream = (event) => {
            console.log('-- peer.onremovestream()');
        };

        if (localStream) {
            console.log('Adding local stream...');
            for (const track of localStream.getTracks()) {
                this.peer.addTrack(track, localStream);
            }
        }
        else {
            console.warn('no local stream, but continue.');
        }
    }
    setPeer( peer ){
        this.peer = peer;
    }
    getPeer(){
        return this.peer;
    }
}
export default Connection;