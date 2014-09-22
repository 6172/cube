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
            if(firstTouch.clientY - touch.startY > 20) {
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

// 滚动插件和自动滚屏辅助插件
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

        // 防止重复绑定
        var isBind = this.data('plugin_wheel');

        if(isBind === 'bind') {
            return ;
        }else {
            this.data('plugin_wheel', 'bind');
        }

        var page = this,
            wrap = page.children('.wheel');

        var currentScreen = 0,
            totalScreens = wrap.children().length;

        var timer = null;

        function moveTo(whichScreen, speed, callback) {
            var func = animEase,
                arrive = defaults.arrive,
                tempScreen = currentScreen,
                moveDist = -1 * whichScreen + '00%'
            
            if(tempScreen === whichScreen) {
                console.log('stop');
                return;
            }

            if(whichScreen >= 0 && whichScreen < totalScreens) {
                (function(pos) {
                    var animObj = {};
                    animObj[animProp] = moveDist;
                    wrap[animFunc](animObj, speed, func, function() {
                        arrive(whichScreen);
                        callback && callback(whichScreen);
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

                moveTo(whichScreen, defaults.speed);
            }, 240);
        }

        function pageChange(e) {
            var code = e.keyCode;
            switch(code) {
                case 38 :
                    moveTo(currentScreen - 1, defaults.speed);
                    break;
                case 40 :
                    moveTo(currentScreen + 1, defaults.speed);
                    break;
                default :
                    return ;
            };
        }

        function pageSwipe(e) {
            if(e.type === 'swipeUp') {
                moveTo(currentScreen + 1, defaults.speed);
            }else {
                moveTo(currentScreen - 1, defaults.speed);
            }
        }

        function getPos() {
            return currentScreen;
        }

        if(tester.touch) {
            page.on('swipeUp', pageSwipe).on('swipeDown', pageSwipe);
        }else {
            page.on('mousewheel', pageWheel);
            $(doc).on('keyup', pageChange);
        }

        wheel.moveTo = moveTo;
        wheel.getPos = getPos;

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

(function($, doc, window) {
    // 悬浮左右移动（按百分比）
    $.fn.autoHover = function(min, max, speed, widthEle) {
        var videoFlag = false,
            videoDist = 0,
            videoStep = -1,
            min = (typeof min === 'number') ? min : 0,
            max = (typeof min === 'number') ? max : 0,
            self = this,
            resizeTimer = null,
            circleTimer = null,
            wholeWidth = widthEle.width();

        function listStart() {
            circleTimer = setTimeout(function() {
                // speed 0.001 ~ 0.01
                videoDist = Math.max(
                    Math.min(videoDist + videoStep * speed, max),
                    min
                );
                self.css('left', toPercent(videoDist));
                listStart();
            }, 30);
        }

        function listRun(e) {
            videoStep = (e.pageX - 60) / wholeWidth < 0.7 ? 1 : -1;
        }

        function listStop() {
            clearTimeout(circleTimer);
        }

        function toPercent(number) {
            return number * 100 + '%';
        }

        $(window).on('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                wholeWidth = widthEle.width();
            }, 150);
        });

        this.on('mouseenter', listStart)
            .on('mousemove', listRun)
            .on('mouseleave', listStop);
    };

})(jQuery, document, window);

// 抓取滑动插件
(function($, doc, window) {

    $.fn.swipe = function() {

        if(this.length !== 1) {
            return ;
        }

        var isBind = $.data(this, 'plugin_swipe');

        if(isBind === 'bind') {
            return ;
        }else {
            $.data(this, 'plugin_swipe', 'bind');
        }

        var moveFun = 'left',
            userScreen = $(doc),
            timer = null;

        var container = this,
            moveEle = container.children('.swipe'),
            childrenEle = moveEle.find('.swipe-child'),
            totalPos = childrenEle.length,
            currPos = 0,
            startWith,
            eachWidth,
            totalWidth,
            maxLimit = 0,
            minLimit,
            isScrolling,
            start = {},
            delta = { x : 0, y : 0 };

        function init() {
            eachWidth = container.width();
            startWith = 0 - currPos * eachWidth;
            totalWidth = totalPos * eachWidth;
            minLimit = eachWidth - totalWidth;
        }

        function swipeStart(e) {
            var positionEvt = e;
            start.x = positionEvt.pageX;
            start.y = positionEvt.pageY;
            isScrolling = undefined; // 用于判断是否是在滚动页面
            container.on('dragstart', stopEvent);
            userScreen.on('mousemove', swipeMove);
            userScreen.on('mouseup', swipeEnd);
        }

        function swipeMove(e) {
            var positionEvt = e,
                dist, tempMax;

            delta.x = positionEvt.pageX - start.x;
            delta.y = positionEvt.pageY - start.y;

            if (typeof isScrolling == 'undefined') {
                isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
            }
            if(!isScrolling) {
                stopEvent(e);

                tempMax = 200 - 200 * Math.pow(0.995, Math.abs(delta.x)); // 左右间隔缓动
                dist = toPercent(
                    getMoveDist(startWith + delta.x, minLimit - tempMax, maxLimit + tempMax) / eachWidth
                );
                // dist = startWith + delta.x;
                moveEle.css(moveFun, dist);
            }
        }

        function swipeEnd(e) {
            var near, now, animObj = {}, distance = Math.abs(delta.x);

            container.off('dragstart', stopEvent);
            userScreen.off('mousemove', swipeMove);
            userScreen.off('mouseup', swipeEnd);
            
            if(!isScrolling) {
                // 先获取结束时的位置，然后判断处于第几部分（根据手指滑动的范围来选择计算方式 - 四舍五入、向上/下取整）
                now = parseInt(moveEle.css(moveFun));

                if(distance > eachWidth / 2) {
                    near = Math.round(now / eachWidth);
                }else if(distance !== 0) {
                    near = 0 - currPos;
                }else {
                    return ;
                }

                // 计算最终移动到的位置
                near = Math.min(Math.max(near, 1 - totalPos), 0);
                currPos = Math.abs(near);
                startWith = near * eachWidth;
                animObj[moveFun] = near + '00%';
                delta = { x : 0, y : 0 };
                childrenEle.removeClass('on').eq(currPos).addClass('on');
                moveEle.stop().animate(animObj, 240);
            }
        }

        function stopEvent(e) {
            e.preventDefault();
        }

        function toPercent(number) {
            var cutLength = 5;
            number = number * 100 + '';
            cutLength += number.indexOf('.');
            return number.substr(0, cutLength) + '%';
        }

        function toNumber(percent) {
            return percent.replace('%', '') / 100;
        }

        function getMoveDist(computed, min, max) {
            return Math.max(Math.min(computed, max), min);
        }

        function moveTo(index, time) {
            var animObj = {};
            currPos = index;
            index = index > 0 ? -index : 0;
            startWith = index * eachWidth;
            animObj[moveFun] = index + '00%';
            childrenEle.removeClass('on').eq(currPos).addClass('on');
            moveEle.animate(animObj, time);
        }

        function getPos() {
            return currPos;
        }

        init();

        container.on('mousedown', swipeStart);
        $(window).on('resize', function() {
            clearTimeout(timer);
            timer = setTimeout(init, 200);
        });

        return {
            to : moveTo,
            reinit : init,
            index : getPos
        };
    };

})(jQuery, document, window);

// 全局导航动画
(function($, doc, exports) {

    var nav = $('#nav'),
        menu = $('#menu-ctrl'),
        cover = $('#cover-pages'),
        body = $(doc.body),
        wechat = $('#wechat'),
        wechatQR = $('#nav-qr');
    
    var navOpened = false,
        snsOpened = false;

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

    // 点击遮罩关闭遮罩
    cover.on('click', closeNav);
    nav.on('click', openNav);
    menu.on('click', closeNav);
    exports.closeNav = closeNav;
    wechat.on('click', function() {
        if(snsOpened) {
            wechatQR.fadeOut();
        }else {
            wechatQR.fadeIn();
        }
        snsOpened = !snsOpened;
    });
    wechatQR.on('click', function() {
        wechatQR.fadeOut();
        snsOpened = false;
    });

})(jQuery, document, window);

(function($, doc, exports) {

    function resizeImg(container, pic) {
        var width = pic.width(),
            height = pic.width(),
            containerWidth = container.width(),
            containerheight = container.height();

        var containerRatio = containerWidth / containerheight,
            ratio = width / height;

        if(ratio < containerRatio) {
            pic.style.height = 'auto';
            pic.style.width = '100%';
        }else {
            pic.style.width = 'auto';
            pic.style.height = '100%';
        }
    }

    function setImgCover(container) {

    }

})(jQuery, document, window);