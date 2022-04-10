chrome.runtime.onMessage.addListener(
    async function(request, sender, sendResponse) {
        setTimeout(()=>{
            if(request.greeting==="audiosource"){
                var tabid=request.tabid
                console.log("AudioSource");
                navigator.mediaDevices.getUserMedia({
                     audio:true
                 }).then((res)=>{
                     console.log(res);
                     chrome.runtime.sendMessage({greeting: "start",tabid}, function(response) {
                         console.log(response);
                       })
                 })
                 sendResponse({message:"hai"})
            }
        },1)
        return true;
    });
