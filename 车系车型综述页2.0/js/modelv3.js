/**
 * @description 车型综述页页
 * @authors HP(hepeng.zhou@360che.com)
 * @date    2016-04-29 16:23:32
 * @version v2.0
 */

define(function (require, exports) {

    if(!exports.compare){
        var navScroll,compare_nav = document.querySelector('#compare_nav');
        window.addEventListener('load',function(){
            if(compare_nav){
                var selected = compare_nav.firstElementChild.querySelector('span');
                var x = selected.getBoundingClientRect().left - (document.documentElement.offsetWidth - 54);
                compare_nav.x = x > 0 ? compare_nav.firstElementChild.offsetWidth - (document.documentElement.offsetWidth - 54) : 0;
                navScroll = new iScroll(compare_nav,{"x":-compare_nav.x});
            }

        });
        compare_nav && compare_nav.addEventListener('click',function(e){
            var target = e.target;
            if(target.tagName == 'SPAN' && target.className == 'nav-expand'){
                exports.unclick();
                navScroll.hScroll = compare_nav.classList.contains('visible') ? true : false;
                compare_nav.classList.toggle('visible');
                navScroll.scrollTo(compare_nav.x,0,200,true);
            }
        });
    }

    // 插入到body下
    function moveElement(){

        //获取侧边栏
        var sidebar = document.querySelector('#sidebar');
        sidebar && document.body.appendChild(sidebar);

        //底部浮层询底价 && 如果有就放到body下面。
        var footGetPrice = document.querySelector('.foot-price');
        footGetPrice && document.body.appendChild(footGetPrice);

        //图片页面换车型
        var car_model = document.querySelector('#car_model');
        car_model && document.body.appendChild(car_model)

    };
    moveElement();

    // 判断标签是块级元素还是行内元素
    // function tags(){
    //     var tab_content = document.querySelectorAll('#tab_content .truck-name a');

    //     tab_content.forEach( function(element, index) {
    //         if(element.offsetHeight == '45' && element.parentNode.children['lastItem'].tagName == 'DIV'){
    //             element.parentNode.children['lastItem'].style.display = 'inline-block';
    //         }else{
    //             element.parentNode.children['lastItem'].style.display = 'block';
    //         }

    //     });
    // }
    //tags();

    // 福田618活动
    function FOTON(){
        if(window.brandId){
            var activity = document.createElement('aside');
            activity.classList.add('fontn-activity');
            activity.innerHTML = '<a href="http://topic.360che.com/2016072001/"><img src="http://static.360che.com/product/images/m_foton616.png" alt="福田7月盛惠"/></a>'
            document.body.appendChild(activity);
        }
    }
    // FOTON()

    //换地区时，查看有无参考价
    function refRuote(target){
        var ref_quote = document.querySelector('#ref_quote'),
            ref_location = document.querySelector('#ref_location'),
            o = {};
        o.proid = result_list.dataset['proid'];

        //存储选中省份的id
        if(target.dataset['provinid'] || target.dataset['provinceid']){
            ref_quote.setAttribute('data-provinid',(target.dataset['provinid'] ? target.dataset['provinid'] : target.dataset['provinceid']))
        }
        o.provinceid = ref_quote.dataset['provinid'];
        if(target.dataset['fid']){
            o.cityid = target.dataset['fid'];
        }

        $.ajax({
            url:ref_quote.dataset['ajaxurl'],
            type:'get',
            data:o,
            dataType:'json',
            success:function(data){
                var parent = ref_quote.parentNode;
                if(data.length > 1){
                    parent.classList.add('more-quote')
                }else{
                    parent.classList.remove('more-quote')
                }
                if(data && data.length){
                    parent.classList.remove('hidden')
                    var content = '';
                    data.forEach( function(ele, index) {
                        content += '<div>';

                        if(ele.F_Remark == ''){
                            content += '经销商参考价'
                        }else{
                            content += ele.F_Remark
                        }

                        content += '<span>' + ele.price + '</span></div>'
                    });

                    ref_quote.innerHTML = content
                }else{
                    ref_quote.parentNode.classList.add('hidden')
                }
            },
            error:function(){
                console.log('请求地区参考价失败')
            }

        })
    }

    // 其他人还关注  换一批功能
    !function(){
        var replacement = document.querySelector('#replacement'),
            rests_car   = document.querySelector('#rests_car');
        num     = 2;
        replacement && replacement.addEventListener('tap',function(){
            gacode('车型综述页','点击换一批','','')
            $.ajax({
                url:rests_car.dataset['ajaxurl'],
                type:'get',
                data:{'num':num,'size':5},
                dataType:'json',
                success:function(data){

                    if(data && data.info == 'ok'){
                        var content = ''
                        data.data.forEach( function(ele, index) {
                            content += '<li><a href="' + ele.url + '" onclick="gacode(\'车型综述页\',\'还关注区块\',\'车型\',\'\');"><figure><img src="' + ele.img + '" alt="' + ele.F_ProductName + '"/></figure><p>' + ele.F_ProductName + '</p>'
                            if(ele.F_Price != 0){
                                content += '<span>' + ele.F_Price + '万';
                            }else{
                                content +='<span>暂无报价'
                            }
                            content += '</span></a></li>';
                        });
                    }
                    if(num >= data.total){
                        replacement.classList.add('hidden')
                    }else{
                        num++
                    }
                    rests_car.innerHTML = content;
                }
            })
        })
    }();

    // 点击加载更多隐藏内容
    function loadMore(){
        var load_more = document.querySelectorAll('.load-more');
        load_more && load_more.addEventListener('tap',function(){
            exports.unclick();

            if(!this.dataset['index']){
                gacode('车型综述页','点击查看更多经销商','点击一次','')
            }else{
                gacode('车型综述页','点击查看更多经销商','点击两次','')
            }
            var list = this.previousElementSibling;
            list && list.querySelectorAll('.hidden').forEach(function(item,index){
                if(index < 5){
                    item.classList.remove('hidden');
                }
            });

            if(list.querySelectorAll('.hidden') && !list.querySelectorAll('.hidden').length){
                this.parentElement.removeChild(this);
            }else{
                this.setAttribute('data-index',2)
            }
        })
    }

    // 换车型
    var exchange = document.querySelector("#exchange"),
        sidebar = document.querySelector('#sidebar'),
        _location = Container.querySelector('#location'),
        ref_location = document.querySelector('#ref_location'),
        result_list = Container.querySelector('#result_list'),
        loading = Container.querySelector('.loading'),
        _total      = Container.querySelector('#total');



// 107-137
    // if(exchange){
    //     var exchangeList = new exports.sidebar({
    //        'ajaxurl':exchange.dataset['ajaxurl'],
    //        render:function(res){
    //            sidebar.firstElementChild.innerHTML = res;
    //        }
    //     });
    // }

    // exchange && exchange.addEventListener('tap',function(){
    //     exports.unclick();
    //     exchangeList.data = {"proid":this.dataset['proid'],"seriesid":this.dataset['seriesid']};
    //     exchangeList.get().show("exchange");
    // });

    // // 选择地区
    // if(_location){
    //     _location.regionType = 'province';
    //     var region = new exports.sidebar({
    //         'ajaxurl':_location.dataset['ajaxurl'],
    //         render: function (o) {
    //             sidebar.firstElementChild.innerHTML = o;
    //         }
    //     });
    //     _location.addEventListener('tap',function(){
    //         exports.unclick();
    //         region.data = '';
    //         region.get().show('filter-line');
    //         _location.regionType = 'province';
    //     });
    // }

    // 加载更多经销商
    function loadDealers(replace,target){
        if(loadDealers.locked) return;
        loadDealers.locked = true;
        loadDealers.options['page'] = result_list.page;
        // loading.classList.add('visible');
        if(target){
            loadDealers.provinceid = target.dataset['provinid'];
        }
        $.ajax({
            url:result_list.dataset['ajaxurl'],
            data:loadDealers.options,
            dataType:'json',
            success:function(res){
                var content = '';
                var number;
                if(res){
                    if(res.length){
                        res.forEach(function(ele,index){
                            if(index >= 5){
                                content += '<li class="hidden">'
                            }else{
                                content += '<li>'
                            }
                            content += '<div class="dealer-info';

                            if(ele.vip){
                                content += ' vip-dealer';
                            }

                            content += '"><a href="'


                            if(ele.dealerUrl !== "javascript:;"){
                                content += ele.dealerUrl + 'price_' + result_list.dataset['subcateid'] + '_' + result_list.dataset['seriesid'] + '.html';
                            }else{
                                content += ele.dealerUrl
                            }


                            content += '" class="dealer-name"><h5 class="';

                            // 判断是否是付费经销商 给付费经销商增加icon图标
                            if(ele.vip){
                                content += 'vip-icon'
                            }

                            //判断是否有价格
                            if(ele.price){
                                content +=  ' quote-dealer'
                            }

                            content +=   '">' + ele.name + '</h5><p>' + ele.address + '</p><div class="tags">';

                            //判断是否有标签
                            if(ele.vip && ele.tag1){
                                content += '<span>' + ele.tag1 + '</span>'
                            }
                            if(ele.vip && ele.tag2){
                                content += '<span>' + ele.tag2 + '</span>'
                            }

                            content += '</div></a><aside class="dealer-tel"><a href="tel:' + ele.phone + '" rel="nofollow" onclick="gacode(\'子类车型综述页\',\'点击联系经销商\',\'\',\'\');">联系经销商</a><a href="' + ele.askPriceUrl + '" rel="nofollow" onclick="gacode(\'点击询底价按钮\',\'产品库_子类车型综述页\',\'经销商区块\',\'\');" rel="nofollow">询底价</a></aside>';

                            //判断是否有价格
                            if(ele.price){
                                content += '<a href="' + ele.commentPriceUrl + '" class="price"  onclick="gacode(\'子类车型综述页\',\'推荐经销商区块\',\'点击价格\',\'\');">' + ele.price + '</a>'
                            }
                            content += '</div>';

                            //判断是否有促销活动
                            if(ele.article){
                                content += '<a href="' + ele.articleUrl + '" class="sales'

                                if(ele.vip){
                                    content += ' vip-dealer'
                                }

                                content += '" onclick="gacode(\'子类车型综述页\',\'推荐经销商区块\',\'点击促销信息\',\'\');"><em>促</em>' + ele.article + '</a>'
                            }

                            content +='</li>';
                            number = index;

                            /*旧版经销商样式   删除*/
                            // content += '<li><div class="dealer-name"><a href="' + ele.dealerUrl + '">';

                            // //判断是否有价格
                            // if(ele.price){
                            //     content += '<p class="starting-price">' + ele.name + '</p><p>' + ele.address + '</p></a><a href="' + ele.commentPriceUrl + '" class="starting-price">' + ele.price + '<i>起</i></a>';
                            // }else{
                            //     content += '<p>' + ele.name + '</p><p>' + ele.address + '</p></a>';
                            // }

                            // content += '</div><div class="tags">';

                            // if(ele.tag1){
                            //     content += '<span>' + ele.tag1 + '</span>'
                            // }
                            // if(ele.tag2){
                            //     content += '<span>' + ele.tag2 + '</span>'
                            // }

                            // content += '</div>';

                            // //判断是否有促销活动
                            // if(ele.article){
                            //     content += '<div class="sales"><em>促销</em><a href="' + ele.articleUrl + '">' + ele.article + '</a></div>'
                            // }

                            // content += '<div class="price"><div><a class="button phone-button" href="tel:' + ele.phone + '">';

                            // //判断是否是付费经销商
                            // if(ele.vip){
                            //     content += ele.phone
                            // }else{
                            //     content +='点击联系经销商';
                            // }
                            // content += '</a></div><div><a href="' + ele.askPriceUrl + '" class="button askPrice-button" onclick="gacode(\'点击询底价按钮\',\'产品库_车型综述页\',\'推荐经销商\',\'tuijianDealer\');">询底价</a></div></div></li>'
                        })
                    }else{
                        content = res.data;
                    }

                }else{
                    content = '<li class="not">当前地区暂无经销商<span id="exchange_location">点击切换</span></li>';
                }

                //查看是否超过5个经销商 ? 显示加载更多 ：隐藏加载更多
                if(number >= 5){
                    result_list.nextElementSibling.classList.remove('hidden')
                }else{
                    result_list.nextElementSibling.classList.add('hidden')
                }

                //替换内容还是追加内容
                if(replace){
                    result_list.innerHTML = content;
                }else{
                    result_list.innerHTML += content;
                }

                // 显示共有几家经销商
                if(res.cityName){
                    _place.innerHTML =   res.cityName + '共有 <span id="total">' + res.total + '</span> 家经销商'
                }else{
                    _total && (_total.innerHTML = res.total);
                }
                // tags();
                result_list.page++;
                loadDealers.locked = false;
                // loading.classList.remove('visible');
                if(res == "" || res.data == ""){
                    loadDealers.locked = true;
                }

                //如果经销商为空，那么点击切换城市调出选地区弹层
                var exchange_location = document.querySelector('#exchange_location');
                if(exchange_location){
                    exchange_location.addEventListener('tap',function(){
                        //显示换地区弹层
                        exchangeLocation()
                    })
                }
                loadMore();
            },
            error: function () {
                locked = false;
                loading.classList.remove('visible');
            }
        })

    };

    if(result_list){
        loadDealers.options = {
            "subcateid":result_list.dataset['subcateid'],
            "seriesid":result_list.dataset['seriesid'],
            "provinceid":result_list.dataset['provinceid'],
            "cityid":result_list.dataset['cityid'],
            "brandid":result_list.dataset['brandid'],
            "proid":result_list.dataset['proid']
        }
        result_list.page = 2;
    }

    //降价经销商信息
    //function depreciateInfo(target){
    //    var depreciate_info = document.querySelector('#depreciate_info'),
    //        depreciate_location = document.querySelector('#depreciate_location'),
    //        depreciateProvince = document.querySelector('#depreciateProvince'),
    //        depreciate         = document.querySelector('#depreciate');
    //
    //    if(depreciateProvince && depreciate_location){
    //        depreciateProvince.innerHTML = depreciate_location.lastElementChild.innerHTML;
    //    }
    //    if(depreciate_info){
    //        if(target){
    //            depreciate_info.dataset['provinceid'] = target.dataset['provinceid'];
    //            depreciate_info.dataset['cityid']     = target.dataset['fid'];
    //        }else{
    //            depreciate_info.dataset['provinceid'] = loadDealers.options.provinceid;
    //            depreciate_info.dataset['cityid']     = loadDealers.options.cityid;
    //        }
    //        $.ajax({
    //            url:depreciate_info.dataset['ajaxurl'],
    //            data:depreciate_info.dataset,
    //            dataType:'json',
    //            success:function(res){
    //                if(res){
    //                    depreciate_info.classList.remove('empty-list');
    //                    depreciate.parentNode.removeAttribute('style');
    //                    var content = '',
    //                        number  = 0;
    //                    res.forEach(function(ele,index){
    //                        if(index >= 5){
    //                            content += '<li class="hide">';
    //                        }else{
    //                            content += '<li>';
    //                        }
    //                        content += '<a href=' + ele.Url + '><div class="truck-name">';
    //
    //                        if(ele.isHot == 1){
    //                            content += '<em>人气</em>';
    //                        }
    //
    //                        content += ele.proName + '<div class="tags upgrade-tags">';
    //
    //                        if(ele.param){
    //                            for(var key in ele.param){
    //                                if(ele.param[key].val !== ''){
    //                                    content += '<span>' + ele.param[key].val + '</span>'
    //                                }
    //                            }
    //                        }
    //                        // if(ele.param.length){
    //                        //     ele.param.forEach(function(obj,index){
    //                        //         if(obj.val !== ''){
    //                        //             content += '<span>' + obj.val + '</span>'
    //                        //         }
    //                        //     })
    //                        // }
    //                        content += '</div></div><p><span>' + ele.price + '万</span><span>' + ele.oldPrice + '万</span><b>降' + ele.cutPrice + '万</b></p><div class="dealer-name"><span>' + ele.name +'</span><em>' + ele.saleStregion + '</em><em>' + ele.F_Level + '</em></div></a><div class="price"><div><a href="tel:' + ele.phone + '" class="button phone-button" >'
    //
    //                        // 查看是否是付费经销商
    //                        if(ele.phone.indexOf('400') !== -1){
    //                            content += ele.phone;
    //                        }else{
    //                            content += '点击联系经销商';
    //                        }
    //
    //                        content += '</a></div><div><a href="' + ele.askPriceUrl + '" class="button askPrice-button" onclick="gacode(\'点击询底价按钮\', \'产品库_车型综述页\', \'降价信息\',\'jiangjiaInfo\');">询底价</a></div></li>';
    //                        number = index;
    //                    })
    //
    //                    if(number >= 5){
    //                        depreciate.classList.add('show');
    //                    }else{
    //                        depreciate.classList.remove('show');
    //                    }
    //                    depreciate_info.innerHTML = content;
    //
    //                }else{
    //                    depreciate.parentNode.style.display = 'none';
    //                }
    //            },
    //            error:function(){
    //
    //            }
    //        })
    //    }
    //}

    //二期不需要滚动加载，增加data-isscroll = false 禁止滚动加载
    Container.addEventListener('scroll', function () {
        if (result_list && !result_list.dataset['isscroll'] && result_list.getBoundingClientRect().bottom <= document.documentElement.offsetHeight + 162 && !loadDealers.locked){
            loadDealers();
        }
    });



    if(_location && !_location.pos) _location.pos = {};
    // 198-234
    // sidebar && sidebar.addEventListener('tap',function(e){
    //     var target = e.target;
    //     try{
    //         if(!_location.pos) _location.pos = {};
    //         if(target.tagName == 'LI'){
    //             exports.unclick();
    //             if(_location.regionType !== 'city'){
    //                 _location.regionType = 'city';
    //                 var provinceid = target.dataset['provinceid'],
    //                     provincename = target.innerHTML;
    //                 region.data = {'provinceid':provinceid}
    //                 region.get();
    //                 _location.lastElementChild.innerHTML = '';
    //                 _location.firstElementChild.innerHTML = provincename;
    //                 loadDealers.options['provinceid'] = provinceid;
    //                 loadDealers.options['cityid'] = 0;
    //                 _location.pos['province'] = {"id":provinceid,"name":provincename};
    //                 _location.pos['city'] = {};
    //             }else{
    //                 var cityid = target.dataset['cityid'],cityname = target.innerHTML;
    //                 region.hide('select-model');
    //                 _location.lastElementChild.innerHTML = cityname;
    //                 loadDealers.options['cityid'] = cityid;
    //                 _location.pos['city'] = {"id":cityid,"name":cityname};
    //             };
    //             loadDealers.locked = false;
    //             result_list.page = 1;
    //             loadDealers('replace',target);

    //             //获取当前时间，存入cookie，
    //             _location.pos['date'] = new Date();

    //             localStorage.setItem('my_region',JSON.stringify(_location.pos));
    //         }
    //     }catch(e){
    //     }
    // });

    //常用地区渲染
    function oftenCity(){
        try{
            var cityDate = JSON.parse(localStorage.getItem('my_city')),
                hot_location = document.querySelector('#hot_location ul'),
                content      = "",
                often_city   = JSON.parse(localStorage.getItem('often_city'));
            if(cityDate){
                if(often_city){
                    content = '<li><span class="active" data-provinceid="' + often_city.Fid + '" data-provincename="' + often_city.Fname + '" data-Fid="'+ often_city.id +'">' + often_city.name + '</span></li>';
                }
                cityDate.forEach(function(element, index) {
                    content += '<li><span  data-provinceid="' + element.Fid +'"data-provincename="' + element.Fname + '" data-Fid="'+ element.id +'">' + element.name + '</span></li>';
                });
                hot_location.innerHTML = content;
            }else{
                if(often_city){
                    content = '<li><span class="active" data-provinceid="' + often_city.Fid + '" data-provincename="' + often_city.Fname + '" data-Fid="'+ often_city.id +'">' + often_city.name + '</span></li>';
                    hot_location.innerHTML = content;
                }
            }
        }catch(e){

        }
    };

    // 显示换地区弹层
    function exchangeLocation(){
        select_location.classList.add('show');
        oftenCity()

        //取消搜索弹层 && 清空搜索输入框
        var shade           = document.querySelector('#shade'),
            input           = document.querySelector('#search_location input'),
            location_model  = document.querySelector('#location_model'),
            index_nav       = document.querySelector('#index_nav');

        shade && shade.classList.contains('show') && shade.classList.remove('show');
        input && (input.value = '');
        if(!select_location.scrollTop || select_location.scrollTop !== 0){
            index_nav.style.cssText = 'transform: translate3d(0px,' + location_model.getBoundingClientRect().top + 'px, 0px);'
        }
    }

    //点击报价模块参考价格换地区，显示换地区弹层
    ref_location && ref_location.addEventListener('tap',function(){
        exchangeLocation()
    })

    // 点击地区渲染常用地区
    _location && _location.addEventListener('tap',function(){
        oftenCity();
    })


    var add_comparison  = document.querySelector('#add_comparison'),
        to_compare      = document.querySelector('#to_compare');

    add_comparison && add_comparison.addEventListener('tap',function(){
        exports.unclick();
        if(exports.compare.add(to_compare,this.dataset['id'],to_compare.lastElementChild)){
            this.classList.add('join');
            this.innerHTML = '\u5df2\u52a0\u5165'; // 已加入
        }else{
            if(!this.classList.contains('join')) return;
            this.classList.remove('join');
            this.innerHTML = '\u5bf9\u6bd4'; // 对比
        }
    });

// 地区选择1.1
//            选择地区城市选择弹出框
    function selectCity() {
        var location_model  = document.querySelector('#location_model'),        //选择城市模块
            select_location = document.querySelector("#select_location"),       //选择地区弹出框
            o               = "",                                               //参数
            sidebar         = document.querySelector("#sidebar"),               //侧边栏
            search_location = document.querySelector("#search_location"),       //搜索模块
            hot_location    = document.querySelector("#hot_location"),          //热门模块
            prompts         = document.querySelector('#prompts'),               //搜索结果模块
            location_back   = document.querySelector('#location_back'),         //获取返回按钮
            result_list     = document.querySelector("#result_list"),           //经销商列表
            provincename,                                                       //定义省份名称
            provinceid,                                                         //定义省份id
            getTop,                                                             //定义location_model到顶部和到底部的距离
            getBottom;
        if (sidebar) {
            var region = new exports.sidebar({
                'ajaxurl': location_model.dataset['ajaxurl'],
                render: function (data) {
                    var content = '<header><span class="close">关闭</span><h4>' + provincename + '</h4></header><div class="location-model"><ul>';
                    if(data == ''){
                        sidebar.firstElementChild.innerHTML = content;
                        var empty_list = sidebar.querySelector('ul');
                        empty_list.innerHTML = '';
                        empty_list.classList.add('empty-list');
                        return;
                    }
                    data = JSON.parse(data);
                    data.forEach( function(res) {
                        content += '<li data-Fid=' + res.F_Id + '>' + res.F_CityName + '</li>'
                    });
                    content += "</ul></div>"
                    sidebar.firstElementChild.innerHTML = content;
                }
            });
            location_back && location_back.addEventListener('tap',function(){
                region.hide();
            })
        }
        location_model && location_model.addEventListener('tap', function (event) {
            var target = event.target,
                active = location_model.querySelector('.selected');
            if (target.tagName == 'LI') {

                active && active.classList.remove('selected');
                target.classList.add('selected');

                region.data = target.dataset;
                region.get().show('select_city');

                //dataValue(target);//询底价页面保存省市

                exports.unclick();
                provinceid = target.dataset['provinid'];
                provincename = target.innerHTML;

                //存储选中城市
                _location.lastElementChild.innerHTML = '';
                _location.firstElementChild.innerHTML = provincename;
                //存储参考价选择城市
                ref_location.lastElementChild.innerHTML = '';
                ref_location.firstElementChild.innerHTML = provincename;


                loadDealers.options['provinceid'] = provinceid;
                loadDealers.options['cityid'] = 0;
                _location.pos['province'] = {"id":provinceid,"name":provincename};
                _location.pos['city'] = {};
                loadDealers.locked = false;
                result_list.page = 1;

                //加载经销商
                loadDealers('replace',target);

                //获取地区参考价
                refRuote(target)


                //保存location_model到顶部和到底部的距离
                getTop    = location_model.getBoundingClientRect().top;
                getBottom = location_model.getBoundingClientRect().bottom;

                // 获取当前时间，存入cookie，
                _location.pos['date'] = new Date();

                //存入localStorage 和 cookie
                localStorage.setItem('my_region',JSON.stringify(_location.pos));

                // var now = new Date();
                // var date = new Date(now.getFullYear() +'/' + (now.getMonth()+1) + '/' + (now.getDate() + ' 23:59:59'));
                // var cityId = {"provinceid":provinceid,"cityid":''};
                // document.cookie = "selected_city=" + JSON.stringify(cityId) + "; expires= " + date.toGMTString()  + "; Path=/" ;
            }

        });
        sidebar && sidebar.addEventListener('click', function (event) {
            if(sidebar.classList.contains('select_city')){
                var target = event.target;

                if (target.tagName == 'LI') {
                    var active = sidebar.querySelector('.selected'),
                        cityid = target.dataset['fid'],
                        cityname = target.innerHTML;
                    cityTransmit(target)    //选择城市请求
                    cityStorage();          //存储选择城市
                    oftenCity();            //常用城市渲染

                    // 点击市发送请求
                    function cityTransmit(target){
                        active && active.classList.remove('selected');
                        target.classList.add('selected');
                        region.hide('select_city');

                        //dataValue(target);//询底价页面保存省市

                        _location.lastElementChild.innerHTML = cityname;

                        //参考价城市
                        ref_location.lastElementChild.innerHTML = cityname;

                        loadDealers.options['cityid'] = cityid;
                        _location.pos['city'] = {"id":cityid,"name":cityname};

                        loadDealers.locked = false;
                        result_list.page = 1;

                        //加载经销商
                        loadDealers('replace',target);

                        //关闭换地区弹层
                        select_location.classList.remove('show');

                        //获取地区参考价
                        refRuote(target)

                        // 获取当前时间，存入cookie，
                        _location.pos['date'] = new Date();
                        localStorage.setItem('my_region',JSON.stringify(_location.pos));

                        // var now = new Date();
                        // var date = new Date(now.getFullYear() +'/' + (now.getMonth()+1) + '/' + (now.getDate() + ' 23:59:59'));
                        // var cityId = {"provinceid":_location.pos.province.id,"cityid":cityid};
                        // document.cookie = "selected_city=" + JSON.stringify(cityId) + "; expires= " + date.toGMTString()  + "; Path=/" ;
                    }

                    //存储常用地区cookie
                    function cityStorage(){
                        var cityDate,
                            number = 0,
                            hot_location = JSON.parse(localStorage.getItem('often_city')),
                            cityString = {'id':cityid,'name':cityname,'Fid':provinceid,'Fname':provincename};

                        if(hot_location && hot_location.name !==cityname){
                            if(localStorage.getItem('my_city')){
                                var cityDate = JSON.parse(localStorage.getItem('my_city'));
                                if(localStorage.getItem('my_city').indexOf(cityname) == -1){
                                    if(cityDate.length >= 5){
                                        cityDate.shift();
                                    }
                                    cityDate.push(cityString);
                                    localStorage.setItem('my_city',JSON.stringify(cityDate))
                                }
                            }else{
                                var arr = [];
                                arr.push(cityString);
                                localStorage.setItem('my_city',JSON.stringify(arr))
                            }
                        }
                    }
                }
                return;
            }
        });

        select_location && select_location.addEventListener('scroll', function () {
            if((getTop - location_model.getBoundingClientRect().top) >= 10 || (location_model.getBoundingClientRect().bottom - getBottom) >= 10 ){
                hasShow();
            }


        });
        search_location && search_location.addEventListener('tap', function () {
            hasShow();
        });
        hot_location && hot_location.addEventListener('click', function (event) {
            hasShow();
            var target = event.target;
            if (target.tagName == 'SPAN') {
                searchLocation(target)

                //     result_list.page = 1 ;              //重置page
                //     loadDealers.locked = false;

                //     //更改发送地区参数
                //     loadDealers.options['provinceid'] = target.dataset['provinceid'];
                //     loadDealers.options['cityid'] = target.dataset['fid'];

                //     // 选择地区地址变化
                //     _location.firstElementChild.innerHTML = target.dataset['provincename'];
                //     _location.lastElementChild.innerHTML = target.innerHTML;

                //         //存储参考价选择城市
                //     ref_location.firstElementChild.innerHTML = target.dataset['provincename'];
                //     ref_location.lastElementChild.innerHTML = target.innerHTML;

                //     // 取消选择地区弹层
                //     select_location.classList.remove('show');

                //     loadDealers('replace');              // 加载经销商信息

                //     refRuote(target)                    //获取地区参考价

                //     //保存省市cookie
                //     var cityDate = {};
                //     cityDate.province = {"id":target.dataset['provinceid'],"name":target.dataset['provincename']};
                //     cityDate.city = {"id":target.dataset['fid'],"name":target.innerHTML};
                //     cityDate.date = new Date();
                //     localStorage.setItem('my_region',JSON.stringify(cityDate));

                //     var now = new Date();
                //     var date = new Date(now.getFullYear() +'/' + (now.getMonth()+1) + '/' + (now.getDate() + ' 23:59:59'));
                //     var cityId = {"provinceid":target.dataset['provinceid'],"cityid":target.dataset['fid']};
                //     document.cookie = "selected_city=" + JSON.stringify(cityId) + "; expires= " + date.toGMTString()  + "; Path=/" ;
            }
        });

        prompts && prompts.addEventListener('click',function(event){
            var target = event.target;
            if(target.tagName == 'LI'){
                searchLocation(target)
            }

        })

        //点击 热门地区模块和地区搜索模块
        function searchLocation(target){
            hasShow();
            select_location.classList.remove('show');

            result_list.page = 1 ;              //重置page
            loadDealers.locked = false;

            //更改发送地区参数
            loadDealers.options['provinceid'] = target.dataset['provinceid'];
            loadDealers.options['cityid'] = target.dataset['fid'];

            // 选择地区地址变化
            _location.firstElementChild.innerHTML = target.dataset['provincename'];
            _location.lastElementChild.innerHTML = target.innerHTML;

            loadDealers('replace')           //加载经销商


            //保存省市cookie
            var cityDate = {};
            cityDate.province = {"id":target.dataset['provinceid'],"name":target.dataset['provincename']};
            cityDate.city = {"id":target.dataset['fid'],"name":target.innerHTML};
            cityDate.date = new Date();
            localStorage.setItem('my_region',JSON.stringify(cityDate));

            // var now = new Date();
            // var date = new Date(now.getFullYear() +'/' + (now.getMonth()+1) + '/' + (now.getDate() + ' 23:59:59'));
            // var cityId = {"provinceid":target.dataset['provinceid'],"cityid":target.dataset['fid']};
            // document.cookie = "selected_city=" + JSON.stringify(cityId) + "; expires= " + date.toGMTString()  + "; Path=/" ;
        }

        function hasShow() {
            if (sidebar.classList.contains('select_city')) {
                region.hide();
            }
        }

        // 询底价页面保存省市
        // function dataValue(target){
        //     if(location_model.classList.contains('footerPrice')){
        //         document.querySelector("input[name='pid']").value = target.dataset['id'];
        //         document.querySelector("input[name='cid']").value = target.dataset['id'];
        //     }
        // }
    };
    selectCity();

    //图片页面换车型
    function exchangeModel(){

        var exchange_model = document.querySelector('#exchange_model');
        var car_model = document.querySelector('#car_model');

        if(exchange_model && car_model){

            //点击显示换车型弹层
            exchange_model && exchange_model.addEventListener('tap',function(){
                car_model.classList.add('visible');
            });

            //推荐切换车型
            var recommend_model = document.querySelector('#recommend_model');
            recommend_model && recommend_model.addEventListener('tap',function(){
                car_model.classList.add('visible');
            });

            //点击关闭换车型弹层
            var back_container = document.querySelector('#back_container');
            back_container && back_container.addEventListener('click',function(){
                car_model.classList.remove('visible');
            })
        }

    }
    exchangeModel();

    // 加载更多图片
    function loadFigures(){
        if(loadFigures.locked) return;
        loadFigures.locked = true;
        loading.classList.add('visible');
        $.ajax({
            url:gallery.dataset['ajaxurl'],
            data:{'page':loadFigures.page},
            dataType:'json',
            success:function(res){
                if(res && res.ishave){
                    loadFigures.page++;
                    loadFigures.locked = false;
                    gallery.innerHTML += res.imgs;
                }
                loading.classList.remove('visible');
            },
            error:function(){
                loadFigures.locked = false;
                loading.classList.remove('visible');
            }
        });
    };

    //进入看图模式
    function lookPhoto(){
        var save_image = document.querySelector('#save-image');
        save_image && save_image.addEventListener('tap',function(event){
            var target = event.target;
            if(target.tagName !== 'A'){
                Container && Container.classList.contains('look-photo') ? Container.classList.remove('look-photo') : Container.classList.add('look-photo');
                var footer = document.querySelector('.save-photo-price');
                footer && footer.classList.contains('look-photo') ? footer.classList.remove('look-photo') : footer.classList.add('look-photo');
            }
        })
    }
    lookPhoto();

    function setImageWidth(img){
        var w = (document.documentElement.offsetWidth - 24) / 2;
        var h = parseInt(w/240*160) - 4;
        // img.parentElement.style.cssText = 'height:'+ h +'px;line-height:' + (h-4) + 'px';
    }

    document.querySelector('.photo') && document.querySelector('.photo').querySelectorAll('img').forEach(setImageWidth);
    var gallery = document.querySelector("#gallery");
    gallery && gallery.querySelectorAll('img').forEach(setImageWidth);

    loadFigures.page = 2;
    Container.addEventListener('scroll', function () {
        if(gallery && gallery.getBoundingClientRect().bottom <= document.documentElement.offsetHeight + 162 && !gallery.locked)
            loadFigures();

        if (result_list && !result_list.dataset['isscroll'] && result_list.getBoundingClientRect().bottom <= document.documentElement.offsetHeight + 162 && !loadDealers.locked)
            loadDealers();
    });

    // 加入对比
    var to_compare = document.querySelector('#to_compare');
    function Compare(){
        var compare_button = document.querySelectorAll('.compare-button')
        compare_button && compare_button.addEventListener('click',function(e){
            var target = e.target;
            if(target.tagName == 'SPAN' && target.classList.contains('compare-button') && !target.classList.contains('disabled')){
                exports.unclick();
                if(exports.compare.add(to_compare,target.dataset['id'],to_compare.lastElementChild)){
                    target.classList.add('join');
                    target.innerHTML = '\u5df2\u52a0\u5165'; // 已加入
                }else{
                    if(!target.classList.contains('join')) return;
                    target.classList.remove('join');
                    target.innerHTML = '\u5bf9\u6bd4'; // 对比
                }
            }
        });
    }
    Compare();
    // 去对比
    if(to_compare){
        document.body.appendChild(to_compare);
        to_compare.addEventListener('click',function(e){
            e.preventDefault();
            exports.compare.clearTask();    // 清除
            if(!this.firstElementChild.innerHTML.trim())
                to_compare.href = to_compare.href + add_comparison.dataset['id'] + '/';

            to_compare.delay && clearTimeout(to_compare.delay);
            to_compare.delay = setTimeout(function(){
                location.href = to_compare.href;
            },200);
        });
        exports.compare.recoveryTask(to_compare,to_compare.lastElementChild);
    };


    function initRegion(o){
        if(!o || !loadDealers.options) return;
        loadDealers.options['provinceid'] = o['province'].id;

        //存储选择的城市
        _location.firstElementChild.innerHTML = o['province'].name;
        ref_location.firstElementChild.innerHTML = o['province'].name;

        if(o['city'].id && o['city'].name){
            loadDealers.options['cityid'] = o['city'].id;

            //存储选择的城市
            _location.lastElementChild.innerHTML = o['city'].name;
            ref_location.lastElementChild.innerHTML = o['city'].name;
        }
        result_list.page = 1;
        loadDealers('replace');

        // 页面刷新发送请求，替换暂无状态
        //var tab_content = document.querySelector('#tab_content');
        //if(tab_content){
        //    var replaceData = {'subcateid':loadDealers.options['subcateid'],'seriesid':loadDealers.options['seriesid'],'provinceid':loadDealers.options.provinceid,'cityid':loadDealers.options.cityid};
        //    replace(replaceData)
        //}
    };
    exports.region && exports.region(initRegion);
});