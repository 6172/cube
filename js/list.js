// Swipe plugin
(function($, doc, window) {

    $.fn.swipe = function() {

        if(this.length !== 1) {
            return ;
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

(function($, tester) {

    function stopBubble(e) {
        e.stopPropagation();
    }

    var wrap = $('#wrap'),
        items = $('.list-item'),
        previews = items.find('.item-preview'),
        titles = previews.find('.item-titles'),
        details = items.find('.item-detail');

    var listNav = $('#list-nav'),
        listSwitch = listNav.find('.list-switch'),
        listReturn = listNav.find('.list-return'),
        animFun = tester.csstransitions ? 'transition' : 'animate',
        animEase = tester.csstransitions ? 'cubic-bezier(.7, 0, .3, 1)' : 'swing',
        fullScreen = false,
        swipeCtrl,
        mousePoint;

    swipeCtrl = wrap.swipe();

    // 全屏/缩略图切换
    function switchFullScreen() {
        listSwitch.off('click', switchFullScreen);
        listSwitch.toggleClass('whole');

        if(!fullScreen) {
            listReturn.hide();
            previews.fadeOut();
            wrap[animFun]({
                height : '100%',
                width : '100%'
            }, 600, animEase, function() {
                swipeCtrl.reinit();
                items.off('mousedown', markClickStart);
                items.off('mouseup', switchOnThumb);
                listSwitch.on('click', switchFullScreen);
            });
        }else {
            listReturn.show();
            previews.fadeIn();
            wrap[animFun]({
                height : '42%',
                width : '32%'
            }, 600, function() {
                swipeCtrl.reinit();
                items.on('mousedown', markClickStart);
                items.on('mouseup', switchOnThumb);
                listSwitch.on('click', switchFullScreen);
            });
        }
        fullScreen = !fullScreen;
    }

    // 缩略图时点击切换
    function markClickStart(e) {
        mousePoint = e.pageX;
    }

    function switchOnThumb(e) {
        var swipeIndex, clickIndex;
        if(mousePoint === e.pageX) {
            swipeIndex = swipeCtrl.index();
            clickIndex = $(this).index();
            if(swipeIndex === clickIndex) {
                switchFullScreen();
            }else {
                swipeCtrl.to(clickIndex, 300);
                console.log(clickIndex);
            }
        }
    }

    listSwitch.on('click', switchFullScreen);
    listReturn.on('click', switchFullScreen);
    items.on('mousedown', markClickStart);
    items.on('mouseup', switchOnThumb);
    details.on('mousedown', stopBubble);

})(jQuery, Modernizr);