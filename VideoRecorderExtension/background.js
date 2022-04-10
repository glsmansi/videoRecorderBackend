let stream = null,
	audio = null,
	mixedStream = null,
	chunks = [], 
	recorder = null,
	downloadButton = null,
	recordedVideo = null,
	cookieValue=null,
	recordingStatus=null,
	isUploading=null,
	isUploaded=null,
	links=null;
	user=null,
	blob=null,
	tabid=null,
	percent_completed=null,
	permission=null;
	var seconds = 00; 
	var mins = 00; 
	var hours=00;
	var tabid=null;
	var Interval
	chrome.runtime.onMessage.addListener(
		async function(request, sender, sendResponse) {
				if (request.greeting === "start"){
					console.log(request);
						tabid=request.tabid;
						permission=true;
						console.log("start with audio");
						startRecording();
						 sendResponse({message:"start"})
				  }
				  if (request.greeting === "stop"){
					  console.log("stop");
					  recordingStatus=false;
					if(request.stop){
						console.log("stopped");
						stopRecording();
						sendResponse({message:"stop"})
					}
					else{
						console.log("canceled");
					}
				  }
				  if(request.greeting=="cookieValue"){
					cookieValue=request.cookieValue
					user=request.data
				  }
				  if(request.greeting=="logout"){
					  console.log("logout");
					cookieValue=null;
					user=null;
					awsLink=null;
					blob=null;
				}
				  if(request.greeting=="aws"){
					  isUploading=true;
					uploadToAws();
				  }
			return true
	});
	function checkUser(){
		console.log("check user");
		chrome.runtime.sendMessage({greeting: "checkUser",cookieValue,user,recordingStatus,blob,downloadButton,hours,mins,seconds,tabid,isUploading,isUploaded,links,percent_completed,permission}, function(response) {
			console.log(response);
		  })
	}
	async function setupStream (audios) {
		try {
			stream = await navigator.mediaDevices.getDisplayMedia({
				video:true,
			});
			if(audios){
				audio=await navigator.mediaDevices.getUserMedia({
					audio:true
				})
			}
        } catch (err) {	
			if(tabid){
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					chrome.tabs.sendMessage(tabid, {greeting: "stopss"}, function(response) {
						tabid=null;
					  console.log(response.farewell);
					});
				  });
				}else{
					chrome.runtime.sendMessage({greeting: "cancel"}, function(response) {
						console.log(response);
					})
				}
			  permission=false;
		console.error(err)
	}
}
async function startRecording () {
	var audios=true;
	await setupStream(audios);
	permission=false;
	if (stream && audio) {
		console.log("recording");
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
		console.log('Recording started');
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			tabid=tabs[0].id;
			chrome.tabs.sendMessage(tabs[0].id, {greeting: "rec"}, function(response) {
			  console.log(response.farewell);
			});
		  });
		  recordingStatus=true;
		  isUploaded=false;
		  blob=null;
		  links=null;
		chrome.runtime.sendMessage({greeting: "rec"}, function(response) {
			console.log(response);
		  })
		  clearInterval(Interval);
		  Interval = setInterval(startTimer, 1000);
		  streamListener();
	} else {
		console.warn('No stream available.');
	}
}
async function startRecordingMute () {
	permission=true;
	await setupStream();
	permission=false;
	if (stream) {
		mixedStream = new MediaStream([...stream.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);
		console.log('Recording started');
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			tabid=tabs[0].id;
			chrome.tabs.sendMessage(tabs[0].id, {greeting: "rec"}, function(response) {
			  console.log(response.farewell);
			});
		  });
		  recordingStatus=true;
		  isUploaded=false;
		  blob=null;
		chrome.runtime.sendMessage({greeting: "rec"}, function(response) {
			console.log(response);
		  })
		  clearInterval(Interval);
		  Interval = setInterval(startTimer, 1000);
		  streamListener();
	} else {
		console.warn('No stream available.');
	}
}
function stopRecording () {
	recorder.stop();
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

		chrome.tabs.sendMessage(tabid, {greeting: "stopss"}, function(response) {
		  console.log(response.farewell);
		});
	  });
	chrome.runtime.sendMessage({greeting: "rec-stop"}, function(response) {
		console.log(response);
	  })
	  clearInterval(Interval);
	  seconds=0,mins=0;hours=0;
	//  tabid=null;
}
function handleDataAvailable (e) {
	chunks.push(e.data);
}

function handleStop (e) {
	console.log(hours,":",mins,":",seconds);
	blob = new Blob(chunks, { 'type' : 'video/mp4' });
	chunks = [];
	console.log(blob);
	downloadButton = URL.createObjectURL(blob);
  
	chrome.runtime.sendMessage({greeting: "save",downloadButton,cookieValue}, function(response) {
		console.log(response);
	  })

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');
}
function uploadToAws(){
	let data = new FormData();
data.append('video', blob, 'video.mp4');

let request = new XMLHttpRequest();
request.open('POST', 'https://videorecorderbackend.herokuapp.com/uploadVideo'); 
request.setRequestHeader("auth", cookieValue);
//request.setRequestHeader('Content-Type', 'multipart/form-data');

// upload progress event
request.upload.addEventListener('progress', function(e) {
	// upload progress as percentage
	percent_completed= (e.loaded / e.total)*100;
	chrome.runtime.sendMessage({greeting: "uploadPercentage",percent_completed}, function(response) {
		console.log(response);
	  })
	console.log(percent_completed);

});
// request finished event
request.addEventListener('load', function(e) {
	// HTTP status message (200, 404 etc)
	isUploading=false;
	isUploaded=true;
	console.log(request.status);
	// request.response holds response from the server
	links = JSON.parse(request.response);
	console.log(links.watchableLink);
	 //request.response.substring(1,request.response.length-1)
	chrome.runtime.sendMessage({greeting: "link",links}, function(response) {
		console.log(response);
	  })
});
// send POST request to server
request.send(data);
}
function startTimer () {
    seconds++;  
    if (seconds > 59) {
      console.log("seconds");
      seconds = 0;
	  mins++
    }
	if(mins>59){
		mins=0;
		hours++;
	}
  
  }
  function streamListener() {
	const readyListener = () => {
	  if (!stream.active) {
		  if(recordingStatus){
			  recordingStatus=false;
			  return stopRecording()
		  }else{
			  return
		  }
	  }
	  return setTimeout(readyListener, 250);
	};
	readyListener();
  }