var notificationsScript=(function(){
	var host='ayotli.com';
	var pathNew='notifications';
	var pathZero='';
	
	var counter=0;
	var newNotif=false;
	var protocol='http';
	var alwaysNew=false;
	var showZero=false;
	var timerVar=null;
	var timerDelay=300000;
	var playSound=true;
	var audio=new Audio('chrome://notifications/content/sound.ogg'); // sound.ogg is button-44.wav from soundjay.com
	window.addEventListener('load',init,false);
	
	function $(id){
		return document.getElementById(id);
	}
	
	function loadData(){
		var xhr=new XMLHttpRequest();
		xhr.open('GET','http://ayotli.com/notifications/demo.json',true);	//JSON
		//xhr.open('GET','http://ayotli.com/notifications/demo.xml',true);	//XML
		xhr.onreadystatechange=function(){
			if(xhr.readyState==4){
				$('notificationsBadgetext').style.background='#999';
				
				var jsonDoc=JSON.parse(xhr.responseText);		//JSON
				var username=jsonDoc.username;					//JSON
				//var xmlDoc=new DOMParser().parseFromString(xhr.responseText,'text/xml');			//XML
				//var username=xmlDoc.getElementsByTagName('username')[0].childNodes[0].nodeValue;	//XML
				
				if(username){
					var lastCounter=counter;
					var mess=parseInt(jsonDoc.messages);		//JSON
					var noti=parseInt(jsonDoc.notifications);	//JSON
					//var mess=parseInt(xmlDoc.getElementsByTagName('messages')[0].childNodes[0].nodeValue);		//XML
					//var noti=parseInt(xmlDoc.getElementsByTagName('notifications')[0].childNodes[0].nodeValue);	//XML
				
					var badgeTitle=username+' - Notifications';
					if(mess>0) badgeTitle+='\n> '+mess+' messages';
					if(noti>0) badgeTitle+='\n> '+noti+' notifications';
					counter=mess+noti;

					//$('notificationsBadge').style.background='url(chrome://notifications/content/icon.png)';
					$('notificationsBadge').setAttribute('tooltiptext',badgeTitle);
					if(!showZero&&counter==0)
						$('notificationsBadgetext').childNodes[0].nodeValue='';
					else
						$('notificationsBadgetext').childNodes[0].nodeValue=counter;
					if(counter>lastCounter){
						newNotif=true;
						if(playSound)audio.play();
					}
					if(newNotif)
						$('notificationsBadgetext').style.background='#0c3';
					else if(counter>0)
						$('notificationsBadgetext').style.background='#c03';
				}
				else{
					//$('notificationsBadge').style.background='url(chrome://notifications/content/icon-.png)';
					$('notificationsBadge').setAttribute('tooltiptext','Notifications\n--Disconnected--');
					$('notificationsBadgetext').childNodes[0].nodeValue='?';
					return;
				}
			}
			else return;
		}
		xhr.send(null);
		window.clearTimeout(timerVar);
		timerVar=window.setTimeout(loadData,timerDelay);
	}
	
	function init(){
		$('notificationsBadge').addEventListener('command',notificationsScript.openPage,false);
		
		/*pathNew=(localStorage.pathNew||localStorage.pathNew=='')?localStorage.pathNew:pathNew;
		pathZero=(localStorage.pathZero||localStorage.pathZero=='')?localStorage.pathZero:pathZero;
		protocol=(localStorage.useHttps=='yes')?'https':'http';
		alwaysNew=(localStorage.alwaysNew)?(localStorage.alwaysNew=='yes'):false;
		showZero=(localStorage.showZero)?(localStorage.showZero=='yes'):false;
		playSound=(localStorage.playSound)?(localStorage.playSound=='yes'):true;
		timerDelay=parseInt(localStorage.refreshInterval||'300000');*/

		//$('notificationsBadge').style.background='url(chrome://notifications/content/icon-.png)';
		$('notificationsBadgetext').childNodes[0].nodeValue='...';
		$('notificationsBadgetext').style.background='#cc3';
		loadData();
	}

	function openUrl(uri){
		var wm=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
		var browserEnumerator=wm.getEnumerator("navigator:browser");
		
		if(!browserEnumerator.hasMoreElements()){
			window.open(uri);
			return;
		}
		else if(!alwaysNew){
			while(browserEnumerator.hasMoreElements()){
				var windows=browserEnumerator.getNext();
				var tabs=windows.gBrowser;
				
				for(var i=0;i<tabs.browsers.length;i++){
					if(tabs.getBrowserAtIndex(i).currentURI.spec.indexOf(uri)!=-1){
						tabs.selectedTab=tabs.tabContainer.childNodes[i];
						windows.focus();
						//gBrowser.reload();	// Uncomment to reload
						return;
					}
				}
			}
		}
		if(gBrowser.currentURI.spec=='about:newtab')
			gBrowser.loadURI(uri);
		else
			gBrowser.selectedTab = gBrowser.addTab(uri);
	}
	
	return{
		openPage:function(){
			if(counter>0)
				openUrl(protocol+'://'+host+'/'+pathNew);
			else
				openUrl(protocol+'://'+host+'/'+pathZero);
			newNotif=false;
			loadData();
		}
	}
}());
