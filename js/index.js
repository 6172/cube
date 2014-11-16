(function($, doc, loc, tester, window) {

    $(doc).ready(function() {

        function stopBubble(e) {
            e.stopPropagation();
        }

        function preventDefault(e) {
            e.preventDefault();
        }

        // 滚屏/导航跳转
        var pages = $('#pages'),
            pagesCtrl;

        var navMenuLines = $('#nav-menu').find('li'),
            navMenus = navMenuLines.find('a'),
            navObj = {
                introduce : 0,
                product : 1,
                videos : 2,
                posts : 3,
                contact : 4
            };

        function addNavMark(index) {
            navMenuLines
                .removeClass('on')
                .eq(index)
                .addClass('on');
        }

        function goToScreen(index) {
            pagesCtrl.moveTo(
                index,
                800,
                window.closeNav
            );
        }

        function getHash() {
            var hashMatch = location.hash.match(/^#([A-Za-z]\w+)/),
                hash = hashMatch == null ? '' : hashMatch[1];
            return hash;
        }

        function hashDetector() {
            var hash = getHash();
            if(navObj.hasOwnProperty(hash)) {
                goToScreen(navObj[hash]);
            }
        }

        pagesCtrl = pages.wheel({
            speed : 640,
            arrive : function(index) {
                doc.activeElement && doc.activeElement.blur();
                addNavMark(index);
            }
        });

        navMenus.on('click', function(e) {
            var index = $(this).data('index'),
                hash = getHash();
            if(index === navObj[hash]) {
                $(window).trigger('hashchange');
            }
            e.stopPropagation();
        });
        
        hashDetector();
        $(window).on('hashchange', hashDetector);

        // 第一屏：轮播图
        var intro = $('#main-intro'),
            sliderMain;

        sliderMain = intro.bxSlider({
            infiniteLoop : false,
            controls : false,
            startSlide : 0,
            auto : true,
            pause : 5000
        });
        
        // 第二屏：轮播图
        var products = $('#product-intro'),
            sliderProduct,
            sliderProductCover;

        sliderProduct = products.bxSlider({
            mode : 'fade',
            infiniteLoop : false,
            controls : false,
            pagerCustom : '#product-ctrl',
            startSlide : 0
        });

        products.imgResize();

        // 第三屏：视频切换、播放
        var videoNavItems = $('#video-nav-items').find('li'),
            videoLists = $('#video-lists').find('.video-list'),
            sliders = [];

        for(var i = 0, len = videoLists.length; i < len; i++) {
            sliders[i] = videoLists.eq(i).find('.video-videos').bxSlider({
                mode : 'fade',
                infiniteLoop : false,
                pager : false,
                startSlide : 0
            });
        }

        videoNavItems.each(function(index) {
            $(this).on('click', function() {
                videoNavItems.removeClass('on').eq(index).addClass('on');
                videoLists.hide().eq(index).show();
                sliders[index].reloadSlider();
            });
        });

        var videoLayer = $('#video-player'),
            videoFrame = videoLayer.find('iframe');

        $('#video-lists').on('click', 'figure', function() {
            var videoSrc = $(this).attr('data-video');
            videoFrame.attr('src', videoSrc);
            videoLayer.fadeIn();
        });

        $('#video-close').on('click', function() {
            videoLayer.fadeOut();
            videoFrame.attr('src', '');
        });

        // 第四屏：首页文章
        var posterCtrl = $('#poster-show'),
            posterCtrls = posterCtrl.find('a'),
            posterCont = $('#poster-cont'),
            posterPage = posterCont.find('.poster-cont-wrap'),
            posterClose = posterCont.find('.close');

        posterCtrls.on('click', function(e) {
            var index = $(this).data('index');
            e.preventDefault();
            posterCont
                .on('mousewheel', stopBubble)
                .on('touchmove', stopBubble)
                .on('touchend', stopBubble)
                .find('article')
                .hide()
                .eq(index)
                .show();
            posterCtrl.fadeOut();
            posterPage.scrollTop(0);
        });

        posterClose.on('click', function() {
            posterCtrl.fadeIn();
            posterCont
                .off('mousewheel', stopBubble)
                .off('touchmove', stopBubble)
                .off('touchend', stopBubble)
                .find('article')
                .hide();
        });

        if(!tester.touch) {
            posterCtrl.autoHover(
                (3 - posterCtrl.children().length) * 0.25,
                0, 0.003, pages
            );
        }

        posterCtrl.find('a').imgResize();

        // 第五屏：联系我们表单
        var form = $('#contact-from'),
            inputs = form.find('.form-input'),
            submit = $('#submit'),
            onsubmit = false,
            ajaxURL = form.data('ajax'),
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

        inputs.val('');

        form.on('focus', 'input', focusAct)
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
                        borderColor : '#fff #666'
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

        form.find('textarea').on('mousewheel', stopBubble);

        // 招聘、分公司
        var coverLayer = $('#cover-layer'),
            hirePanel = $('#hire'),
            companyPanel = $('#companies'),
            scrollContent = coverLayer.find('.nano');

        $('#join-company').on('click', function() {
            hirePanel.show();
            companyPanel.hide();
            coverLayer.fadeIn();
        });

        $('#sub-company').on('click', function() {
            hirePanel.hide();
            companyPanel.show();
            coverLayer.fadeIn();
        });

        coverLayer.on('click', '.close', function() {
            coverLayer.fadeOut();
        }).on('click', function(e) {
            if(e.target === this) {
                coverLayer.fadeOut();
            }
        });

        $('.layer-cont').on('click', '.items-wrap', function() {
            $(this).next().slideToggle();
        });
    });

})(jQuery, document, location, Modernizr, window);