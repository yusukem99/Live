import ConList from './ConList.js';

class Live{
    constructor( emitTo, onicedisconnect, onAddStream, channelOption ){
        this.emitTo = emitTo;
        this.onicedisconnect = onicedisconnect;
        this.onAddStream = onAddStream;
        this.channelOption = channelOption;
        this.localStream = new MediaStream();
        this.peerConnections = new ConList( this.emitTo, this.onicedisconnect, this.onAddStream, this.channelOption );
    }
    playVideo(element) {
        if ('srcObject' in element) {
            element.srcObject = this.localStream;
        }
        else {
            element.src = window.URL.createObjectURL(this.localStream);
        }
        element.play();
        element.volume = 0;
    }
    pauseVideo(element) {
        element.pause();
        if ('srcObject' in element) {
            element.srcObject = null;
        }
        else {
            if (element.src && (element.src !== '') ) {
            window.URL.revokeObjectURL(element.src);
            }
            element.src = '';
        }
    }
    async makeOffer(fromId, account){
        if (this.isConnectedWith(fromId)) {
            console.log('already connected stop connection', fromId);
            this.stopConnection(fromId);
        }
        let localSdp = await this.peerConnections.makeOffer( fromId, account, this.localStream );
        this.sendSdp( fromId, localSdp );
    };
    async setOffer(fromId, account, offer){
        if (this.isConnectedWith(fromId)) {
            console.log('already connected stop connection', fromId);
            this.stopConnection(fromId);
        }
        this.peerConnections.setOffer( fromId, account, offer, this.localStream );
        let sdp = await this.peerConnections.makeAnswer( fromId );
        this.sendSdp( fromId, sdp );
    };
    setAnswer(fromId, answer) {
        this.peerConnections.setAnswer( fromId, answer );
    }
    addIceCandidate(fromId, candidate){
        this.peerConnections.addIceCandidate( fromId, candidate );
    }
    isConnectedWith(fromId) {
        return this.peerConnections.isConnectedWith( fromId );
    }
    stopConnection(fromId){
        this.peerConnections.stopConnection( fromId );
    };
    stopAllConnection() {
        this.peerConnections.stopAllConnection();
    }
    async reconnectAll(){
        for( let i in this.peerConnections.connections){
            let fromId = this.peerConnections.connections[i].id;
            let localSdp = await this.peerConnections.makeOffer( fromId, this.localStream );
            this.sendSdp( fromId, localSdp );
        }
    }
    getCount(){
        return this.peerConnections.getConnectionCount();
    }
    sendSdp(id, sessionDescription) {
        let message = { type: sessionDescription.type, sdp: sessionDescription.sdp };
        this.emitTo(id, message);
    }
    sendMessage( channel, message ){
        for(let i in this.peerConnections.connections ){
            const channels = this.peerConnections.connections[i].channels;
            if( channels && channels[channel] && channels[channel].readyState == "open" ){
                channels[channel].send( message );
            }else{
                console.log( `readystate is ${channels[channel].readyState}`)
            }
        }
    }
    setLocalStream( stream ){
        this.localStream = stream;
    }
}
export default Live;