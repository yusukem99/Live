# Live
pure javascript WebRTC　Wrapper

# インストール

# 使い方
```js
const live = new Live(this.emitTo, this.onicedisconnect, this.onaddstream, channelOption)

let channelOption = {
    labels: [
        "chat"
    ],
    callback_channel: {
        onmessage : (id, account, label, message)=>{
        }
    }
}

emitTo(id, msg) {
    msg.sendto = id;
    this.socket.emit('message', msg);
}
```
