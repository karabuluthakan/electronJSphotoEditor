const {app,BrowserWindow}=require('electron')
const path=require('path')
const url=require('url')

let win;

let create=()=>{
    win= new BrowserWindow({
        width:800,
        height:600,
        frame:false //menuyu yok etmek için kullanılıyor
    })

    win.loadUrl(url.format({
        pathname:path.join(__dirname,'index.html'),
        protocol:'file',
        slash:true
    }))

   // win.webContents.openDevTools();
}

app.on('ready',create);