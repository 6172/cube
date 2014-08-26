// 移动端 touch 事件支持(up/down)
(function(doc, tester) {

    var swipeUpEvent,
        swipeDownEvent,
        swipeMark,
        swipeTimer,
        target,
        firstTouch,
        touch;

    if(tester.touch) {
        swipeUpEvent = doc.createEvent("CustomEvent");
        swipeDownEvent = doc.createEvent("CustomEvent");
        swipeMark = false;
        touch = {};

        doc.addEventListener('touchstart', function(e) {
            swipeMark = true;
            firstTouch = e.touches[0];
            target = ('tagName' in firstTouch.target) ? firstTouch.target : firstTouch.target.parentNode;
            touch.startX = firstTouch.clientX;
            touch.startY = firstTouch.clientY;
            swipeTimer = setTimeout(function() {
                swipeMark = false;
            }, 800);
        }, false);

        doc.addEventListener('touchmove', function(e) {
            firstTouch = e.touches[0];
            if(firstTouch.clientX - touch.startX > 3) {
                e.preventDefault();
            }
        }, false);

        doc.addEventListener('touchend', function(e) {
            clearTimeout(swipeTimer);
            firstTouch = e.changedTouches[0];
            touch.endX = firstTouch.clientX;
            touch.endY = firstTouch.clientY;
            if(touch.endX && Math.abs(touch.startX - touch.endX) < 30) {
                if(swipeMark) {
                    if(touch.startY - touch.endY > 30) {
                        swipeUpEvent.initCustomEvent('swipeUp', true, false, {});
                        target.dispatchEvent(swipeUpEvent);
                    }
                    if(touch.startY - touch.endY < -30) {
                        swipeDownEvent.initCustomEvent('swipeDown', true, false, {});
                        target.dispatchEvent(swipeDownEvent);
                    }
                }
            }
            touch = {};
        }, false);
    }

})(document, Modernizr);

// 全局插件
(function(doc, $, tester) {

    // Switch pages width mousewheel(finished)/arrows(finish)/swipeUpDown(TODO)
    $.fn.wheel = function(opts) {
        var defaults = {
            func : 'ease',
            speed : 800,
            arrive : function(pos) {
                return;
            }
        },
        animFunc,
        animProp,
        animEase,
        wheel = {};

        $.extend(defaults, opts);

        if(tester.csstransitions) {
            animFunc = 'transition';
            animProp = 'y';
            animEase = defaults.func;
        }else {
            animFunc = 'animate';
            animProp = 'top';
            animEase = 'swing';
        }

        this.each(function() {
            // 防止重复绑定
            var isBind = $.data(this, 'plugin_wheel');

            if(isBind === 'bind') {
                return ;
            }else {
                $.data(this, 'plugin_wheel', 'bind');
            }

            var page = $(this),
                wrap = page.children('.wheel');

            var currentScreen = 0,
                totalScreens = wrap.children().length;

            var timer = null;

            function moveTo(whichScreen, speed, callback) {
                var func = animEase,
                    tempScreen = currentScreen,
                    moveDist = -1 * whichScreen + '00%'
                
                if(tempScreen === whichScreen) {
                    callback();
                    return;
                }

                if(whichScreen >= 0 && whichScreen < totalScreens) {
                    (function(pos) {
                        var animObj = {};
                        animObj[animProp] = moveDist;
                        wrap[animFunc](animObj, speed, func, function() {
                            callback(whichScreen);
                        });
                    })(whichScreen);
                    currentScreen = whichScreen;
                }
                // console.log('currentScreen: %d, whichScreen: %d', currentScreen, whichScreen);
            }

            function pageWheel(e) {
                var delta = e.deltaY;

                clearTimeout(timer);

                // 按住 ctrl 来缩放页面的跳过
                if(e.ctrlKey) {
                    return;
                }

                timer = setTimeout(function() {
                    var whichScreen = currentScreen;

                    whichScreen = delta < 0 ? whichScreen + 1 : whichScreen - 1;

                    moveTo(whichScreen, defaults.speed, defaults.arrive);
                }, 240);
            }

            function pageChange(e) {
                var code = e.keyCode;
                switch(code) {
                    case 38 :
                        moveTo(currentScreen - 1, defaults.speed, defaults.arrive);
                        break;
                    case 40 :
                        moveTo(currentScreen + 1, defaults.speed, defaults.arrive);
                        break;
                    default :
                        return ;
                };
            }

            function pageSwipe(e) {
                if(e.type === 'swipeUp') {
                    moveTo(currentScreen + 1, defaults.speed, defaults.arrive);
                }else {
                    moveTo(currentScreen - 1, defaults.speed, defaults.arrive);
                }
            }

            if(tester.touch) {
                page.on('swipeUp', pageSwipe).on('swipeDown', pageSwipe);
            }else {
                page.on('mousewheel', pageWheel);
                $(doc).on('keyup', pageChange);
            }

            wheel.moveTo = moveTo;
        });

        return wheel;
    };

    // For containers which have scroll bar to scroll as normal when scroll bar not at top or bottom
    $.fn.autoWheel = function() {
        return this.each(function() {
            var isBind = $.data(this, 'plugin_auto_wheel');

            if(isBind === 'bind') {
                return ;
            }else {
                $.data(this, 'plugin_auto_wheel', 'bind');
            }

            var box = $(this),
                lastScrollTop = 0,
                times = 0;

            function autoWheel(e) {
                var scrollTop = this.scrollTop;

                if(scrollTop === lastScrollTop) {
                    times += 1;
                }else {
                    times = 0;
                }

                if(times > 5) {
                    times = 0;
                }else {
                    e.stopPropagation();
                }

                lastScrollTop = scrollTop;
            }

            box.on('mousewheel', autoWheel);
        });
    }

})(document, jQuery, Modernizr);

// 全局导航动画
(function($, doc, exports) {

    var nav = $('#nav'),
        menu = $('#menu-ctrl'),
        cover = $('#cover-pages'),
        body = $(doc.body);
    
    var navOpened = false;

    function openNav() {
        if(!navOpened) {
            body.addClass('nav-open');
            cover.fadeTo('slow', 0.7);
            navOpened = true;
        }
    }

    function closeNav(e) {
        if(navOpened) {
            if(typeof e === 'object') {
                e.stopPropagation();
            }
            cover.fadeOut();
            body.removeClass('nav-open');
            navOpened = false;
        }
    }

    nav.on('click', openNav);
    menu.on('click', closeNav);
    exports.closeNav = closeNav;

})(jQuery, document, window);