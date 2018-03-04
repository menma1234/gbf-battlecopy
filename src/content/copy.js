// modified from http://stackoverflow.com/a/30810322
function copyTextToClipboard(text) {
	var textArea = document.createElement("textarea");
	
	textArea.style.position = "fixed";
	textArea.style.top = 0;
	textArea.style.left = 0;
	textArea.style.width = "2em";
	textArea.style.height = "2em";
	textArea.style.padding = 0;
	textArea.style.border = "none";
	textArea.style.outline = "none";
	textArea.style.boxShadow = "none";
	textArea.style.background = "transparent";
	
	textArea.value = text;
	
	document.body.appendChild(textArea);
	
	textArea.select();
	
	var successful = document.execCommand("copy");
	
	document.body.removeChild(textArea);
	
	return successful;
}

// gets the url of the image holding the button sprites
function getSpriteUrl() {
	return window.getComputedStyle(document.getElementsByClassName("btn-usual-text")[0]).background.replace(/^.*(url\(.*\)).*$/, "$1");
}

// adds and styles the button
function style(spriteUrl, node, id, dpi_mode) {
	var div = document.createElement("div");
	div.innerHTML = "Copy";
	
	if(dpi_mode === 0) {
		div.style.background = spriteUrl + " no-repeat 0 -1998px";
		div.style.backgroundSize = "223px 2831px";
	} else if(dpi_mode === 1) {
		div.style.background = spriteUrl + " no-repeat 0 -2018px";
		div.style.backgroundSize = "224px 2705px";
	} else {
		div.style.background = spriteUrl + " no-repeat 0 -1815px";
		div.style.backgroundSize = "223px 2630px";
	}
	
	div.style.width = "105px";
	div.style.height = "36px";
	div.style.display = "inline-block";
	div.style.paddingTop = "10px";
	
	div.style.boxSizing = "border-box";
	div.style.color = "#f2eee2";
	div.style.textShadow = "0 0 1px #253544,0 0 1px #253544,0 0 1px #253544,0 0 1px #253544,0 0 2px #253544,0 0 2px #253544,0 0 2px #253544,0 0 2px #253544";
	div.style.fontSize = "12px";
	div.style.textAlign = "center";
	div.style.textDecoration = "none";
	div.style.lineHeight = "1";
	
	node.appendChild(div);
	
	div.addEventListener("click", function() { 
		div.innerHTML = copyTextToClipboard(id) ? "Copied" : "Error";
	});
	
	div.addEventListener("touchstart", function() {
		div.style.transform = "scale(0.95, 0.95) translateY(2px)";
	});
	
	div.addEventListener("touchend", function() {
		div.style.transform = "";
	});
}

function main() {
	if(window.location.hash.indexOf("raid_multi") >= 0) {
		var spriteUrl = getSpriteUrl();

		var observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				var node = null, id;
				
				for(var i = 0; i < mutation.addedNodes.length; i++) {
					if(mutation.addedNodes[i].className === "pop-usual pop-start-assist") {
						node = document.evaluate(".//div[@class = 'prt-battle-join']", document.getElementById("pop"), mutation.addedNodes[i], XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
						id = document.evaluate(".//div[@class = 'prt-battle-id']", node, mutation.addedNodes[i], XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerHTML;
						
						// inject a script into the context of the document to get the quality mode in order to determine the css rules to use
						window.addEventListener("dpi_mode", function(e) {
							style(spriteUrl, node, id, e.detail);
						});
						var script = document.createElement("script");
						script.textContent = "(" + function() {
							var event = new CustomEvent("dpi_mode", {detail: Game.setting.dpi_mode});
							window.dispatchEvent(event);
						} + ")();";
						document.head.appendChild(script);
						document.head.removeChild(script);
						
						// guaranteed that pop div is present, no need to observe on contents anymore since that changes much more frequently
						observer.disconnect();
						observer.observe(document.getElementById("pop"), {subtree:true, childList:true});
						break;
					}
				}
			});
		});

		observer.observe(document.getElementsByClassName("contents")[0], {subtree:true, childList:true});
	}
}

// listen for when the required stylesheet is loaded
var styleObserver = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		for(var i = 0; i < mutation.addedNodes.length; i++) {
			if(mutation.addedNodes[i].localName === "style" && mutation.addedNodes[i].className === "page") {
				styleObserver.disconnect();
				
				window.onhashchange = main;
				main();
			}
		}
	});
});

styleObserver.observe(document.head, {subtree:true, childList:true});
