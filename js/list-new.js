(function($, tester) {

    var wall = $('#list-products-wall'),
        cont = $('#list-produsts-cont'),
        products = $('.list-product-item'),
        filterNav = $('#list-filter-list'),
        msnry;

    // 自动布局
    msnry = new Masonry(cont[0], {
        columnWidth: 300,
        gutter : 40,
        isFitWidth : true,
        itemSelector: '.list-product-item'
    });

    // 滚动条和居中
    setWallVerticalCenter();
    msnry.on('layoutComplete', function() {
        setWallVerticalCenter();
    });

    // 鼠标进入特效
    products.hover(function(e) {

        var self = $(this),
            overlay = self.find('.list-item-info'),
            w = self.width(),
            h = self.height(),
            x = (e.pageX - self.offset().left - (w / 2)) * (w > h ? (h / w) : 1),
            y = (e.pageY - self.offset().top - (h / 2)) * (h > w ? (w / h) : 1),
            direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4,
            state = {};

        switch(direction) {
            case 0 :
                state = {
                    top : '-100%',
                    left : 0
                };
                break;
            case 1 :
                state = {
                    top : 0,
                    left : '100%'
                };
                break;
            case 2 :
                state = {
                    top : '100%',
                    left : 0
                };
                break;
            case 3 :
                state = {
                    top : 0,
                    left : '-100%'
                };
                break;
            default :
                console.log('Dict error.');
        };

        overlay.css(state).stop().animate({
            top : 0,
            left : 0
        }, 270);

    }, function(e) {

        var self = $(this),
            overlay = self.find('.list-item-info'),
            w = self.width(),
            h = self.height(),
            x = (e.pageX - self.offset().left - (w / 2)) * (w > h ? (h / w) : 1),
            y = (e.pageY - self.offset().top - (h / 2)) * (h > w ? (w / h) : 1),
            direction = Math.round((((Math.atan2(y, x) * (180 / Math.PI)) + 180) / 90) + 3) % 4,
            finallState = {};

        switch(direction) {
            case 0 :
                finallState = {
                    top : '-100%',
                    left : 0
                };
                break;
            case 1 :
                finallState = {
                    top : 0,
                    left : '100%'
                };
                break;
            case 2 :
                finallState = {
                    top : '100%',
                    left : 0
                };
                break;
            case 3 :
                finallState = {
                    top : 0,
                    left : '-100%'
                };
                break;
            default :
                console.log('Dict error.');
        };

        overlay.stop().animate(finallState, 270);

    });

    // 产品过滤，目前只根据品牌和工艺两项过滤，不跳转页面
    var allProducts = $('.list-product-item'),
        processDesc = $('#list-process-desc'),
        resizeTimer;

    function setWallVerticalCenter() {
        var contHeight = cont.height(),
            parentHeight = cont.parent().height();

        if(contHeight < parentHeight) {
            cont.css('top', (parentHeight - contHeight) / 2 + 'px');
        }else {
            cont.css('top', 0);
        }

        wall.nanoScroller();
    }

    filterNav.on('click', 'a', function() {
        var self = $(this),
            brand = self.data('brand'),
            process = self.data('process'),
            selector = '.list-product-item';
        
        processDesc.hide().children().hide();
        
        if(brand !== undefined) {
            selector = selector + '[data-brand=' + brand + ']';
        }
        if(process !== undefined) {
            selector = selector + '[data-process=' + process + ']';
            processDesc.find('[data-process=' + process + ']').show();
            processDesc.fadeIn();
        }

        filterNav.find('a').removeClass('on');
        self.addClass('on');

        allProducts.hide();
        $(selector).show();

        msnry.layout();
        setWallVerticalCenter();
    });

    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            setWallVerticalCenter();
        }, 100);
    });

})(jQuery, Modernizr);