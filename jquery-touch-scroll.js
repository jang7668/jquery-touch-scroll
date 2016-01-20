/*!
* jQuery Touch Scroll Plugin v0.1.0
* https://github.com/jang7668/jquery-touch-scroll
*/
(function($){

    $.fn.touchScrollEvent = function( opts ){

        var touchStartY = 0;
        var touchStartX = 0;
        var touchEndY = 0;
        var touchEndX = 0;

        var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
        var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints));

        var prevTime = new Date().getTime();
        var scrollings = [];

        var options = $.extend({ }, $.fn.touchScrollEvent.defaults, opts || {});

        // Get Touch event for MS device;
        var getMSEvent = function(){
            var pointer;
            if(window.PointerEvent){
                pointer = { down: 'pointerdown', move: 'pointermove'};
            }
            else{
                pointer = { down: 'MSPointerDown', move: 'MSPointerMove'};
            }

            return pointer;
        };

        // get Touch Events
        var getEvents = function(e) {
            var events = [];

            events.y = (typeof e.pageY !== 'undefined' && (e.pageY || e.pageX) ? e.pageY : e.touches[0].pageY);
            events.x = (typeof e.pageX !== 'undefined' && (e.pageY || e.pageX) ? e.pageX : e.touches[0].pageX);

            if(isTouch && isReallyTouch(e)){
                events.y = e.touches[0].pageY;
                events.x = e.touches[0].pageX;
            }
            return events;
        }

        var isReallyTouch = function(e){
            return typeof e.pointerType === 'undefined' || e.pointerType != 'mouse';
        };

        // touch start event
        var touchStartHandler = function(event) {
            var e = event.originalEvent;

            if( isReallyTouch(e) ){
                var touchEvents = getEvents(e);
                touchStartY = touchEvents.y;
                touchStartX = touchEvents.x;
            }
        };

        var touchMoveHandler = function(event){
            var e = event.originalEvent;

            if ( isReallyTouch(e) ) {

                event.preventDefault();

                var touchEvents = getEvents(e);
                touchEndY = touchEvents.y;
                touchEndX = touchEvents.x;

                // Up or Down
                if ( (Math.abs(touchStartY - touchEndY)) > (Math.abs(touchStartX - touchEndX))) {
                    if (Math.abs(touchStartY - touchEndY) > (window.outerWidth / 100 * options.touchThreshold)) {
                        if (touchStartY > touchEndY) { options.swipeDown(); }
                        else { options.swipeUp(); }
                    }
                }
                // Left or Right
                else {
                    if (Math.abs(touchStartX - touchEndX) > (window.outerWidth / 100 * options.touchThreshold)) {
                        if (touchStartX > touchEndX) { options.swipeLeft(); }
                        else { options.swipeRight(); }
                    }
                }
            }
        };

        var getAverage = function(elements, number){
            var sum = 0;

            var lastElements = elements.slice(Math.max(elements.length - number, 1));

            for(var i = 0; i < lastElements.length; i++){
                sum = sum + lastElements[i];
            }

            return Math.ceil(sum/number);
        }

        var MouseWheelHandler = function(e) {
            var curTime = new Date().getTime();

            e = e || window.event;
            var value = e.wheelDelta || -e.deltaY || -e.detail;
            var delta = Math.max(-1, Math.min(1, value));

            var horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
            var isScrollingVertically = (Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta)) || (Math.abs(e.deltaX ) < Math.abs(e.deltaY) || !horizontalDetection);

            if(scrollings.length > 149){
                scrollings.shift();
            }
            scrollings.push(Math.abs(value));
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            //time difference between the last scroll and the current one
            var timeDiff = curTime-prevTime;
                prevTime = curTime;

            if(timeDiff > 200){
                scrollings = [];
            }

            var averageEnd = getAverage(scrollings, 10);
            var averageMiddle = getAverage(scrollings, 70);
            var isAccelerating = averageEnd >= averageMiddle;

            if(isAccelerating && isScrollingVertically){

                if (delta < 0) {
                    options.scrollDown();
                }else {
                    options.scrollUp();
                }
            }

            return false;
        };


        return this.each(function(){

            var $el = $(this);

            // Touch Event

            // if Touch device or can touch event
            // 2016.01.20 add use swipe option
            if( options.swipe&& (isTouchDevice || isTouch)) {
                var MSEvent = getMSEvent();
                $el.off('touchstart ' +  MSEvent.down).on('touchstart ' + MSEvent.down, touchStartHandler);
                $el.off('touchmove ' + MSEvent.move).on('touchmove ' + MSEvent.move, touchMoveHandler);
            }

            if(! options.mouseWheel) return;

            // Mouse Wheel Event
            var prefix = '';
            var _addEventListener;

            if (window.addEventListener){
                _addEventListener = "addEventListener";
            }
            else{
                _addEventListener = "attachEvent";
                prefix = 'on';
            }

            // detect available wheel event
            // Modern browsers support "wheel" but Webkit and IE support at least "mousewheel" else older Firefox
            var support = 'onwheel' in document.createElement('div') ? 'wheel' : (document.onmousewheel !== undefined) ? 'mousewheel' : 'DOMMouseScroll';

            if(support == 'DOMMouseScroll'){
                document[ _addEventListener ](prefix + 'MozMousePixelScroll', MouseWheelHandler, false);
            }
            //handle MozMousePixelScroll in older Firefox
            else{
                document[ _addEventListener ](prefix + support, MouseWheelHandler, false);
            }
        });
    };

    $.fn.touchScrollEvent.defaults = {
        swipe : true,
        swipeRight : function() {  },
        swipeLeft: function() {  },
        swipeUp : function() {  },
        swipeDown : function() {  },
        touchThreshold : 5,
        mouseWheel : true,
        scrollUp : function() {},
        scrollDown : function() {}

    };

})(jQuery);