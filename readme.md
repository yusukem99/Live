# Live
pure javascript WebRTC　Wrapper

# demo
https://yusukem99.github.io/Live/demo/

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
