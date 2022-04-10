var tabid=null;
let names="cookietokenkey";
function getCookie(name) {
	const value = `; ${document.cookie}`;	
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
  }
  let cookieValue=getCookie(names);

console.log(cookieValue);
if(cookieValue){
	async function postData(url = '',data={}) {
		// Default options are marked with *
		console.log("get data");
		const response = await fetch(url, {
		  method: 'GET', // *GET, POST, PUT, DELETE, etc.
		  headers: {
			  'auth':cookieValue
		  },
		  redirect: 'follow', // manual, *follow, error
		  referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
		  //body: data // body data type must match "Content-Type" header
		});
		return response.json(); // parses JSON response into native JavaScript objects
	  }
	  
	  postData('https://videorecorderbackend.herokuapp.com/userDetails')
		.then((data) => {
		  console.log(data); // JSON data parsed by `data.json()` call
		  chrome.runtime.sendMessage({greeting: "cookieValue",cookieValue,data}, function(response) {
			  console.log(response);
			})
		});
}
chrome.runtime.onMessage.addListener(
	async function(request, sender, sendResponse) {
			if (request.greeting === "start-content"){
					tabid=request.tabid;
						prepareFrame();
						setTimeout(()=>{
							chrome.runtime.sendMessage({greeting: "audiosource",tabid}, function(response) {
								console.log(response);
							  })
		
						},100)
			}
			if (request.greeting === "stopss"){
				console.log("removed");
				remove();
				chrome.runtime.sendMessage({greeting: "cancel"}, function(response) {
					console.log(response);
				  })
			}
			if(request.greeting==="check-tab"){
				if(window.location.href){
					console.log(window.location.href);
					sendResponse({url:true})
				}
			}
});
function prepareFrame() {
	var ifrm = document.createElement("iframe");
	ifrm.src = chrome.extension.getURL('audiosource.html');
	ifrm.hidden=true;
	ifrm.id="iframe"
	ifrm.setAttribute("allow", "microphone; camera");
	document.body.appendChild(ifrm);	
}
function remove(){
	var ifrm = document.getElementById("iframe");
	if(ifrm)
	document.body.removeChild(ifrm);
   }
if(location.href=="https://videorecorderbackend.herokuapp.com/"){
	console.log("logout");
	chrome.runtime.sendMessage({greeting: "logout"}, function(response) {
		console.log(response);
	  })
}
