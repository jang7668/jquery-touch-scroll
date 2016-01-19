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
                    if (Math.abs(touchStartY - touchEndY) > (window.outerWidth / 100 * options.threshold)) {
                        if (touchStartY > touchEndY) { options.swipeDown(); }
                        else { options.swipeUp(); }
                    }
                }
                // Left or Right
                else {
                    if (Math.abs(touchStartX - touchEndX) > (window.outerWidth / 100 * options.threshold)) {
                        if (touchStartX > touchEndX) { options.swipeLeft(); }
                        else { options.swipeRight(); }
                    }
                }
            }
        };

        return this.each(function(){

            var $el = $(this);

            // if Touch device or can touch event
            if(isTouchDevice || isTouch) {
                var MSEvent = getMSEvent();
                $el.off('touchstart ' +  MSEvent.down).on('touchstart ' + MSEvent.down, touchStartHandler);
                $el.off('touchmove ' + MSEvent.move).on('touchmove ' + MSEvent.move, touchMoveHandler);
            }
        });
    };

    $.fn.touchScrollEvent.defaults = {
        swipeRight : function() {  },
        swipeLeft: function() {  },
        swipeUp : function() {  },
        swipeDown : function() {  },
        threshold : 5
    };

})(jQuery);