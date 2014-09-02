(function($, tester) {

    function stopBubble(e) {
        e.stopPropagation();
    }

    function preventDefault(e) {
        e.preventDefault();
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
    // listReturn.on('click', switchFullScreen);
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
                infiniteLoop : false,
                onSlideBefore : function($slideElement, oldIndex, newIndex) {
                    // thumbs.removeClass('on').eq(newIndex).addClass('on');
                    thumbs.hide().eq(newIndex).fadeIn(800);
                }
            });
    });

    // 各个表单提交
    var forms = $('.order-form');

    forms.each(function() {

        var form = $(this),
            inputs = form.find('.form-input'),
            submit = form.find('.submit'),
            onsubmit = false,
            ajaxURL = form.data('ajax'),
            ajaxIO,
            clickAct = function() {
                $(this).hide().next()[0].focus();
            },
            focusAct = function() {
                $(this).siblings().hide();
            },
            blurAct = function() {
                if(this.value.replace(/\s/g, '') === '') {
                    $(this).val('').siblings().show();
                }
            },
            simpleValidata = function() {
                for(var i = 0, len = inputs.length; i < len; i++) {
                    if(inputs[i].value === '') {
                        inputs.eq(i).parent().fadeOut().fadeIn();
                        return false;
                    }
                }
                return true;
            };
        
        inputs.val('');

        form.on('click', 'label', clickAct)
            .on('focus', 'input', focusAct)
            .on('focus', 'textarea', focusAct)
            .on('blur', 'input', blurAct)
            .on('blur', 'textarea', blurAct)
            .on('submit', preventDefault);
        
        submit.on('click', function() {
            var flag = simpleValidata();
            if(flag && !onsubmit) {
                onsubmit = true;
                submit
                    .html('')
                    .css({
                        backgroundColor : 'transparent',
                        color : '#fff',
                        borderColor : '#fff #999'
                    })
                    .animate({
                        width : 50
                    }, 300)
                    .delay(500)
                    .transition({
                        rotate : 1440
                    }, 7000);
                ajaxIO = $.ajax({
                    // url : 'http://baidu.com',
                    url : ajaxURL,
                    type : 'POST',
                    data : form.serialize(),
                    timeout : 2000
                });
                ajaxIO.done(function(data) {
                    submit.queue(function(next) {
                        submit.css({
                            backgroundColor : '#1ecd97',
                            borderColor : '#1ecd97',
                            rotate : 0
                        });
                        next();
                    })
                    .animate({
                        width : 170
                    }, 300)
                    .queue(function(next) {
                        submit.html('发送成功');
                        next();
                    })
                    .delay(1500)
                    .queue(function(next) {
                        submit
                            .css('background-color', '')
                            .css('border-color', '')
                            .css('color', '')
                            .html('发 送');
                        onsubmit = false;
                        next();
                    });
                }).fail(function(xhr, status) {
                    submit.queue(function(next) {
                        submit.css({
                            backgroundColor : '#fb797e',
                            borderColor : '#fb797e',
                            rotate : 0
                        });
                        next();
                    })
                    .animate({
                        width : 170
                    }, 300)
                    .queue(function(next) {
                        submit.html('发送失败');
                        next();
                    })
                    .delay(1500)
                    .queue(function(next) {
                        submit
                            .css('background-color', '')
                            .css('border-color', '')
                            .css('color', '')
                            .html('发 送');
                        onsubmit = false;
                        next();
                    });
                });
            }
        });

    });

})(jQuery, Modernizr);