/*!
 * request animation frame (RAF) polyfill by Paul Irish
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/*!
jQuery Scroll To Top Plugin
Appends a link allowing you to go back to the top of the page after you've scrolled down a certain distance
version 1
copyright NOE Interactive
*/
(function($, $w, $b) {
	"use strict";
    $.fn.scrollHelper = function(options) {
		//Options
		var settings = {
			topAnchor : 'body', //Selector of the element you want to reach when you go back up
			classes : ['scroll-helper-instance'],
			animationSpeed: 1000, //The speed of the animation to go back to top
            animationEase: 'swing', //The easing function used for the animation            
            goTop : {
                class : 'back-to-top',
                title : 'go back to the top of the page',
                scrollTo : 0,
                hideOn : null,
                showOn : 600
            },
            goBottom : {
                class : 'go-to-bottom',
                title : 'scroll down the page',
                scrollTo : function() {return $w.scrollTop() + $b.height() * 0.6},
                hideOn : 200,
                showOn : -200 //inertia of scroll on mac gives negative scrollTop value                
            },
            scroll : null,
            scrollStop : null,
            scrollBegin : null,
		};

		options && $.extend(settings, options);
		
		//variables definition
		//We store all the selectors we are going to need
		var $bckTop = $(this),
		isVisible = false,
		isScrolling = false,
		self = this,
		timerScroll = null,
		scrollTop = 0,
		lastScrollTop = 0,
		side = '',
		state = '', //current state of the <a>, can be top or bottom
		//Link creation
        $bckTopLink = $('<a>', {'class' : settings.classes.join(' ')})
        				.appendTo($bckTop)
        				.click(function(e) {
        					e.preventDefault();
    	                    _click();
        	
        				});
        
        //public methods that can be overridden
        var toRemove = [];
        this.scrollRAF = function() {
            var params = handleScrollingSide($w.scrollTop()),
            lastState = state;
            settings.scroll && params[2] !== 'NO_MOVE' && settings.scroll.apply($bckTop, params);   
            
            //console.log('STATE = '+state+' & scrollTop = '+scrollTop);
            if((!settings.goTop.hideOn || scrollTop <= settings.goTop.hideOn) && scrollTop >= settings.goTop.showOn) {
                if(state !== 'top') {
                    state = 'top';  
                    $bckTopLink.text(settings.goTop.title).addClass(settings.goTop.class);
                }
            } else if(state === 'top') {
                state = '';
                //toRemove.push(settings.goTop.class);
                $bckTopLink.removeClass(settings.goTop.class);
            } 
            
             if((!settings.goBottom.hideOn || scrollTop <= settings.goBottom.hideOn) && scrollTop >= settings.goBottom.showOn) {
                 if(state !== 'bottom') {
                    state = 'bottom';  
                    $bckTopLink.text(settings.goBottom.title).addClass(settings.goBottom.class);
                }
            } else if(state === 'bottom') {
                state = '';
                $bckTopLink.removeClass(settings.goBottom.class);
                //toRemove.push(settings.goBottom.class);
            }
            /*
            if(lastState === '' && state !== '') {
                $bckTopLink.fadeIn(200);
            } else if(lastState !== '' && state == '') {
                $bckTopLink.fadeOut(200, function() {
                    $bckTopLink.text('').removeClass(toRemove.join(' '));
                    toRemove = [];
                });
            }*/
            isScrolling === true ? requestAnimationFrame(function() {self.scrollRAF.call(self);})  : function() { self.endScroll.call(self);}();
        }

        this.startScroll = function() {
            var params = handleScrollingSide($w.scrollTop());
            settings.scrollBegin && params[2] !== 'NO_MOVE' && settings.scrollBegin.apply($bckTop, params);
        }
        this.endScroll = function() {
            var params = handleScrollingSide($w.scrollTop());
            params[2] = side;
            settings.scrollStop && settings.scrollStop.apply($bckTop, params);
        };
        

        //private
        function handleScrollingSide(scTop) {
            var tmp = [scTop, lastScrollTop, scTop > lastScrollTop  ? 'DOWN' : scTop == lastScrollTop ? 'NO_MOVE' : 'UP'];
            scrollTop = scTop;
            lastScrollTop = scrollTop;
            side = tmp[2] !== 'NO_MOVE' ? tmp[2] : side;
            return tmp;
        }
        
        function _sc(e) {
            if(!isScrolling) {
                self.startScroll.call(self);
                isScrolling = true;
                self.scrollRAF.call(self);
            }
            
            if(timerScroll) {
                clearTimeout(timerScroll);
                timerScroll = null;
            }
            timerScroll = setTimeout(function() {
                isScrolling = false;
            }, 200);
        };
        
        function _click() {
            if(state !== '') {
                $b.animate({scrollTop: 
                    state == 'bottom' ? (typeof settings.goBottom.scrollTo === 'function' ? settings.goBottom.scrollTo() : settings.goBottom.scrollTo) : 
                    (typeof settings.goTop.scrollTo === 'function' ? settings.goTop.scrollTo() : settings.goTop.scrollTo)       
                },settings.animationSpeed,settings.animationEase);
            }
        }
        
        $w.scroll(_sc);
        _sc();//First launch without scroll
        


    }

})(jQuery, jQuery(window), $('html,body'));