import Connection from './Connection.js';
class ConList {
    constructor( emitTo, callback_iceconnectionstatechange, onAddStream, channelOption, callback_onmessage ){
        this.connections = [];
        this.emitTo = emitTo;
        this.callback_iceconnectionstatechange = callback_iceconnectionstatechange;
        this.onAddStream = onAddStream;
        this.channelOption = channelOption;
        this.callback_onmessage = callback_onmessage;
    }
    isConnectedWith(id) {
        let connection = this.getConnection(id);
        if ( connection && connection.getPeer())  {
            return true;
        }
        else {
            return false;
        }
    }
    getConnection(id) {
        for( let i=0; i<this.connections.length; i++){
            if( this.connections[i].id == id ){
                return this.connections[i];
            }
        }
    }
    addConnection(id, account, localStream) {
        let onicecandidate = ( id, candidate ) => {
            this.sendIceCandidate( id, candidate);
        };
        let oniceconnectionstatechange = ( id, connectionstate ) => {
            //親のコールバック
            this.callback_iceconnectionstatechange( id, connectionstate )
            if( connectionstate == 'disconnected') this.stopConnection( id );
        };
        let connection = new Connection( id, account, onicecandidate, oniceconnectionstatechange, this.onAddStream, this.channelOption);
        connection.init( localStream );
        this.connections.push(connection);
        return connection;
    }
    deleteConnection(id) {
        for( let i=0; i<this.connections.length; i++){
            if( this.connections[i].id == id ){
                this.connections.splice(i, 1);
                return;
            }
        }
    }
    closeConnection(id) {
        let connection = this.getConnection(id);
        if(connection){
            connection.peer.close();   
        }
    }
    stopConnection(id) {
        this.closeConnection(id);
        this.deleteConnection(id);
    }
    stopAllConnection() {
        let count = this.connections.length;
        for( let i=0; i<count; i++){
            console.log('stopAllconnection', i)
            this.stopConnection( this.connections[0].id );
        }
    }
    sendIceCandidate(id, candidate) {
        let obj = { type: 'candidate', ice: candidate };
    
        if (this.isConnectedWith(id)) {
            this.emitTo(id, obj);
        }
        else {
            console.warn('connection NOT EXIST or ALREADY CLOSED. so skip candidate')
        }
    }
    async addIceCandidate(id, candidate) {
        if (! this.isConnectedWith(id)) {
            console.warn('NOT CONNEDTED or ALREADY CLOSED with id=' + id + ', so ignore candidate');
            return;
        }
    
        let peerConnection = this.getConnection(id).peer;
        if (peerConnection) {
            try{
                await peerConnection.addIceCandidate(candidate);
            }catch(e){
                console.log('###',e);
            }
        }
        else {
            console.error('PeerConnection not exist!');
            return;
        }
    }
    async setAnswer(id, sessionDescription) {
        let peerConnection = this.getConnection(id).peer;
        if (! peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }
        try{
            await peerConnection.setRemoteDescription(sessionDescription);
        }catch(e){
            console.log(e);
        }
    }
    async setOffer(id, account, sessionDescription, localStream) {
        try{
            let connection = this.addConnection(id, account, localStream);
            await connection.peer.setRemoteDescription(sessionDescription);
        }catch(e){
            console.log(e);
        }
    }
    async makeAnswer(id) {
        let peerConnection = this.getConnection(id).peer;
        if (! peerConnection) {
            console.error('peerConnection NOT exist!');
            return;
        }
        let sessionDescription = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(sessionDescription);
        return peerConnection.localDescription;
    }
    async makeOffer(id, account, localStream) {
        let connection = this.addConnection(id, account, localStream);
        try{
            let sdp = await connection.peer.createOffer();
            await connection.peer.setLocalDescription( sdp );
            console.log(`SET LOCALDISCRIPTION OK (MAKE OFFER TO ${id})`);
            return connection.peer.localDescription;
        }catch(e){
            console.log(e);
        }
    }
}
export default ConList;