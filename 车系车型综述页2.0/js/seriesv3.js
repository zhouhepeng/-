/**
 * @description 子类车系综述页
 * @authors HP(hepeng.zhou@360che.com)
 * @date    2016-04-29 16:23:32
 * @version v2.0
 */
define(function(require,exports){
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

    //口碑模块显示评价的行数
    !function(){
        var evaluate = document.querySelector('#evaluate');
        if(evaluate){
            if(evaluate.firstElementChild.offsetHeight == 21){
                evaluate.children[1].style.cssText = '-webkit-line-clamp:3;'
            }else if(evaluate.firstElementChild.offsetHeight == 42){
                evaluate.children[1].style.cssText = '-webkit-line-clamp:2;'
            }else{
                evaluate.children[1].style.cssText = '-webkit-line-clamp:1;'
            }

            if(evaluate.children[1].offsetHeight == 21){
                evaluate.children[2].style.cssText = '-webkit-line-clamp:2;'
            }else if(evaluate.children[1].offsetHeight == 42){
                evaluate.children[2].style.cssText = '-webkit-line-clamp:1;'
            }

            if(evaluate.children[2].offsetHeight == 21){
                evaluate.children[3].style.cssText = '-webkit-line-clamp:1;'
            }

        }
    }();

    // 星级状态
    var average = document.querySelector('#average');
    function averageInit(){
        var score = parseFloat(average.dataset['score']);
        var z = Math.floor(score),
            p = (score - z)*65;
        average.children.forEach(function(star,index){
            if(index < z)
                star.classList.add('full');
        });
        average.children[z].innerHTML += '<i style="width:'+ p +'%">\u661f</i>'
    };
    average && averageInit();

    //点击车型报价标签切换
    function tagsReplace(){
        var type_labels = document.querySelectorAll('.type-labels');
        type_labels && type_labels.addEventListener('tap',function(event){
            var target = event.target;
            if(target.tagName == 'SPAN'){
                gacode('子类车系综述页','点击筛选按钮','','')

                //标签切换
                this.querySelector('.active').classList.remove('active')
                target.classList.add('active');

                //内容切换
                this.parentNode.querySelector('.visible').classList.remove('visible')
                this.parentNode.querySelector('#' + target.dataset['id']).classList.add('visible')
            }
        })
    };
    tagsReplace();

    // 点击选择城市后请求车型报价，选出地区热门车型
    function tabContent(target,Data){
        var tab_content = document.querySelector('#tab_content'),
            tab_title   = document.querySelector('#tab_title'),
            cityname,
            o = {};
        o.subcateid = tab_content.dataset['subcateid'];
        o.seriesid = tab_content.dataset['seriesid'];

        if(!Data){
            //选择省份保存参数
            if(target.dataset['provinid']){
                tab_content.setAttribute('data-provinid',target.dataset['provinid'])
            }

            o.provinceid = tab_content.dataset['provinid'];

            // 选择城市
            if(target.dataset['fid']){
                o.cityid = target.dataset['fid'];
            }

            //点击热门地区和搜索地区
            if(target.dataset['provinceid'] && target.dataset['fid']){
                o.provinceid = target.dataset['provinceid']
                o.cityid = target.dataset['fid'];
            }
            cityname = target.innerHTML;
        }else{
            o = Data;
            cityname = o.cityname
        }

        $.ajax({
            url:tab_content.dataset['ajaxurl'],
            type:'get',
            data:o,
            dataType:'json',
            success:function(data){
                if(data){
                    removePrice()
                    for(var ele in data){
                        var proid = document.querySelector('#lowprice' + data[ele].productId),
                            product = document.querySelector('#product' + data[ele].productId),
                            name,
                            parent;


                        if(proid){
                            parent = product.parentNode;
                            name   = product.querySelector('h5');

                            var start = '起';
                            if(data[ele].hot){
                                if(data[ele].hot == 1){

                                    if(cityname.indexOf('市') !== -1){
                                        cityname = cityname.slice(0,cityname.length-1)
                                    }
                                    name.innerHTML = '<em class="hot-type">[' + cityname + '热门]</em>' + name.innerHTML
                                }
                                start = ''
                            }

                            proid.innerHTML =  '<a href="' + data[ele].url + '" class="city-price">' + data[ele].price + start + '</a>';

                            product.classList.contains('hidden') && product.classList.remove('hidden');
                            parent.insertBefore(product,parent.firstElementChild)

                            if(parent && parent.nextElementSibling && parent.nextElementSibling.classList.contains('load-more')){
                                var li = parent.querySelectorAll('li:not([class="hidden"])');
                                if(li.length > 10){
                                    li[li.length - 1].classList.add('hidden')
                                }
                            }

                        }
                    }
                }else{
                    removePrice()
                }

                // 去掉已有的热门车型和价格
                function removePrice(){
                    var proid = document.querySelectorAll('.city-price');
                    var hot_type = document.querySelectorAll('.hot-type');
                    proid.forEach(function(ele, index) {
                        ele.parentNode.removeChild(ele)
                    });
                    hot_type.forEach(function(ele, index) {
                        ele.parentNode.removeChild(ele)
                    });
                }
                //     var content = '';
                //     var header = '车型报价';
                //     var tags = '';
                //     var number = 0;     //计算在售停售和未上市的下标

                //     // 在售是否为0
                //     if(data[1].total > 0){
                //        header += '<span class="visible">共 <em>' + data[1].total + '</em> 款<i>在售</i>车型</span>'
                //        tags += '<span class="selected" data-index="' + number + '">在售</span>'
                //        number += 1;
                //     }

                //     // 停售是否为0
                //     if(data[4].total > 0){
                //        header +=  '<span>共 <em>' + data[4].total + '</em> 款<i>停售</i>车型</span>'
                //        tags += '<span data-index="' + number + '">停售</span>'
                //        number += 1;
                //     }

                //     // 未上市是否为0
                //     if(data[3].total > 0){
                //        header +=  '<span>共 <em>' + data[4].total + '</em> 款<i>未上市</i>车型</span>'
                //        tags += '<span data-index="' + number + '">未上市</span>'
                //     }


                //     var h3 = document.querySelector('#quote header h3');
                //     h3.innerHTML = header;
                //     tab_title.innerHTML = tags

                //     // content +=  '<header class="subtitle"><div id="tab_title" class="tab-title"><span class="selected" data-index="0">在售</span><span class="" data-index="1">停售</span></div><h3>车型报价<span class="visible">共 <em>' + data[1].total + '</em> 款<i>在售</i>车型</span><span>共 <em>' + data[4].total + '</em> 款<i>停售</i>车型</span></h3></header><div id="tab_content" class="tab-content">';
                //     for(var key in data){
                //         var state;
                //         if(key == 1){
                //             state = 'sell';
                //             content += '<div class="dealer-module-wrap visible">';
                //         }else{
                //             state = 'stop';
                //             content += '<div class="dealer-module-wrap">'
                //         }

                //         content += '<div class="type-labels">';
                //         //新建数组，存放标签类别。
                //         var tabs = [];
                //         for(k in data[key].list){
                //             tabs.push(k);
                //         }
                //         // 循环数组，渲染标签类别
                //         tabs.forEach(function(element, index) {
                //             if(index == 0){
                //                 content += '<div><span class="active" data-id="' + state + index + '">' + element + '</span></div>'
                //             }else{
                //                 content += '<div><span data-id="' + state + index + '">' + element + '</span></div>'
                //             }
                //         });
                //         content +=  '</div>';

                //         //循环标签类型次数
                //         var number = 0;
                //         for(k in data[key].list){

                //             if(number == 0){
                //                 content += '<div id="' + state + number + '" class="visible">'
                //             }else{
                //                 content += '<div id="' + state + number + '">'
                //             }
                //             content += '<ul class="truck-info">'

                //             var more;
                //             //循环地区热门车型和普通车型
                //             for(var i in data[key].list[k]['show']){
                //                 // 循环具体车型列表
                //                 data[key].list[k]['show'][i].forEach( function(ele, index) {
                //                     more = index;
                //                     if(index >= 10){
                //                         content += '<li class="hidden">'
                //                     }else{

                //                         content += '<li>'
                //                     }

                //                     content +='<a href="/m' + Math.floor(ele.F_ProductId/250) + '\/' + ele.F_ProductId + '_index.html" onclick="gacode(\'子类车系综述页\',\'报价区块\',\'车型\',\'\');"><div class="truck-name"><h5>';

                //                     //判断是不是地区热门
                //                     if(ele.isHot == 1){
                //                         content += '<em>[' + target.innerHTML + '热门]</em>'
                //                     }

                //                     content += ele.speaclProName + '</h5><div class="tags"><div class="tag-list">'

                //                     //循环标签
                //                     ele.paramDetail && ele.paramDetail.forEach( function(element, index) {
                //                         content += '<span>' + element + '</span>'
                //                     });

                //                     content += '</div><span class="guide-price">厂商指导价：'

                //                     //判断指导价是否是暂无
                //                     if(ele.F_Price == 0){
                //                         content += '暂无</span>'
                //                     }else{
                //                         content += ele.F_Price + '万</span>'
                //                     }
                //                     content += '</div></div>'

                //                     //判断有没有参考价
                //                     if(ele.areaPrice){
                //                         var starting = '起';

                //                         if(ele.vip){
                //                             starting = '';
                //                         }
                //                         content += '<p>' + ele.areaPrice
                //                         if(ele.areaPrice.indexOf('万') == -1){
                //                             content += '万' + starting
                //                         }else{
                //                             content += starting
                //                         }
                //                     }
                //                     content += '</p></a><aside class="price"><span class="compare-button" data-id="' + ele.F_ProductId + '" onclick="gacode(\'子类车系综述页\',\'点击加对比按钮\',\'\',\'\');">对比</span><a href="http://m.360che.com/ibp/index_p' + ele.F_ProductId + '.html" onclick="gacode(\'点击询底价按钮\',\'产品库_子类车系综述页\',\'车型区块\',\'\');" rel="nofollow">询底价</a></aside></li>'

                //                 });
                //             }
                //             content += '</ul>';
                //             //判断有没有更多
                //             if(more >= 10){
                //                 content += '<div class="load-more" >点击加载更多</div>'
                //             }
                //             content += '</div>';
                //             number++
                //         }
                //         content += '</div>';
                //     }
                //     tab_content.innerHTML = content;

                //     //默认设置为在售状态
                //     // tab_title.querySelector('.selected').classList.remove('selected');
                //     // tab_title.firstElementChild.classList.add('selected');

                //     //点击车型报价标签切换
                //     tagsReplace();

                //     //添加对比
                //     Compare();

                //     //点击显示更多
                //     loadMore();

                //     //恢复对比方法
                //     if(localStorage){
                //         var t = localStorage.getItem('compareTask');
                //     }
                //     var data = JSON.parse(t);
                //     for(var key in data){
                //         if(data[key].length){
                //             data[key].forEach( function(ele) {
                //                 var _button = document.querySelector('span[data-id="'+ ele +'"]');
                //                 if(_button){
                //                     _button.classList.add('join');
                //                     _button.innerHTML = '\u5df2\u52a0\u5165';
                //                 }
                //             });
                //         }
                //     }
            }
        })
    }

    // 插入到body下
    function moveElement(){
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


    // 不固定内容收起展开
    function brandFold(){
        var brand_fold = document.querySelector('#brand_fold'),
            fold_content = document.querySelector('#more_brand'),
            height;
        fold_content &&(height = window.getComputedStyle(fold_content).height) && (fold_content.style.height = 0);
        if(brand_fold){

            brand_fold.addEventListener('click',function(){
                if(brand_fold.classList.contains('unfold')){
                    brand_fold.classList.remove('unfold');
                    brand_fold.querySelector('em').innerHTML= '展开';
                    fold_content.style.height = 0;

                }else{
                    brand_fold.classList.add('unfold');
                    brand_fold.querySelector('em').innerHTML= '收起';
                    fold_content.style.height = height;
                }
            })
        }
    }
    // brandFold();

    var tab_content = document.querySelector('#tab_content'),
        Container   = document.querySelector('.container'),
        gallery     = Container.querySelector('#gallery'),
        sidebar     = document.querySelector('#sidebar'),
        result_list = Container.querySelector('#result_list'),
        _location   = Container.querySelector('#location'),
        _total      = Container.querySelector('#total');
    if(_total){
        var _place = _total.parentNode;
    }

    // 点击选地区渲染常用地区
    _location && _location.addEventListener('click',function(){
        oftenCity();
    })

    function seriesTabs(t,content){
        exports.unclick();
        var selected = t.parentElement.querySelector('.selected');
        selected && selected.classList.remove('selected');
        t.classList.add('selected');
        if(t.dataset['index']){
            var content_visible = content.querySelector('.visible');
            content_visible && content_visible.classList.remove('visible');
            content.children[t.dataset['index']].classList.add('visible');
        }
    };

    //点击在售和停售 tab切换
    !function(){
        var tab_title = document.querySelector("#tab_title");
        var tab_content = document.querySelector('#tab_content');
        tab_title && tab_title.addEventListener('tap',function(event){
            var target = event.target;
            if(target.tagName == 'SPAN'){
                tab_title.querySelector('.selected') && tab_title.querySelector('.selected').classList.remove('selected')
                target.classList.add('selected')
                if(target.dataset['index'] == 0){
                    tab_content.lastElementChild.classList.remove('visible');
                    tab_content.firstElementChild.classList.add('visible');
                }else{
                    tab_content.firstElementChild.classList.remove('visible');
                    tab_content.lastElementChild.classList.add('visible');
                }

                //切换在售和停售和数量
                var span = this.nextElementSibling.querySelectorAll('span');
                this.nextElementSibling.querySelector('.visible').classList.remove('visible')
                span[target.dataset['index']].classList.add('visible')
            }
        })
    }();


    // 福田618活动

    function FOTON(){
        var locationUrl = window.location.href,
            index = locationUrl.indexOf('_64_index');

        if(window.brandId || index != -1){
            var truck_details = document.querySelector('.truck-details'),
                activity_link = document.querySelector('.truck-details .truck-info .price');

            activity_link.innerHTML += '<a href="http://topic.360che.com/m/2016061601?utm_source=zongshu_sub_chexi&utm_medium=right_of_xundijia&utm_campaign=ad_in-resrc">买车先砍价,再减一万八&gt;&gt;</a>';
            truck_details.innerHTML += '<a class="foton618" href="http://topic.360che.com/m/2016061601?utm_source=zongshu_sub_chexi&utm_medium=banner&utm_campaign=ad_in-resrc"><img src="http://static.360che.com/product/images/foton618.jpg" alt="福田618购车节" /></a>';
        }
    }
    //FOTON()

    // 点击加载更多隐藏内容
    function loadMore(){
        var load_more = document.querySelectorAll('.load-more');
        load_more && load_more.addEventListener('tap',function(){
            exports.unclick();
            var me = this;
            if(this.dataset['type']){
                if(!this.dataset['index']){
                    gacode('子类车系综述页','点击查看更多经销商','点击一次','')
                }else{
                    gacode('子类车系综述页','点击查看更多经销商','点击两次','')
                }
            }else{
                if(!this.dataset['index']){
                    gacode('子类车系综述页','点击加载更多按钮','点击一次','')
                }else{
                    gacode('子类车系综述页','点击加载更多按钮','点击两次','')
                }
            }

            var list = this.previousElementSibling;
            list && list.querySelectorAll('.hidden').forEach(function(item,index){
                if(me.dataset['type'] && index < 5){
                    item.classList.remove('hidden');
                }else{
                    item.classList.remove('hidden');
                }
            });
            if(list.querySelectorAll('.hidden') && !list.querySelectorAll('.hidden').length){
                this.parentElement.removeChild(this);
            }else{
                this.setAttribute('data-index',2)
            }
        });
    }
    loadMore();

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
        document.body.appendChild(to_compare)
        to_compare.addEventListener('click',function(e){
            e.preventDefault();
            exports.compare.clearTask();    // 清除
            to_compare.delay && clearTimeout(to_compare.delay);
            to_compare.delay = setTimeout(function(){
                location.href = to_compare.href;
            },200);
        });
        exports.compare.recoveryTask(to_compare,to_compare.lastElementChild);
    };


    // 加载更多经销商
    function loadDealers(replace){
        if(loadDealers.locked) return;
        loadDealers.locked = true;
        loadDealers.options['page'] = result_list.page;

        $.ajax({
            url:result_list.dataset['ajaxurl'],
            data:loadDealers.options,
            dataType:'json',
            success:function(res){
                var content = '';
                var number;
                if(res){
                    if(res.length && !result_list.dataset['serve']){
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

                            content += '</div></a><aside class="dealer-tel"><a href="tel:' + ele.phone + '" rel="nofollow" onclick="gacode(\'子类车系综述页\',\'点击联系经销商\',\'\',\'\');">联系经销商</a><a href="' + ele.askPriceUrl + '" rel="nofollow" onclick="gacode(\'点击询底价按钮\',\'产品库_子类车系综述页\',\'经销商区块\',\'\');" rel="nofollow">询底价</a></aside>';

                            //判断是否有价格
                            if(ele.price){
                                content += '<a href="' + ele.commentPriceUrl + '" class="price"  onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'点击价格\',\'\');">' + ele.price + '起</a>'
                            }
                            content += '</div>';

                            //判断是否有促销活动
                            if(ele.article){
                                content += '<a href="' + ele.articleUrl + '" class="sales'

                                if(ele.vip){
                                    content += ' vip-dealer'
                                }

                                content += '" onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'点击促销信息\',\'\');"><em>促</em>' + ele.article + '</a>'
                            }
                            content +='</li>';
                            number = index;

                            /*旧版经销商样式   删除*/
                            // content += '<li><div class="dealer-name"><a href="' + ele.dealerUrl + '" onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'经销商\',\'\');">';

                            // // 判断是否有价格 给付费经销商增加icon图标
                            // var icon = '';
                            // if(ele.vip){
                            //     icon = '<em class="dealer-icon"></em>'
                            // }

                            // //判断是否有价格
                            // if(ele.price){
                            //     content += '<p class="starting-price">' + icon + ele.name + '</p><p>' + ele.address + '</p></a><a href="' + ele.commentPriceUrl + '" class="starting-price"  onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'点击价格\',\'\');">' + ele.price + '<i>起</i></a>';
                            // }else{
                            //     content += '<p>' + icon + ele.name + '</p><p>' + ele.address + '</p></a>';
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
                            //     content += '<div class="sales"><em>促销</em><a href="' + ele.articleUrl + '"  onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'点击促销信息\',\'\');">' + ele.article + '</a></div>'
                            // }

                            // content += '<div class="price"><div><a class="button phone-button" href="tel:' + ele.phone + '"  onclick="gacode(\'子类车系综述页\',\'推荐经销商区块\',\'400电话\',\'\');">';

                            // //判断是否是付费经销商
                            // if(ele.vip){
                            //     content += ele.phone
                            // }else{
                            //     content +='点击联系经销商';
                            // }
                            // content += '</a></div><div><a href="' + ele.askPriceUrl + '" class="button askPrice-button" onclick="gacode(\'点击询底价按钮\',\'产品库_子类车系综述页\',\'推荐经销商\',\'tuijianDealer\');">询底价</a></div></div></li>'
                        })
                    }else{
                        content = res.data;
                    }
                }else{
                    content = '<li class="not">当前地区暂无经销商<span id="exchange_location">点击切换</span></li>';
                }

                //查看是否超过十个经销商 ? 显示加载更多 ：隐藏加载更多
                if(number >= 5){
                    result_list.nextElementSibling.classList.remove('hidden')
                }else{
                    result_list.nextElementSibling.classList.add('hidden')
                    result_list.nextElementSibling.setAttribute('data-type','product')
                }

                //替换内容还是追加内容
                if(replace){
                    result_list.innerHTML = content;
                    if(loadDealers.options.cityid !== 0){
                        var time = setTimeout(function(){
                            ga('send', 'event', '子类车系综述页', '有推荐经销商区块', '',{
                                nonInteraction: true
                            });
                            // console.log('有推荐经销商区块')
                            clearTimeout(time)
                        },1000)
                        // })
                    }

                }else{
                    result_list.innerHTML += content;
                }
                // 显示共有几家经销商
                if(res.cityName && _place){
                    _place.innerHTML =   res.cityName + '共有 <span id="total">' + res.total + '</span> 家经销商'
                }else{
                    _total && (_total.innerHTML = res.total);
                }
                result_list.page++;
                loadDealers.locked = false;
                if(res == "" || res.data == ""){
                    loadDealers.locked = true;
                }

                //如果经销商为空，那么点击切换城市调出选地区弹层
                var exchange_location = document.querySelector('#exchange_location');
                if(exchange_location){
                    exchange_location.addEventListener('click',function(){
                        select_location.classList.add('show');
                        oftenCity()

                        //取消搜索弹层 && 清空搜索输入框
                        var shade           = document.querySelector('#shade'),
                            input           = document.querySelector('#search_location input'),
                            location_model  = document.querySelector('#location_model'),
                            index_nav       = document.querySelector('#index_nav');

                        shade && shade.classList.contains('show') && shade.classList.remove('show');
                        input && (input.value = '');
                        if(!select_location.scrollTop || select_location.scrollTop == 0){
                            index_nav.style.cssText = 'transform: translate3d(0px,' + location_model.getBoundingClientRect().top + 'px, 0px);-webkit-transform: translate3d(0px,' + location_model.getBoundingClientRect().top + 'px, 0px);'
                        }
                    })
                }
            },
            error: function () {
                locked = false;
            }
        })
    };

    if(result_list){
        loadDealers.options = {
            "subcateid":result_list.dataset['subcateid'],
            "seriesid":result_list.dataset['seriesid'],
            "provinceid":result_list.dataset['provinceid'],
            "cityid":result_list.dataset['cityid'],
            // "brandid":result_list.dataset['brandid'],
            // "proid":result_list.dataset['proid']
        }
        result_list.page = 2;
    }


    //图片页面换车型
    function exchangeModel(){
        //点击显示换车型弹层
        var exchange_model = document.querySelector('#exchange_model');
        var car_model = document.querySelector('#car_model');
        exchange_model && exchange_model.addEventListener('tap',function(){
            car_model.classList.add('visible');
        });

        //点击关闭换车型弹层
        var back_container = document.querySelector('#back_container');
        back_container && back_container.addEventListener('click',function(){
            car_model.classList.remove('visible');
        })


    }
    exchangeModel();

    // 加载更多图片
    function loadFigures(){
        if(loadFigures.locked) return;
        loadFigures.locked = true;
        var loading = document.querySelector('.loading')
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
        var w = 240;//(document.documentElement.offsetWidth - 24) / 2
        var h = 160//parseInt(w/240*160) - 4;
        // img.parentElement.style.cssText = 'height:'+ h +'px;line-height:' + h + 'px';
    }

    document.querySelector('.photo') && document.querySelector('.photo').querySelectorAll('img').forEach(setImageWidth);
    gallery && gallery.querySelectorAll('img').forEach(setImageWidth);

    loadFigures.page = 2;
    Container.addEventListener('scroll', function () {
        if(gallery && gallery.getBoundingClientRect().bottom <= document.documentElement.offsetHeight + 162 && !gallery.locked){
            loadFigures();
        }

        //二期不需要滚动加载，增加data-isscroll = false 禁止滚动加载
        // if (result_list && !result_list.dataset['isscroll'] && result_list.getBoundingClientRect().bottom <= document.documentElement.offsetHeight + 162 && !loadDealers.locked){
        //     loadDealers();
        // }
    });

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
    oftenCity();

// 地区选择1.1
//            选择地区城市选择弹出框
    if(_location && !_location.pos) _location.pos = {};
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
        location_model && location_model.addEventListener('click', function (event) {
            var target = event.target,
                active = location_model.querySelector('.selected');
            if (target.tagName == 'LI') {

                active && active.classList.remove('selected');
                target.classList.add('selected');

                region.data = target.dataset;
                region.get().show('select_city');


                // exports.unclick();
                provinceid = target.dataset['provinid'];
                provincename = target.innerHTML;
                _location.lastElementChild.innerHTML = '';
                _location.firstElementChild.innerHTML = provincename;


                // 渲染车型报价
                tabContent(target)

                loadDealers.options['provinceid'] = provinceid;
                loadDealers.options['cityid'] = 0;
                _location.pos['province'] = {"id":provinceid,"name":provincename};
                _location.pos['city'] = {};
                loadDealers.locked = false;
                result_list.page = 1;
                loadDealers('replace');

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

                        _location.lastElementChild.innerHTML = cityname;
                        //depreciate_location.lastElementChild.innerHTML = cityname;  //降价经销商

                        loadDealers.options['cityid'] = cityid;
                        _location.pos['city'] = {"id":cityid,"name":cityname};

                        loadDealers.locked = false;
                        result_list.page = 1;
                        loadDealers('replace',target);
                        //渲染车型报价
                        tabContent(target)
                        select_location.classList.remove('show');

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
            var target = event.target;
            if (target.tagName == 'SPAN') {
                searchLocation(target)
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
            tabContent(target)               //点击热门地区，渲染车型报价


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
    };
    selectCity();


    function initRegion(o){
        if(!o || !loadDealers.options) return;
        loadDealers.options['provinceid'] = o['province'].id;

        _location.firstElementChild.innerHTML = o['province'].name;
        //depreciate_location.firstElementChild.innerHTML = o['province'].name;

        if(o['city'].id && o['city'].name){
            loadDealers.options['cityid'] = o['city'].id;
            _location.lastElementChild.innerHTML = o['city'].name;
            //depreciate_location.lastElementChild.innerHTML = o['city'].name
        }
        result_list.page = 1;
        loadDealers('replace');

        // 页面刷新发送请求，替换暂无状态 && 地区热门
        o.province.name && (loadDealers.options.cityname = o.province.name)
        o.city.name && (loadDealers.options.cityname = o.city.name)
        tabContent('target',loadDealers.options)
    };
    exports.region && exports.region(initRegion);
})