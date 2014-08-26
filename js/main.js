// 全局插件
(function(doc, $) {

    // Switch pages width mousewheel(finished)/arrows(TODO)/swipeUpDown(TODO)
    $.fn.wheel = function(opts) {
        var defaults = {
            func : 'ease',
            speed : 800,
            arrive : function(pos) {
                return;
            }
        };

        var options = $.extend(defaults, opts);

        return this.each(function() {
            // 防止重复绑定
            var isBind = $.data(this, 'plugin_wheel');

            if(isBind === 'bind') {
                return ;
            }else {
                $.data(this, 'plugin_wheel', 'bind');
            }

            var page = $(this),
                wrap = page.find('.wrap');

            var currentScreen = 0,
                totalScreens = wrap.children().length;

            var timer = null;

            function moveTo(whichScreen) {
                var func = defaults.func,
                    speed = defaults.speed,
                    tempScreen = currentScreen,
                    moveDist = -1 * whichScreen + '00%'

                if(whichScreen >= 0 && whichScreen < totalScreens) {
                    (function(pos) {
                        wrap.transition({
                            x : 0,
                            y : moveDist
                        }, speed, func, function() {
                            if(typeof defaults.arrive === 'function') {
                                defaults.arrive(pos);
                            }
                        });
                    })(currentScreen);
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

                    moveTo(whichScreen);
                }, 360);
            }

            function pageChange(e) {
                var code = e.keyCode;
                switch(code) {
                    case 38 :
                        moveTo(currentScreen - 1);
                        break;
                    case 40 :
                        moveTo(currentScreen + 1);
                        break;
                    default :
                        return ;
                };
            }

            page.on('mousewheel', pageWheel);
            $(doc).on('keyup', pageChange);
        });
    };

    // For containers which have scroll bar to scroll as normal when scroll bar not at top or bottom
    $.fn.autoWheel = function() {
        return this.each(function() {
            var isBind = $.data(this, 'plugin_4_wheel');

            if(isBind === 'bind') {
                return ;
            }else {
                $.data(this, 'plugin_4_wheel', 'bind');
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

                if(times > 3) {
                    times = 0;
                }else {
                    e.stopPropagation();
                }

                lastScrollTop = scrollTop;
            }

            box.on('mousewheel', autoWheel);
        });
    }

})(document, jQuery);

// 所有页面 - 导航动画、
(function(doc, $) {

    var nav = $('#nav'),
        menu = $('#menu-ctrl'),
        body = $(doc.body);
    
    var navOpened = false;

    function openNav() {
        if(!navOpened) {
            body.addClass('nav-open');
            navOpened = true;
        }
    }

    function closeNav(e) {
        if(navOpened) {
            e.stopPropagation();
            body.removeClass('nav-open');
            navOpened = false;
        }
    }

    nav.on('click', openNav);
    menu.on('click', closeNav);

})(document, jQuery);

// 主页
(function(doc, $) {

    function stopBubble(e) {
        e.stopPropagation();
    }

    // 滚屏
    var pages = $('#pages');

    pages.wheel({
        speed : 640,
        arrive : function(index) {
            console.log('pos is %d', index);
        }
    });

    // 第一屏：轮播图
    var intro = $('#main-intro'),
        sliderMain;

    sliderMain = intro.bxSlider({
        controls : false,
        autoHidePager : false
    });
    // sliderMain.startAuto();

    // 第二屏：轮播图
    var products = $('#product-intro'),
        sliderProduct;

    sliderProduct = products.bxSlider({
        controls : false,
        pagerCustom : '#product-ctrl'
    });
    // sliderProduct.startAuto();

    // 第三屏：视频切换、播放
    $(doc).ready(function() {
        var videoWraper = $('#video-player'),
            video = $('#video'),
            videoBtn = $('#video-btn'),
            videoThumb = videoBtn.find('img'),
            videoList = $('#video-intro'),
            videoListWraper = videoList.parent(),
            videoListItems = videoList.find('a'),
            videoListNav = $('#video-intro-nav'),
            player = !!window.flowAPI ? flowAPI : video[0];

        videoList.on('click', 'a', function() {
            var ele = $(this),
                thumb = ele.data('src'),
                link = ele.data('video');
            
            videoListItems.removeClass('on');
            ele.addClass('on');

            player.pause();
            video.attr('src', link).hide();
            videoThumb.attr('src', thumb);
            videoBtn.fadeIn();
        });

        videoBtn.on('click', function() {
            video.show();
            player.play();
            videoBtn.fadeOut();
            videoWraper.transition({
                height : '95%'
            }, 300, 'ease');
            videoListWraper.transition({
                height : '5%'
            }, 300, 'ease', function() {
                videoListNav.fadeIn();
            });
        });

        videoListNav.on('click', function() {
            videoWraper.transition({
                height : '80%'
            }, 300, 'ease');
            videoListWraper.transition({
                height : '20%'
            }, 300, 'ease', function() {
                videoListNav.fadeOut();
            });
        });
    });

    // 第四屏：首页文章
    var posterCtrl = $('#poster-show'),
        posterCtrls = posterCtrl.find('a'),
        posterCont = $('#poster-cont'),
        posterClose = posterCont.find('.close');

    posterCtrls.on('mouseenter', function() {
        $(this).find('.poster-tip').transition({
            top: 0
        }, 300);
    }).on('mouseleave', function() {
        $(this).find('.poster-tip').transition({
            top: '100%'
        }, 300);
    }).on('click', function(e) {
        var index = $(this).data('index');
        e.preventDefault();
        posterCont
            .on('mousewheel', stopBubble)
            .find('article')
            .hide()
            .eq(index)
            .show();
        posterCtrl.fadeOut();
    });

    posterClose.on('click', function() {
        posterCtrl.fadeIn();
        posterCont.off('mousewheel', stopBubble);
    });

    // 第五屏：联系我们表单
    var form = $('#contact-from'),
        inputs = form.find('.form-input'),
        submit = $('#submit'),
        onsubmit = false,
        ajaxIO,
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

    form.on('focus', 'input', focusAct)
        .on('focus', 'textarea', focusAct)
        .on('blur', 'input', blurAct)
        .on('blur', 'textarea', blurAct);
    
    submit.on('click', function() {
        var flag = simpleValidata();
        if(flag && !onsubmit) {
            onsubmit = true;
            ajaxIO = $.ajax({
                url : 'http://baidu.com',
                // url : '/',
                type : 'POST',
                dataType : 'HTML',
                data : form.serialize(),
                timeout : 2000
            });
            ajaxIO.done(function(data) {
                submit.queue(function(next) {
                    submit.css({
                        backgroundColor : '#1ecd97',
                        borderColor : '#1ecd97'
                    });
                    next();
                })
                .transition({
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
                        borderColor : '#fb797e'
                    });
                    next();
                })
                .transition({
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

            submit
                .css({
                    backgroundColor : 'transparent',
                    color : '#fff',
                    borderColor : '#fff #666',
                    rotate : 0
                })
                .html('')
                .transition({
                    width : 50
                }, 300)
                .transition({
                    rotate : 1440
                }, 7000);
        }
    });

})(document, jQuery);