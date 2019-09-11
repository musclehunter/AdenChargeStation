// ==UserScript==
// @name         Aden Charge Station
// @namespace    https://github.com/musclehunter
// @version      1.2
// @description  easy login and receive charge station in Lineage2 JP classic Aden server
// @author       MuscleHunter
// @match        https://www.ncsoft.jp/aion/
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function () {
    let item_info = {
        goodsID: 31911,
        paymentWayID: 32475,
        saleCountID: 32104,
    };
    let btn_css = {'margin':'5px 5px 5px 0',"padding":"0 5px","border":"1px solid black","border-radius":"3px"};

    //localstorage functions
    function l2ACSgetData(key) {
        let data = localStorage.getItem(key);
        if (data != null) {
            data = JSON.parse(data);
        }
        return data;
    }

    function l2ACSsetData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function l2ACSremoveData() {
        let mail = $(this).data('mail');
        console.log('button mail:' + mail);
        if (mail == "") {
            return false;
        }
        let acc = l2ACSgetData('account_data');
        if (acc[mail] == null) {
            return false;
        }
        delete acc[mail];
        l2ACSsetData('account_data', acc);

        //dom sakujo
        $('#' + mail).remove();
        acs_msg.text('アカウントを削除しました').append('<br>');
    }

    //main
    function l2ACSreciveChargeStation() {
        let acc = $(this).data('mail');
        let myPass = $(this).data('pass');
        acs_msg.append($('<span>').text('ログインします[' + acc + ']')).append('<br>');
        $.post("https://www.ncsoft.jp/login/ajax/loginProc",
            {
                account: acc,
                password: myPass,
                retURL: "https://www.ncsoft.jp/shop/1949/31806/detail"
            },
            function (data) {
                console.log(data);
                if (data.result[0].errorCode == "000") {
                    acs_msg.append($('<span>').text('ログインしました')).append('<br>');
                } else {
                    acs_msg.append($('<span>').text('ログイン失敗')).append('<br>')
                        .append($('<span>').html(data.result[0].errorMsg)).append('<br>');
                    return false;
                }


                $.post("https://www.ncsoft.jp/shop/cart/ajaxSaveGoodsToCart",
                    {
                        goodsID: item_info.goodsID,
                        stockAmount: 1,
                        displayType: 300,
                        paymentWayID: item_info.paymentWayID,
                        orderType: 1,
                        categoryID: 1949,
                        saleCountID: item_info.saleCountID,
                        update: "F",
                        random: 71
                    },
                    function (data) {
                        acs_msg.append($('<span>').text('カートに保存しました')).append('<br>');


                        $.post("https://www.ncsoft.jp/shop/cart/ajaxGameCharacterList",
                            {
                                serviceID: 32,
                                serverCode: 74,
                                serObjId: "server_32",
                                charObjId: "character_32",
                                serverType: 0,
                                categoryID: 1949
                            },
                            (charaData) => {
                                acs_msg.append($('<span>').text('キャラクター情報を取得しました').append('<br>').append($('<span>').text('「' + charaData.result[0].charName + '」で受け取ります')).append('<br>'));
                                console.log(charaData.result[0]);

                                $.post("https://www.ncsoft.jp/shop/ajaxCommonPasswordProc", {password: myPass}, (commomPassResult) => {
                                    acs_msg.append($('<span>').text('パスワード確認')).append('<br>');
                                    console.log(commomPassResult);

                                    $.post("https://www.ncsoft.jp/shop/order/ajaxValidationOrderInfo",
                                        {
                                            addinfo: '[{"goodsID":"' + item_info.goodsID + '","extInfo":{"gameServerID":"74","gameCharacterID":"' + charaData.result[0].charID + '","gameServiceID":"32","gameCharacterName":"' + charaData.result[0].charName + '","gameServerName":"アデン","characterRace":-1,"itemProperty":"","targetGameServerID":"","targetGameServerName":"","targetGameCharacterID":"","targetGameCharacterName":""}}]',
                                            goodsCnt: 1,
                                            goodsID: item_info.goodsID,
                                            displayType: 300,
                                            orderType: 1,
                                            serviceID: 32,
                                            categoryID: 1949,
                                            paymentWayID: item_info.paymentWayID,
                                            saleCountID: item_info.saleCountID,
                                            stockAmount: 1,
                                            pOrderTypes: 1,
                                            cartCouponID: 0,
                                            percentDiscount: 0,
                                            cartIsPercent: 0,
                                            cart_ticketType: 0,
                                            cart_discountOfCoin: 0,
                                            cart_discountOfPoint: 0,
                                            cart_discountType: 0,
                                            cart_discountTarget: 0,
                                            hdnStep2TxtQuantity: 1,
                                            hiddenQuantity: 1,
                                            hdnServerName: "アデン",
                                            hdnCharacterName: charaData.result[0].charName,
                                            hdnCharacterLevel: charaData.result[0].charLevel,
                                            hdnServerID: 74,
                                            hdnCharacterID: charaData.result[0].charID,
                                            characterRace: -1,
                                            dispChar: "all"
                                        },
                                        (validateRes) => {
                                            acs_msg.append($('<span>').text('バリデーションオーダーインフォ')).append('<br>');

                                            console.log(validateRes);
                                            $.post("https://www.ncsoft.jp/shop/order/ajaxSaveOrderInfomation",
                                                {
                                                    goodsID: item_info.goodsID,
                                                    serviceID: 32,
                                                    hdnStep2TxtQuantity: 1,
                                                    displayType: 300,
                                                    cartCouponID: 0,
                                                    cart_discountOfCoin: 0,
                                                    cart_discountType: 0,
                                                    cart_discountTarget: 0,
                                                    categoryID: 1949,
                                                    stockAmount: 1,
                                                    addinfo: '[{"goodsID":"' + item_info.goodsID + '","extInfo":{"gameServerID":"74","gameCharacterID": ' + charaData.result[0].charID + ',"gameServiceID":"32","gameCharacterName":"' + charaData.result[0].charName + '","gameServerName":"アデン","characterRace":-1,"itemProperty":"","targetGameServerID":"","targetGameServerName":"","targetGameCharacterID":"","targetGameCharacterName":""}}]'
                                                },
                                                function (data) {
                                                    if (data.sysErrorCode == 0) {
                                                        acs_msg.append($('<span>').text('購入成功')).append('<br>');
                                                        let date = new Date();
                                                        l2ACSsetData("last_" + acc, date.getTime());
                                                        let receive_date = "[" + (date.getMonth() + 1) + "/" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "]";
                                                        $('#' + acc + " span").first().text(receive_date);
                                                    } else {
                                                        acs_msg.append($('<span>').text('購入失敗')).append('<br>')
                                                            .append($('<span>').html(data.sysErrorDesc)).append('<br>');
                                                    }
                                                    console.log(data, data.sysErrorDesc);
                                                    $.get("https://www.ncsoft.jp/login/logout");
                                                    acs_msg.append($('<span>').text('ログアウトしました')).append('<br>');

                                                }, 'json');
                                        });
                                });
                            }, 'json');
                    });

            }, 'json');
    }

    function l2ACSgenerateButtons(mail, pass) {
        let date = "[--/- --:--:--]";
        let last_received = l2ACSgetData('last_' + mail);
        if (last_received != null) {
            let date_obj = new Date(last_received);
            date = "[" + (date_obj.getMonth() + 1) + "/" + date_obj.getDate() + " " + date_obj.getHours() + ":" + date_obj.getMinutes() + ":" + date_obj.getSeconds() + "]";
        }
        return $('<div>').attr('id', mail).css('margin', '2px')
            .append(
                $('<button>').addClass('l2acsReceive').text('受取').css(btn_css).data('mail', mail).data('pass', pass).on('click', l2ACSreciveChargeStation))
            .append(
                $('<button>').text('削除').css(btn_css).data('mail', mail).on('click', l2ACSremoveData))
            .append(
                $('<span>').text(date).css('margin', '2px'))
            .append(
                $('<span>').text(mail).css('margin', '2px'));
    }

    /**
     * 全受取
     */
    function l2ACSreceiveAll() {
        acs_msg.text("");
        acs_msg.append($('<span>').text('登録されているアカウントを順番に受け取ります')).append('<br>');

        let buttons = $('.l2acsReceive');
        let delay = 60000;//1分毎に実行する
        buttons.each(function (num) {
            let button = $(buttons[num]);
            acs_msg.append($('<span>').text(button.data('mail') + "受取タイマーセット")).append('<br>');
            setTimeout(function () {
                button.click();
            }, delay * num);
        });
    }

    //全受取ボタン
    let receive_all_button = $('<button>').css(btn_css).text('全受取').on('click', l2ACSreceiveAll);

    //create ui
    let acs_div = $('<div>').attr('id', 'l2acs_div').css({
        'width': '400px',
        'position': 'absolute',
        'top': 0,
        'left': 0,
        'padding': '10px',
        'background': 'white',
        'z-index': 100000
    });

    let heading_css = {
        'padding-bottom': '5px',
        'border-bottom': '1px solid #d2d2d2',
    };

    //タイトル
    let acs_msg = $('<p>').attr('id', 'acs_msg').css('font-size', '13px');
    let acs_div_title =
        $('<div>').css(heading_css).append(
            $('<p>').text('アデンチャージステーション').css('font-size', '16px'))
            .append(acs_msg)
            .append($('<button>').css({
                'position': 'absolute',
                'right': '2px',
                'top': '2px'
            }).text('閉じる').on('click', function () {
                $('#l2acs_div').remove();
            }));

    //アカウントリストを生成
    let acs_div_list =
        $('<div>').append(
            $('<p>').text('アカウントリスト').css({
                'margin': '5px',
                'font-size': '13px'
            })
        );

    let account_data = l2ACSgetData('account_data');//account情報
    //account list の生成
    for (let mail in account_data) {
        acs_div_list.append(l2ACSgenerateButtons(mail, account_data[mail].pass));
    }


    if (account_data == null || Object.keys(account_data).length == 0) {
        acs_msg.text('アカウントを追加してください').append('<br>');
        ;
    } else {
        acs_msg.text('受取ボタンを押してください').append('<br>');
        ;
    }

    //account 追加用フォーム
    //登録ボタン 生成
    let regist_button = $('<button>').text('アカウント追加').css(btn_css).on('click', function () {
        let acc = l2ACSgetData('account_data');
        if (acc == null) {
            acc = {}
        }
        let mail = $('#l2ACS_add_mail').val();
        let pass = $('#l2ACS_add_pass').val();
        if (mail == "" || pass == "") {
            return false;
        }
        if (!acc.hasOwnProperty(mail)) {
            //新規ならdom tuika
            acs_div_list.append(l2ACSgenerateButtons(mail, pass));
            acs_msg.text('アカウントを追加しました').append('<br>');
            ;
        } else {
            acs_msg.text('上書きしました').append('<br>');
            ;
        }
        //local storage に保存
        acc[mail] = {
            mail: mail,
            pass: pass
        };
        l2ACSsetData('account_data', acc);
    });

    let acs_div_menu =
        $('<div>').css(heading_css).css('margin', '20px auto').append(
            $('<p>').text('アカウント情報の追加・上書き').css({
                'margin': '5px',
                'font-size': '13px'
            })
        );

    //登録formを追加
    let input_css = {
        'margin': '2px',
        'border': '1px solid #d2d2d2',
        'border-radius': '4px',
        'height': '15px',
        'color': '#767676',
        'padding': '0 0 1px',
        'font-size': '13px',
        'vertical-aligh': 'middle',
        'background': 'white'
    };
    acs_div_menu.append($('<input type="text" id="l2ACS_add_mail" placeholder="アカウント">').css(input_css))
        .append($('<input type="password" id="l2ACS_add_pass" placeholder="パスワード">').css(input_css))
        .append(regist_button)
        .append(receive_all_button);
    // .css({ "background":"white","display": "block", "position": "absolute", "z-index": 1000, "right":"0px", "top": "0px", "padding": "5px","text-align":"right"});

    acs_div.append(acs_div_title)
        .append(acs_div_menu)
        .append(acs_div_list);
    $('body').prepend(acs_div);

})();
