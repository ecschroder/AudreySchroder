
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/* --- INPUT PLACEHOLDER SUPPORT FOR ALL BROWSERS --- */

/* This code is licensed under Creative Commons Attribution 3.0    *
 * You may share and remix the script so long as you attribute the *
 * original author, Andrew January.                                *
 * http://creativecommons.org/licenses/by/3.0/                     */

$(document).ready(function() {
    // Check to see if the browser already supports placeholder text (introduced in HTML5). If it does,
    // then we don't need to do anything.b
    var i = document.createElement('input');
    if ('placeholder' in i) {
        return;
    }
	var isPassword = function(input) {
		return $(input).attr('realType') == 'password';
	}
	
	var valueIsPlaceholder = function(input) {
		return input.value == $(input).attr('placeholder');
	}

	var showPlaceholder = function(input, loading) {
		// FF and IE save values when you refresh the page. If the user refreshes the page
		// with the placeholders showing they will be the default values and the input fields won't
		// be empty. Using loading && valueIsPlaceholder is a hack to get around this and highlight
		// the placeholders properly on refresh.
		if (input.value == '' || (loading && valueIsPlaceholder(input))) {
			if (isPassword(input)) {
				// Must use setAttribute rather than jQuery as jQuery throws an exception
				// when changing type to maintain compatability with IE.
				// We use our own "compatability" method by simply swallowing the error.
				try {
					input.setAttribute('type', 'input');
				} catch (e) { }
			}
			input.value = $(input).attr('placeholder');
			$(input).addClass('placeholder');
		}
	}
	
	var hidePlaceholder = function(input) {
		if (valueIsPlaceholder(input) && $(input).hasClass('placeholder')) {
			if (isPassword(input)) {
				try {
					input.setAttribute('type', 'password');
					// Opera loses focus when you change the type, so we have to refocus it.
					input.focus();
				} catch (e) { }
			}
			
			input.value = '';
			$(input).removeClass('placeholder');
		}
	}
	
	$(':text[placeholder],:password[placeholder]').each(function(index) {
		// We change the type of password fields to text so their placeholder shows.
		// We need to store somewhere that they are actually password fields so we can convert
		// back when the users types something in.
		if ($(this).attr('type') == 'password') {
			$(this).attr('realType', 'password');
		}

		showPlaceholder(this, true);
		
		$(this).focus(function() { hidePlaceholder(this) });
		$(this).blur(function() { showPlaceholder(this, false) });
	});
});

/**
 * jQuery.browser.mobile (http://detectmobilebrowser.com/)
 *
 * jQuery.browser.mobile will be true if the browser is a mobile device
 *
 **/
(function(a){jQuery.browser.mobile=/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);

