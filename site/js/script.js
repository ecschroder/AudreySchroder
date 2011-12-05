/* 
 * 'Squares' Portfolio/vCard HTML Template
 * Version: 1.01 (2011-09-17)
 * License: see Envato Licensing Terms (http://wiki.envato.com/support/legal-terms/licensing-terms/)
 * 
 * NOTE: This is NOT a free template and should consequently NOT be redistributed to others.
 * To buy this template, visit http://www.joelb.me/squarestemplate (redirects to Themeforest)
 * 
 * Author: Joel Besada
 * Home Page: http://www.joelb.me
 * Envato Marketplace Profile: http://www.themeforest.com/user/JoelBesada
 */

(function(){
	//Constants
	var DEFAULT_PAGE, GRID_WIDTH, GRID_HEIGHT, PANEL_HEIGHT, PANEL_WIDTH, TRANSITION_FADE_TIME, TRANSITION_DELAY_TIME;
	var FADE_SET_SIZE, MAX_BAR_WIDTH, BAR_GRAPH_HEIGHT, BAR_ANIMATION_TIME, PORTFOLIO_INTERVAL, PAGE_WIDTH, PAGE_HEIGHT;
	
	//Variables
	var currentPage, navButtons, linkMap, grid, portfolioImages, prevPanel, panelList, selectedBar, portfolioInfo;
	var currentImageIndex, nextImageIndex, fadedPanels, isTransitioning, gridOverlay,  mouseInsidePage, fadeUITimeout;
	var portfolioTimer, portfolioTimerBar, timerIsPaused, timerStarted, mainNavigation, portfolioNavigation, portfolioButtons;
	var contactForm, outerBorder, transitionsEnabled;
	 
	//--TIMING CUSTOMIZATION--
	TRANSITION_FADE_TIME = 500; //The duration (in ms) for a single panel to fade in or out
	TRANSITION_DELAY_TIME = 50; //The delay (in ms) before the next set of panels are faded in or out
	PORTFOLIO_INTERVAL = 8000; //The interval (in ms) at which the images transition in the portfolio. Set to 0 to disable.
	//------------------------
	
	GRID_WIDTH = 11;
	GRID_HEIGHT = 6;
	PANEL_WIDTH = 60;
	PANEL_HEIGHT = 60;
	FADE_SET_SIZE = 6; //Number of panels to fade between each delay on a page transition.
	MAX_BAR_WIDTH = 150;
	BAR_ANIMATION_TIME = 1500;
	DEFAULT_PAGE = "#home";
	PAGE_WIDTH = 660;
	PAGE_HEIGHT = 360;
	
	transitionsEnabled = true;
	fadedPanels = 0;
	isTransitioning = false;
	mouseInsidePage = false;
	timerIsPaused = false;
	timerStarted = false;
	
	//Objects
	function Panel(){
		//Variables
		this.element = null;
		this.neighbors = [];
		this.visible = false;	
		
		//Functions
		/**
		 * A function to fade out the panel and all its neighbors
		 * (after a set delay), which in turn fade out their neighbors
		 * until all panels have been faded in or out.
		 */
		this.fade = function(type, fadeTime, delay, onComplete) {
			//Already visible/invisible
			if ((this.visible && type === "in") || (!this.visible && type === "out")) {
				return;	
			}
			var completeFunc;
			fadedPanels++;
			
			//Assign the callback function once all panels have faded in/out
			if (fadedPanels === GRID_WIDTH * GRID_HEIGHT) {
				fadedPanels = 0;
				completeFunc = onComplete;
			}
			//Fade panel element in/out
			if (type === "in") {
				this.element.fadeIn(fadeTime, completeFunc);
			} else if ( type === "out") {
				this.element.fadeOut(fadeTime, completeFunc);	
			} else {
				return;	
			}
	
			this.visible = !this.visible;
			var nbs = this.neighbors;
			
			//Continue with the next set of neighbors after delayed time
			setTimeout(function() {
				for(var i = 0; i < nbs.length; i++) {
					nbs[i].fade(type, fadeTime, delay, onComplete);
				}
			}, delay);
		};
	}
	
	//Functions
	/**
	 * Initialisation, called when document is ready.
	 */
	function init() {
		//Disable transitions if a mobile browser is detected for better performance		
		transitionsEnabled = !$.browser.mobile;
		if (!transitionsEnabled) {
			mouseInsidePage = true;
		}
		//Parse current page from url hash
		currentPage = document.location.hash || DEFAULT_PAGE;
		
		initNavMenu();
		createPanels();
		initPortfolio();
		initBarGraph();
		initContactForm();
		
		//Mouse in and out events for the page
		var main = $("#main");
		main.mouseover(onPageMouseIn);
		main.mouseout(onPageMouseOut);
		
		window.onhashchange = function() { 
			var hash = document.location.hash;
			if (currentPage !== hash) {
				pageTransition(null, hash, true);
			}			
		};
		
		outerBorder = $(".outer-border");
		
		//Run any standard actions when page has loaded
		pageChangeActions();
	}
	/**
	 * Initalises the navigation menu.
	 * The menu works fine without Javascript, we just 
	 * enhance it here.
	 */
	function initNavMenu() {
		linkMap = {};
		mainNavigation = $("#main-navigation");
		navButtons = mainNavigation.find("a");
		var pageExists = false;
		
		//Loop through all navigation buttons
		for (var i = 0; i < navButtons.length; i++) {
			var button = $(navButtons[i]);
			
			//Get the href attribute, store it, and remove it from the element
			var href = button.attr("href");
			linkMap[href] = button;
			button.data("anchorLink", href).removeAttr("href");	
			
			//Add our own click function to create a page transition 
			//effect before actually proceeding to the next page
			button.click(pageTransition);
			
			//If the current page (the hash in the url) is the same as any of the navigation links,
			//we confirm that the page exists.
			if (currentPage === href) {
				addHighlight(button);
				pageExists = true;	
			}
		}
		//The hash in the url does not direct to an existing page, go to the default page
		if (!pageExists) {
			currentPage = document.location =  DEFAULT_PAGE;	
		}
	}
	
	/**
	 * Create all the panels that are used for the page and image transition effects.
	 */
	function createPanels() {
		//Panels are only used for transition effects, so no need to create any if they are disabled
		if (!transitionsEnabled) {
			return;
		}
		
		//The panels are stored in a two-dimensional grid. We access a panel by its x and y coordinates
		//like so: grid[x][y]
		grid = [];
		
		//We also store the panels in a one-dimensional array
		panelList = [];
		
		//We store all the panels in a document fragment first before actually
		//appending them to the DOM. This gives us better performance since direct
		//DOM manipulation is processor expensive
		var frag = document.createDocumentFragment();
		
		//Loop through every x coordinate before going to the next y coordinate
		for (var y = 0; y < GRID_HEIGHT; y++) {
			for (var x = 0; x < GRID_WIDTH; x++) { 
				var panel, precedingHorizontalPanel, precedingVerticalPanel;
				panel = new Panel();
				//Create the DOM element for the panel and position it according to the x and y coordinates.
				panel.element = $("<div>").addClass("panel").css({top: y*PANEL_HEIGHT, left: x*PANEL_WIDTH, 
					"backgroundPosition": -x*PANEL_WIDTH  + "px " + -y*PANEL_HEIGHT + "px" });
				//We want every panel to keep track of their (maximum 4) neighbors. 
				//We do this by getting the preceding horizontal and vertical panels, 
				//add them to the neighbor array, and also add the current panel to the neighbor's
				//neighbor array
				precedingHorizontalPanel = precedingVerticalPanel = null;
				if (x !== 0) {
					precedingHorizontalPanel = grid[x-1][y];
				} 
				if (y !== 0){
					precedingVerticalPanel = grid[x][y-1];
				}
				if (precedingHorizontalPanel) {
					panel.neighbors.push(precedingHorizontalPanel);
					precedingHorizontalPanel.neighbors.push(panel);
				}
				if (precedingVerticalPanel) {
					panel.neighbors.push(precedingVerticalPanel);
					precedingVerticalPanel.neighbors.push(panel);
				}
				
				//Add the panel DOM element to the fragment
				frag.appendChild(panel.element[0]);
				
				//Initiate the y array (column) if needed
				if (grid[x] === undefined) {
					grid[x] = [];
				}
				//Finally add the panel to the grid array and panel list
				grid[x][y] = panel;
				panelList.push(panel);
			}	
		}
		//When all is done, we add the document fragment to the DOM
		$("#main").append(frag);
	}
	
	/**
	 * Load all the images from the portfolio-images list and initiate the UI.
	 */
	function initPortfolio() {
		//We want to hide all images at first
		portfolioImages = $("#portfolio-images li img").css("display", "none");
		
		//Add the various mouse events to the grid overlay
		gridOverlay = $("#grid-overlay").click(onGridClick).mousemove(onGridMouseMove).mouseout(onGridMouseOut);
		
		currentImageIndex = 0;
		nextImageIndex = 1;
		
		//We begin by displaying the first image in the list
		if (portfolioImages.length > 0) {
			$(portfolioImages[0]).css("display", "block");
		}
		
		portfolioInfo = $("#portfolio-info");
		portfolioTimerBar = $("#portfolio-timer");
		portfolioTimerBar.data("originalOpacity", portfolioTimerBar.css("opacity"));
		portfolioNavigation = $("#portfolio-navigation");
		
		//We store all the navigation buttons in a document fragment first before actually
		//appending them to the DOM. This gives us better performance since direct
		//DOM manipulation is processor expensive
		var frag = document.createDocumentFragment();
		portfolioButtons = [];
		
		//Create a nav button for every image in the portfolio
		for (var i = 0; i < portfolioImages.length; i++) {
			var navButton = $("<div>").addClass("portfolio-button").data("index", i);
			//Transition to the corresponding image on click
			navButton.click(function() {
				var thisIndex = $(this).data("index");
				if(thisIndex !== currentImageIndex) {
					nextImageIndex = thisIndex;
					imageTransition();
				}
			});
			//Highlight the current nav button
			if (i === currentImageIndex) {
				addHighlight(navButton);
			}
			
			//Add button to fragment and array
			frag.appendChild(navButton[0]);
			portfolioButtons.push(navButton);
		}
		//Add to document
		portfolioNavigation.append(frag);
	}
	/**
	 * Creates the bars for the bar graph and
	 * set mouse functionality.
	 */
	function initBarGraph() {
		var items = $(".bar-graph li");
		var graphHeight = $(".bar-graph").height();
		//Loop through all list items
		for (var i = 0; i < items.length; i++) {
			var listItem = $(items[i]);
			
			//Get the percent data attribute and calculate the bar width
			var percent = listItem.attr("data-graph-percent");
			var barWidth = parseInt(MAX_BAR_WIDTH*percent/100, 10);
			
			//Stretch the bars out to fill the entire graph
			var barHeight = parseInt(graphHeight/(items.length), 10);
			var bar = $("<div>").addClass("bar").css({width: barWidth, height: barHeight-5});
			listItem.click(function() { selectBar($(this).find(".bar")); });
			
			//Setting the same value to the line-height as the element height makes sure the text is centered  
			listItem.css({height: barHeight, lineHeight: barHeight + "px"});
			listItem.prepend(bar);
		}
	}
	/**
	 * Initiates the contact form, adding client side validation.
	 */
	function initContactForm() {
		contactForm = $("#contact-form");
		//Prevent form from submitting, we'll send it by AJAX once it is valid
		contactForm.submit(function() { return false; });
		var submitButton = $("#contact-submit");
		submitButton.click(function() { 
			//Fade success message, if it was visible
			$("#message-success").fadeOut(250);
			if (validateForm()) {
				$.post(contactForm.attr("action") , contactForm.serialize(), function(data) {
					//Display message on success
					$("#message-success").delay(250).fadeIn(250);	
				});
			}
		}); 
	}
	/**
	 * Validates the contact form, returns false if fields are missing or are
	 * incorrectly filled. Displays errors for invalid fields.
	 */
	function validateForm() {
		var valid = true;
		
		//Validate name
		if(contactForm[0].name.value.length > 0 && contactForm[0].name.value !== $("#contact-name").attr("placeholder")) {
			$("#name-error").fadeOut(250);	
		} else {
			$("#name-error").fadeIn(250);	
			valid = false;
		}
		
		//Validate email
		var emailRegEx = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		if (contactForm[0].email.value.length > 0 && emailRegEx.test(contactForm[0].email.value)) {
			$("#email-error").fadeOut(250);	
		} else {
			$("#email-error").fadeIn(250);	
			valid = false;
		}
		
		//Validate message
		if (contactForm[0].message.value.length > 0) {
			$("#message-error").fadeOut(250);
		} else {
			$("#message-error").fadeIn(250);	
			valid = false;
		}
		
		return valid;
		
	}
	/**
	 * Displays the info for the portfolio image.
	 */
	function displayPortfolioInfo() {
		//Fade the info box in if it has content
		if (portfolioInfo.html().length > 0 && mouseInsidePage) { 
			portfolioInfo.fadeIn(TRANSITION_FADE_TIME);
		}
	}
	
	/**
	 * Fades the info for the portfolio image.
	 */
	function hidePortfolioInfo() {
		//Fade the info box out
		portfolioInfo.fadeOut(TRANSITION_FADE_TIME);	
	}
	/**
	 * Updates the content of the portfolio info.
	 */
	function updatePortfolioInfo() {
		//Append all the content
		var content = $(portfolioImages[currentImageIndex]).parent().children("aside").html();
		portfolioInfo.empty().append(content);	
		if(!content) {
			portfolioInfo.css("display", "none");			
		}
	}
	/**
	 * Starts the portfolio timer from the beginning and animates the timer bar.
	 */
	function startPortfolioTimer() {
		if(PORTFOLIO_INTERVAL === 0) {
			return;	
		}
		timerStarted = true;
		timerIsPaused = false;
		
		//Reset the css and animate to full width
		portfolioTimerBar.css({
			width: 0, 
			display: "block", 
			opacity: portfolioTimerBar.data("originalOpacity")
		}).animate({width: PAGE_WIDTH}, PORTFOLIO_INTERVAL, "linear", imageTransition); 
	}
	/**
	 * Pauses the portfolio timer bar. When paused, the bar decelerates
	 * for a small distance before stopping completely
	 */
	function pausePortfolioTimer() {
		if (timerIsPaused || PORTFOLIO_INTERVAL === 0) {
			return;
		}
		//We stop the jQuery animations, the decelerated part will be
		//animated manually
		portfolioTimerBar.stop(true, false);
		
		timerIsPaused = true;
		
		//The speed before the animation stopped
		var animationSpeed = PAGE_WIDTH/PORTFOLIO_INTERVAL * $.fx.interval;
		//The speed we want to decelerate down to before stopping the animation
		var targetAnimationSpeed = 0.1;
		
		var newWidth = portfolioTimerBar.width();
		var interval = setInterval(function() {
			//We reduce the speed by 5% per tick
			animationSpeed *= 0.95;
			newWidth += animationSpeed;
			//If the bar reaches the end before it has stopped, run the image transition like nothing has happened.
			if (newWidth >= PAGE_WIDTH) {
				newWidth = PAGE_WIDTH;
				imageTransition();
				clearInterval(interval);
			} else if (animationSpeed <= targetAnimationSpeed) {
				//Stop when at target speed
				clearInterval(interval);
			}
			//Apply the new width
			portfolioTimerBar.css("width", newWidth);
		}, $.fx.interval); 
	}
	/**
	 * Continue the portfolio timer bar from where it paused. The bar
	 * accelerates at first until it reached the regular linear speed.
	 */
	function continuePortfolioTimer() {
		if (!timerIsPaused || isTransitioning || PORTFOLIO_INTERVAL === 0) {
			return;	
		}
		timerIsPaused = false;
		
		//The speed we want to start with
		var animationSpeed = 0.1;
		//The speed we need to reach before going over to the linear animation
		var targetAnimationSpeed = PAGE_WIDTH/PORTFOLIO_INTERVAL * $.fx.interval;
		
		var newWidth = portfolioTimerBar.width();
		var interval = setInterval(function() {
			//Accelerate with 5% per tick
			animationSpeed *= 1.05;
			newWidth += animationSpeed;
			//Apply image transition if the end is reached before getting to the desired speed
			if (newWidth >= PAGE_WIDTH) {
				newWidth = PAGE_WIDTH;
				imageTransition();
				clearInterval(interval);
			} else if (animationSpeed >= targetAnimationSpeed) {
				//Go over to jQuery linear animation agains
				clearInterval(interval);
				
				//Calculate the remaining time at linear speed to reach the end
				var remainingTime = (PAGE_WIDTH-newWidth)/(targetAnimationSpeed/$.fx.interval);
				portfolioTimerBar.animate({width: PAGE_WIDTH}, remainingTime, "linear", imageTransition); 	
			}
			portfolioTimerBar.css("width", newWidth);
		}, $.fx.interval); 
	}
	/**
	 * Stops the portfolio timer and fades out the timer bar.
	 */
	function stopPortfolioTimer() {
		timerStarted = false;
		timerIsPaused = true;
		setTimeout(function() { portfolioTimerBar.stop(true, false).fadeOut(TRANSITION_FADE_TIME); }, TRANSITION_DELAY_TIME);
	}
	/**
	 * Transitions between images in the portfolio.
	 */
	function imageTransition(startX, startY) {
		//Do nothing if already transitioning or if not on portfolio
		if (isTransitioning || currentPage !== "#portfolio") {
			return;	
		}
		
		//Highlight the next nav button
		removeHighlight(portfolioButtons[currentImageIndex]);
		addHighlight(portfolioButtons[nextImageIndex]);
		
		//Simply go to the next image if transitions are disabled
		if (!transitionsEnabled) {
			onImageTransitionComplete();
			displayUI();
			portfolioTimerBar.stop(false, false);
			startPortfolioTimer();
			return;
		}
		
		//Start transition
		isTransitioning = true;
		
		//Put the next image on the panels
		setPanelImage(nextImageIndex);
		
		//Hide the portfolio info
		hidePortfolioInfo();
		
		//Stop the timer
		stopPortfolioTimer();
		
		//Fade from specific panel if the user clicked on the grid
		if (startX !== undefined && startY !== undefined) {
			var startPanel = grid[startX][startY];
			//We fade the panels in, starting from the one that was clicked
			startPanel.fade("in", TRANSITION_FADE_TIME, TRANSITION_DELAY_TIME, function() { 
				onImageTransitionComplete();
				//Fade all panels out and display the portfolio info when done
				startPanel.fade("out", TRANSITION_FADE_TIME, TRANSITION_DELAY_TIME, function() { 
					isTransitioning = false;
					if (!mouseInsidePage) {
						startPortfolioTimer();
					} else {
						displayUI();	
					} 
					//Transition complete
					
				});
			});
		} else { //Else fade panels randomly
			fadeRandomly("in", panelList.slice(), function() {
				onImageTransitionComplete();
				//Fade all panels out and display the portfolio info when done
				fadeRandomly("out", panelList.slice(), function() {
					isTransitioning = false;
					//displayPortfolioInfo();
					if (!mouseInsidePage) {
						startPortfolioTimer();
					} else {
						displayUI();	
					} 
					//Transition complete
					
				});
			});
		}
	}
	/**
	 * Commons actions to run when image transition has completed.
	 */
	function onImageTransitionComplete() {
		//Hide the current image and display the next (this is done below the panels)
		$(portfolioImages[currentImageIndex]).css("display", "none");
		$(portfolioImages[nextImageIndex]).css("display", "block");
		
		currentImageIndex = nextImageIndex;
		nextImageIndex++;
		
		//Start at 0 when the end of the image list is reached
		if(nextImageIndex === portfolioImages.length) {
			nextImageIndex = 0;	
		}
		
		updatePortfolioInfo();
		//Hide UI if the user moved the mouse outside the page during the transition
		if (!mouseInsidePage) { 
			hideUI(true);
			startPortfolioTimer();
		} else {
			displayUI();	
		}
	}
	/**
	 * Handles the click event for the grid overlay
	 */
	function onGridClick(e) {
		var clickX, clickY;
		
		//Translate the click position to x and y grid coordinates
		if(e.layerX && e.layerY) {
			clickX = parseInt(e.layerX/PANEL_WIDTH, 10);
			clickY = parseInt(e.layerY/PANEL_HEIGHT, 10);
		} else if (e.offsetX && e.offsetY) {
			clickX = parseInt(e.offsetX/PANEL_WIDTH, 10);
			clickY = parseInt(e.offsetY/PANEL_HEIGHT, 10);
		} else {
			return;	
		}
		imageTransition(clickX, clickY);
	}
	
	/**
	 * This is called when the user hovers the mouse over any of the panels.
	 * We highlight any panel that is hovered over.
	 */
	function onGridMouseMove(e) {
		var mouseX, mouseY;
		//Prevent highlights during transitions or if transitons are disabled
		if (isTransitioning || !transitionsEnabled) {
			return;	
		}
		
		//Translate the mouse position to x and y grid coordinates
		if(e.layerX && e.layerY) {
			mouseX = parseInt(e.layerX/PANEL_WIDTH, 10);
			mouseY = parseInt(e.layerY/PANEL_HEIGHT, 10);
		} else if (e.offsetX && e.offsetY) {
			mouseX = parseInt(e.offsetX/PANEL_WIDTH, 10);
			mouseY = parseInt(e.offsetY/PANEL_HEIGHT, 10);
		} else {
			return;	
		}
		
		//If the user hovers over a new panel, fade in the new one and out the old one
		var hoverPanel = grid[mouseX][mouseY];
		if(prevPanel !== hoverPanel){
			hoverPanel.element.css({backgroundImage: "", display: "block", opacity: 0.0}).animate({opacity: 0.15}, 200);
			if (prevPanel) {
				prevPanel.element.animate({opacity: 0.0}, 200, function() {
					if(!isTransitioning){
						$(this).css("display", "none");
					}
				});
			}
			prevPanel = hoverPanel;
		}
	}
	
	/**
	 * This is called when the user moves the mouse outside the grid.
	 * When that happens we want to fade out the last panel that was hovered over.
	 */
	function onGridMouseOut() {
		if (prevPanel && !isTransitioning) {
			prevPanel.element.fadeOut(200, function() {$(this).css("opacity", 1.0);});
		}
	}
	
	/**
	 * Adds highlight to the specified (navigation button) element.
	 */
	function addHighlight(element) {
		element.addClass("active");
	}
	
	/**
	 * Removes highlight from the specified (navigation button) element.
	 */
	function removeHighlight(element) {
		element.removeClass("active");
	}
	
	/**
	 * Animates a page transition when the user navigates to a new page.
	 */
	function pageTransition(e, page, noTransition) {
		var targetObject, targetPage;
		
		//If triggered from nav button, use the target page of that link,
		//else, use the page argument
		if (e) {
			//The button that was clicked
			targetObject = $(e.currentTarget);
			//The page we are transitioning to
			targetPage = targetObject.data("anchorLink");
		} else {
			targetObject = linkMap[page];
			//The page we are transitioning to
			targetPage = page;
		}
		
		//Do nothing if the user is already on the target page, or if the page is already transitioning
		if (targetPage === currentPage || isTransitioning || targetPage === undefined) {
			return;	
		}
		
		//Highlight the button of the new page, and de-highlight the old one
		addHighlight(targetObject);
		removeHighlight(linkMap[currentPage]);
		
		if (currentPage === "#portfolio") {
			//Clear the panels
			setPanelImage(null);
			
			hidePortfolioInfo();
			stopPortfolioTimer();
			portfolioNavigation.fadeOut(TRANSITION_FADE_TIME);
			mainNavigation.fadeIn(TRANSITION_FADE_TIME);
		}
		//No transition for when the user clicks the back button, manually changes the
		//URL, or when transitions are disabled (user is on a mobile device)
		if (noTransition || !transitionsEnabled) { 
			//Change location to the new page
			currentPage = document.location = targetPage;
			
			//Run any standard actions when page has changed
			pageChangeActions();
		} else {
			//Start transition
			isTransitioning = true;
			
			//We make a copy of the pane list
			fadeRandomly("in", panelList.slice(), function() { 
				//Now fade all the panels out
				fadeRandomly("out", panelList.slice(), function () { isTransitioning = false; } );
				
				//Change location to the new page
				currentPage = document.location = targetPage;
				
				//Run any standard actions when page has changed
				pageChangeActions();
			});
		}
	}
	
	/**
	 * Fades random sets of panels until all are faded.
	 */
	function fadeRandomly(type, list, onComplete) {
		//Run callback when list is empty (all panels faded)
		if (list.length === 0) {
			if (onComplete) {
				//We let the last fade finish before running the callback
				setTimeout(onComplete, TRANSITION_FADE_TIME-TRANSITION_DELAY_TIME);	
			}
			return;
		}
		//Fade a set of random panels
		for (var i = 0; i < FADE_SET_SIZE; i++) {
			//Stop if list is empty
			if (list.length === 0) {
				break;	
			}
			var randomInt = parseInt(list.length*Math.random(),10);
		    var randomPanel = list.splice(randomInt, 1)[0];
		    if(type === "in") {
		    	randomPanel.element.fadeIn(TRANSITION_FADE_TIME);
		    } else if (type === "out") {
		    	randomPanel.element.fadeOut(TRANSITION_FADE_TIME);
		    }
		    randomPanel.visible = !randomPanel.visible;
		}
		//Continue on to the next set of panels after the specified delay
		setTimeout(function() { fadeRandomly(type, list, onComplete); }, TRANSITION_DELAY_TIME);
	}
	
	/**
	 * Sets the background image of the panels to the specified
	 * index of the portfolio image list
	 */
	function setPanelImage(index) {
		if (!grid) {
			return;	
		}
		
		var imageURL = "";
		if(index !== null) {
		 	imageURL = "url('" + $(portfolioImages[index]).attr("src") + "')";
		 }
		for (var y = 0; y < GRID_HEIGHT; y++) {
			for (var x = 0; x < GRID_WIDTH; x++) { 
				grid[x][y].element.stop(true,true).css({display: "none", backgroundImage: imageURL, opacity: 1.0});
			}
		}
	}
	
	/**
	 * Common tasks to perform after every page transition.
	 */
	function pageChangeActions() {
		if (currentPage === "#portfolio") {
			gridOverlay.css("display", "block");
			outerBorder.fadeOut(TRANSITION_FADE_TIME);
			updatePortfolioInfo();
			setTimeout(function() { 
				displayPortfolioInfo();
				if (!mouseInsidePage || !transitionsEnabled) {
					startPortfolioTimer();
				}	
				portfolioNavigation.fadeIn(TRANSITION_FADE_TIME);
			}, TRANSITION_FADE_TIME*2);
			if (!mouseInsidePage) { 
				hideUI(true);
			}
		} else {
			gridOverlay.css("display", "none");
			outerBorder.fadeIn(TRANSITION_FADE_TIME);
			hidePortfolioInfo();
		}
		if (currentPage === "#resume") {
			animateBars();	
		} else {
			if (selectedBar) { 
				deHighlightBar(selectedBar);
				selectedBar = null;
			}
		}	
	}
	/**
	 * Animates the width of the graph bars and
	 * highlights the first one.
	 */
	function animateBars() {
		var bars = $(".bar-graph li .bar");
		var firstBar;
		for (var i = 0; i < bars.length; i++) {
			var bar = $(bars[i]);
			if (i === 0) {
				firstBar = bar;	
			}
			var barWidth = bar.width();
			bar.css("width", 0);
			bar.delay(TRANSITION_FADE_TIME).animate({width: barWidth}, (barWidth/MAX_BAR_WIDTH)*BAR_ANIMATION_TIME);
		}
		if(firstBar) {
			setTimeout(function() { selectBar(firstBar); }, BAR_ANIMATION_TIME+TRANSITION_FADE_TIME+300);
		}
	}
	
	/**
	 * Selects a bar in the graph.
	 */
	function selectBar(bar) {
		if(selectedBar && selectedBar !== bar) {
	 		deHighlightBar(selectedBar, function() { highlightBar(bar); });
		} else {
		 	highlightBar(bar);
		}
	 	selectedBar = bar;
	}
	
	/**
	 * Highlights a bar in the graph and displays its info.
	 */
	function highlightBar(bar) {
		var listItem = bar.parent();
		listItem.addClass("highlight");
	 	var title = listItem.children(".bar-title").html();
	 	var content = listItem.children("aside").html();
	 	$(".bar-graph-info .content").empty().append($("<h1>").html(title), content).fadeIn(TRANSITION_FADE_TIME);
	}
	
	/**
	 * De-highlights a bar in the graph and hides its info.
	 */
	function deHighlightBar(bar, onComplete) {
		var listItem = bar.parent();
		listItem.removeClass("highlight");
	 	$(".bar-graph-info .content").fadeOut(TRANSITION_FADE_TIME, onComplete);
	}
	
	/**
	 * Display the UI and pause the timer when the user moves the mouse inside the page
	 * if on portfolio page.
	 */
	function onPageMouseIn(e) {
		//Disable hover events if transitions are disabled
		if (!transitionsEnabled) {
			return;	
		}
		
		if(currentPage === "#portfolio") {
			clearInterval(fadeUITimeout);
			fadeUITimeout = setTimeout(function() { 
				if (mouseInsidePage) {
					displayUI(); 
					pausePortfolioTimer(); 
				}
			}, 500);
		}
		mouseInsidePage = true;
	}
	/**
	 * Hide the UI and continue the timer when the user moves the mouse outside the page
	 * if on portfolio page.
	 */
	function onPageMouseOut(e) {
		//Disable hover events if transitions are disabled
		if (!transitionsEnabled) {
			return;	
		}
		
		if (currentPage === "#portfolio") {
			clearInterval(fadeUITimeout);
			fadeUITimeout = setTimeout(function() { 
				if (!mouseInsidePage && !isTransitioning) {
					hideUI(false); 
					if (!timerStarted) {
						startPortfolioTimer();
					} else {
						continuePortfolioTimer(); 
					}
				}
			}, 500);
		}
		mouseInsidePage = false;
	}
	
	/**
	 * Fade in the portfolio page UI
	 */
	function displayUI() {
		if(isTransitioning){
			return;	
		}
		displayPortfolioInfo();
		mainNavigation.fadeIn(TRANSITION_FADE_TIME);
	}
	/**
	 * Fade out the portfolio page UI
	 */
	function hideUI(forceHide) {
		if ((isTransitioning || currentPage !== "#portfolio") && !forceHide) {
			return;	
		}
		hidePortfolioInfo();
		mainNavigation.fadeOut(TRANSITION_FADE_TIME);
	}
	//Shorthand debugging
	function debug(){
		console.log(arguments);	
	}
	
	//Run init function when document is ready
	$(document).ready(init);

})();
