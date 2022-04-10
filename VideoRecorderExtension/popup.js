var bgpage = chrome.extension.getBackgroundPage();
var Interval;
var seconds=0,mins=0,hours=0;
var tabid;
var url=null;
window.addEventListener('load', () => {
	signUpBtn =document.querySelector(".sign-up");
	homeBtn=document.querySelector(".home");
	awsBtn=document.querySelector(".aws");
	funcDiv=document.getElementById("func-div");
	link=document.getElementById("link")
	downBtn=document.getElementById('download-videos')
	load();
//	let value=localStorage.getItem("user")
//	if(value){
//		document.getElementById('user').innerHTML="Hey "+value
//		document.getElementById('user').hidden=false
//		logoutBtn.hidden=false
//		signUpBtn.hidden=true
//		funcDiv.hidden=false;
//	}
	startButton = document.querySelector('.start-recording');
	stopButton = document.querySelector('.stop-recording');
	downloadButton = document.querySelector('.download-video');
	recordedVideo = document.querySelector('.recorded-video');
	let linkDiv=document.getElementById("link-div")
	function load(){
		console.log("function called");
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {greeting: "check-tab"}, function(response) {
			  if(response.url){
				url=response.url;		  
			  }
			});
		  });
		bgpage.checkUser();
	}
	  
	signUpBtn.addEventListener('click',()=>{
		chrome.tabs.create({ url: "https://videorecorderbackend.herokuapp.com/login" });
	})
	homeBtn.addEventListener('click',()=>{
		chrome.tabs.create({ url: "https://videorecorderbackend.herokuapp.com/home" });
//detele token from storage and change status
	})
	startButton.addEventListener('click',()=>{
		linkDiv.hidden=true;
		document.getElementById('aws-text').hidden=true;
		var mute=document.getElementById('mute').checked
		console.log(mute);
		if(mute){
			bgpage.startRecordingMute();
			startButton.disabled=true;
			document.querySelector(".mute-checkBox").hidden=true;
		}else{
			if(url){
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
					tabid=tabs[0].id;
					chrome.tabs.sendMessage(tabs[0].id, {greeting: "start-content",tabid}, function(response) {
					  console.log(response.farewell);
					});
				  });
				  startButton.disabled=true;
				  document.querySelector(".mute-checkBox").hidden=true;
			}else{
				chrome.tabs.create({ url: "https://videorecorderbackend.herokuapp.com/home" });
			}
		}
	}
	)	
	stopButton.addEventListener('click',()=>{
		if(mute){
			chrome.runtime.sendMessage({greeting: "stop",stop:true}, function(response) {
				console.log(response);
			  })
		}else{
			console.log(tabid);
				chrome.runtime.sendMessage(tabid, {greeting: "stop",stop:true}, function(response) {
				  console.log(response.farewell);
				});
		}
	});
	awsBtn.addEventListener('click',()=>{
		//let cookieValue=localStorage.getItem('cookie')
		document.getElementById('save-rec').hidden=true;
		document.getElementById('stop-rec').hidden=true;
		document.getElementById('aws-text').innerHTML="Uploading";
		document.getElementById('aws-text').hidden=false
		chrome.runtime.sendMessage({greeting: "aws"}, function(response) {
			console.log(response);
		  })
	})
	downloadButton.addEventListener('click',()=>{
		document.getElementById("timer").hidden=true;
		document.getElementById("stop-rec").hidden=true;
		document.getElementById('aws-text').hidden=true;
		document.getElementById("save-rec").hidden=false;
	})
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			if(request.greeting=="cancel"){
					//console.log("here");
					startButton.disabled=false;
					document.querySelector(".mute-checkBox").hidden=false;
			}
		  if (request.greeting === "save"){
			  console.log(request);
			  downloadButton.href=request.downloadButton
			  downloadButton.download = 'video.mp4';
			  if(request.cookieValue){
				awsBtn.disabled=false;
				downloadButton.disabled = false;
				downloadButton.classList.remove("disabled")
			  }else{
				document.getElementById("sign-in-alert").hidden=false;
			  }
			sendResponse({farewell: "goodbye"});
		  }
			if(request.greeting==="link"){
				document.querySelector(".mute-checkBox").hidden=false;
				link.innerText=request.links.watchableLink
				link.href=request.links.watchableLink
				var watchableLink=request.links.watchableLink;
				link.addEventListener('click',()=>{
					console.log("clicked");
					chrome.tabs.create({ url:'https://'+watchableLink });
				})
				linkDiv.hidden=false;
				awsBtn.disabled=true;
				console.log("link working");
				document.getElementById('link-permission').addEventListener('click',()=>{
					chrome.tabs.create({ url:'https://'+watchableLink });
				})
				document.getElementById("timer").hidden=true;
				document.getElementById("stop-rec").hidden=true;
				document.getElementById("save-rec").hidden=true;
				document.getElementById('aws-text').innerHTML="Uploaded to AWS";
				document.getElementById('aws-text').hidden=false
				document.getElementById('progress-bar').hidden=false;
			}
			if(request.greeting==="uploadPercentage"){
				console.log(request.percent_completed);
				var percentage=Math.round(request.percent_completed)
				document.getElementById('progress-bar').hidden=false;
				document.getElementById('progress').style.width=percentage+"%"
				document.getElementById('progress').innerHTML=percentage+"% completed"
			}
	//		if(request.greeting=="cookieValue"){
	//			console.log(request);
	//			var email = request.data.email;
	//			var name = email.substring(0, email. lastIndexOf("@"));
	//			localStorage.setItem('user',name)
	//			localStorage.setItem('cookie',request.cookieValue)
	//			value=localStorage.getItem('user')
	//			document.getElementById('user').innerHTML="Hey "+value
	//			document.getElementById('user').hidden=false
	//			logoutBtn.hidden=false
	//			signUpBtn.hidden=true
	//			funcDiv.hidden=false;
	//			document.getElementById('login-success').hidden=false;
//
//				setTimeout(()=>{
///					document.getElementById('login-success').hidden=true;
	//			},3000)
	//		}
			if(request.greeting=="rec"){
				clearInterval(Interval);
				Interval=setInterval(startTimer,1000);
				startButton.disabled=true;
				stopButton.disabled=false;
				awsBtn.disabled=true;
				document.querySelector(".mute-checkBox").hidden=true;
				document.getElementById('last-recordings').hidden=true;
				downloadButton.hidden=false;
				document.getElementById("timer").hidden=false;
				document.getElementById('aws-text').hidden=true;
				document.getElementById("save-rec").hidden=true;
				document.getElementById("stop-rec").hidden=true;
			}
			if(request.greeting=="rec-stop"){
				clearInterval(Interval);
				seconds=0,mins=0,hours=0;
				startButton.disabled=false;
				stopButton.disabled=true;
				document.querySelector(".mute-checkBox").hidden=false;
				document.getElementById("timer").hidden=true;
				document.getElementById('aws-text').hidden=true;
				document.getElementById("save-rec").hidden=true;
				document.getElementById("stop-rec").hidden=false;
			}
			if(request.greeting=="checkUser"){
				console.log(request);
				if(request.permission){
					startButton.disabled=true;
					document.querySelector(".mute-checkBox").hidden=true;
				}
				if(request.recordingStatus){
					//document.getElementById('last-recordings').hidden=true;
					document.querySelector(".mute-checkBox").hidden=true
					//document.getElementById('mute').hidden=true;
					tabid=request.tabid;
					startButton.disabled=true;
					stopButton.disabled=false;	
					seconds=request.seconds;
					mins=request.mins;
					hours=request.hours;
					startTimer();
					clearInterval(Interval);
					Interval=setInterval(startTimer,1000);
					document.getElementById("timer").hidden=false;
				}
				else if(!request.permission){
					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						tabid=tabs[0].id;
						chrome.tabs.sendMessage(tabs[0].id, {greeting: "stopss",tabid}, function(response) {
						  console.log(response.farewell);
						});
					  });
				}
				if(request.cookieValue){
					console.log(request);
					var email = request.user.email;
					var name = email.substring(0, email. lastIndexOf("@"));
					document.getElementById('user').innerHTML="Hey "+name
					document.getElementById('user').hidden=false
					homeBtn.hidden=false
					signUpBtn.hidden=true
					funcDiv.hidden=false;
					if(request.blob){
						awsBtn.disabled=false;
					}
					if(request.isUploading){
						document.getElementById('aws-text').hidden=false
						document.getElementById('aws-text').innerHTML="Uploading";
						document.getElementById('progress-bar').hidden=false;
						var percentage=request.percent_completed;
						document.getElementById('progress').style.width=percentage+"%";
						document.getElementById('progress').innerHTML=percentage+"% completed";
						awsBtn.disabled=true;
					}
					else if(request.isUploaded){
						awsBtn.disabled=true;
						if(request.links){
							var watchableLink=request.links.watchableLink;
							document.getElementById('last-recordings').hidden=false;
							document.getElementById('watchable-link').addEventListener('click',()=>{
								chrome.tabs.create({ url: "https://"+watchableLink });
							})
							document.getElementById('video-name').innerText=request.links.file;
							downBtn.href=request.links.downloadableLink;
							downBtn.classList.remove('disabled')
							downloadButton.hidden=true;
							document.getElementById('aws-text').hidden=true
							document.getElementById('aws-text').innerHTML="Uploaded to AWS";
						}						
					}else{
						if(request.blob){
							downloadButton.href=request.downloadButton
			  				downloadButton.download = 'video.mp4';
							//downloadButton.disabled = false;
							downloadButton.classList.remove("disabled")
						}
					}
				}else{
					if(request.blob){
						document.getElementById("sign-in-alert").hidden=false;
					}
				}
			}
		}
	  );
	  function startTimer () {
		seconds++; 
		
		if(seconds <= 9){
		  document.getElementById('seconds').innerHTML = "0" + seconds;
		}
		
		if (seconds > 9){
			document.getElementById('seconds').innerHTML = seconds;
		  
		} 
		
		if (seconds > 59) {
		  console.log("seconds");
		  mins++;
		  document.getElementById('mins').innerHTML = "0" + mins;
		  seconds = 0;
		  document.getElementById('seconds').innerHTML = "0" + 0;
		}
		if(mins >0 && mins<10){
			document.getElementById('mins').innerHTML = "0" + mins;
		}
		if (mins > 9){
			document.getElementById('mins').innerHTML = mins;
		}
		if(mins>59){
			hours++;
			document.getElementById('hours').innerHTML = "0" + hours;
			mins = 0;
			document.getElementById('mins').innerHTML = "0" + 0;
		}
		if(hours >0 && hours<10){
			document.getElementById('hours').innerHTML = "0" + hours;
		}
		if (hours > 9){
			document.getElementById('hours').innerHTML = mins;
		}
	  
	  }
	  

})