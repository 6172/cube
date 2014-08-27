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

(function($, doc, window) {

    $(doc).ready(function() {

        function stopBubble(e) {
            e.stopPropagation();
        }

        // 滚屏
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
            },
            hash = location.hash.replace('#', '');

        function addNavMark(index) {
            navMenuLines
                .removeClass('on')
                .eq(index)
                .addClass('on');
        }

        pagesCtrl = pages.wheel({
            speed : 640,
            arrive : function(index) {
                addNavMark(index);
            }
        });

        // 导航跳转
        hash = hash === '' ? 'introduce' : hash;
        addNavMark(navObj[hash]);
        pagesCtrl.moveTo(
            navObj[hash],
            1200,
            window.closeNav
        );

        navMenus.on('click', function(e) {
            var index = $(this).data('index');
            e.stopPropagation();
            addNavMark(index);
            pagesCtrl.moveTo(
                index,
                800,
                window.closeNav
            );
        });

        // 第一屏：轮播图
        var intro = $('#main-intro'),
            sliderMain;

        sliderMain = intro.bxSlider({
            controls : false,
            startSlide : 0
        });
        // sliderMain.startAuto();

        // 第二屏：轮播图
        var products = $('#product-intro'),
            productsCover = $('#product-cover').find('li'),
            sliderProduct,
            sliderProductCover;

        sliderProduct = products.bxSlider({
            controls : false,
            pagerCustom : '#product-ctrl',
            startSlide : 0,
            onSlideBefore : function(slideElement, oldIndex, newIndex) {
                productsCover.removeClass('on').eq(newIndex).addClass('on');
            }
        });

        // sliderProduct.startAuto();

        // 第三屏：视频切换、播放
        var videoWraper = $('#video-player'),
            video = $('#video'),
            videoBtn = $('#video-btn'),
            videoThumb = videoBtn.find('img'),
            videoList = $('#video-intro'),
            videoListWraper = videoList.parent(),
            videoArrow = videoListWraper.next(),
            videoListItems = videoList.find('a'),
            videoListNav = $('#video-intro-nav'),
            player = !!window.flowAPI ? flowAPI : video[0],
            videoListCtrl = $('.video-intro-ctrl'),
            videoPlaying = false;

        // 视频切换
        videoList.on('click', 'a', function() {
            var ele = $(this),
                thumb = ele.data('thumb'),
                link = ele.data('video');
            
            videoPlaying = false;
            videoListItems.removeClass('on');
            ele.addClass('on');

            player.pause();
            video.attr('src', link).hide();
            videoThumb.attr('src', thumb);
            videoBtn.fadeIn();
        });

        // 视频播放
        videoBtn.on('click', function() {
            video.show();
            player.play();
            videoPlaying = true;
            videoBtn.fadeOut();

            videoWraper.transition({
                height : '95%'
            }, 300, 'ease');
            videoListWraper.transition({
                height : '5%'
            }, 300, 'ease', function() {
                videoArrow.hide();
                videoListNav.fadeIn();
                videoListCtrl.css('display', 'none');
            });
        });

        // 展开视频收缩栏
        videoListNav.on('click', function() {
            videoWraper.transition({
                height : '80%'
            }, 300, 'ease');
            videoListWraper.transition({
                height : '20%'
            }, 300, 'ease', function() {
                videoArrow.show();
                videoListNav.fadeOut();
                videoListCtrl.css('display', '');
            });
        });

        var videoPart = 20,
            videoListMin = 5 - videoList.children().length,
            videoListMax = 0,
            videoListCurrent = 0;

        // 视频左右选择更多
        videoListCtrl.on('click', function() {
            var dect = $(this).data('dect'),
                percent;
            videoListCurrent = Math.max(
                Math.min((dect + videoListCurrent), videoListMax),
                videoListMin
            );
            percent = (videoListCurrent * videoPart) + '%';
            videoList.stop().animate({
                left : percent
            }, 500);
        });

        // 空格暂停（本屏有效）
        // 阻止IE系列播放时选中视频按下空格默认暂停
        function judgeSpace(e) {
            var code = e.keyCode,
                activeTag = doc.activeElement.tagName.toLowerCase();
            if(code === 32 && (activeTag !== 'input' || activeTag !== 'textarea')) {
                e.preventDefault();
            }
        }

        function playAnsPause(e) {
            var index = pagesCtrl.getPos();
            if(index === 2) {
                if(e.keyCode === 32) {
                    if(videoPlaying) {
                        if(player.paused) {
                            player.play();
                        }else {
                            player.pause();
                        }
                    }
                }   
            }
        }

        $(doc).on('keydown', judgeSpace);
        $(doc).on('keyup', playAnsPause);

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
                .off('touchend', stopBubble);
        });

        posterCtrl.autoHover(
            (3 - posterCtrl.children().length) * 0.25,
            0, 0.003, pages
        );

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
                    url : 'http://127.0.0.1/demos/machine/',
                    type : 'POST',
                    dataType : 'HTML',
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

})(jQuery, document, window);