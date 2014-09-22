(function($, tester) {

    function stopBubble(e) {
        e.stopPropagation();
    }

    function preventDefault(e) {
        e.preventDefault();
    }

    // 左侧图片自适应
    var imgList = $('#product-figure');
    imgList.imgResize();

    // slider 切换
    var slide = $('#product-detail-pages'),
        thumbs = $('#product-figure').find('figure'),
        slideCtrl = slide.bxSlider({
            controls : false,
            pagerCustom : '#product-detail-nav',
            infiniteLoop : false,
            onSlideBefore : function($slideElement, oldIndex, newIndex) {
                // thumbs.removeClass('on').eq(newIndex).addClass('on');
                thumbs.hide().eq(newIndex).fadeIn(800);
            }
        });

    // 自定滚动条
    $('.product-detail-scroll').nanoScroller({iOSNativeScrolling:true});

    // 表单提交
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