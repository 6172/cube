(function($, tester) {

    function stopBubble(e) {
        e.stopPropagation();
    }

    var wrap = $('#wrap'),
        items = $('.list-item'),
        previews = items.find('.item-preview'),
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
    details.css('visibility', 'hidden');

    // 全屏/缩略图切换
    function switchFullScreen() {
        listSwitch.off('click', switchFullScreen);
        items.off('mousedown', markClickStart);
        items.off('mouseup', switchOnThumb);
        listSwitch.toggleClass('whole');

        if(!fullScreen) {
            listReturn.hide();
            wrap[animFun]({
                height : '100%',
                width : '100%'
            }, 600, animEase, function() {
                details.eq(swipeCtrl.index()).css('visibility', 'visible');
                previews.eq(swipeCtrl.index()).fadeOut();
                swipeCtrl.reinit();
                listSwitch.on('click', switchFullScreen);
                $('.product-detail-scroll').nanoScroller();
            });
        }else {
            listReturn.show();
            details.css('visibility', 'hidden');
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

    // slider 切换
    var sliders = $('.product-detail-pages');

    sliders.each(function(index) {
        var slide = $(this),
            thumbs = $('#product-figure-' + index).find('figure'),
            slideCtrl = slide.bxSlider({
                controls : false,
                pagerCustom : '#product-detail-nav-' + index,
                onSlideBefore : function($slideElement, oldIndex, newIndex) {
                    // thumbs.removeClass('on').eq(newIndex).addClass('on');
                    thumbs.hide().eq(newIndex).fadeIn(800);
                }
            });
    });

})(jQuery, Modernizr);