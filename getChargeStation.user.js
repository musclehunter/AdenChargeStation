// ==UserScript==
// @name         Aden Charge Station
// @namespace    https://github.com/musclehunter
// @version      0.4
// @description  easy login and receive charge station in Lineage2 JP classic Aden server
// @author       MuscleHunter
// @match        https://*.ncsoft.jp/*
// @grant        none
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function () {
    let item_info = {
        goodsID: 31806,
        paymentWayID: 32371,
        saleCountID: 31999,
    };

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
    }

    function l2ACSreciveChargeStation() {
        let acc = $(this).data('mail');
        let myPass = $(this).data('pass');
        $.post("https://www.ncsoft.jp/login/ajax/loginProc",
            {
                account: acc,
                password: myPass,
                retURL: "https://www.ncsoft.jp/shop/1949/31806/detail"
            },
            function (data) {
                console.log(data);
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
                        console.log(data);

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
                                $.post("https://www.ncsoft.jp/shop/ajaxCommonPasswordProc", {password: myPass}, (commomPassResult) => {
                                    console.log(commomPassResult);
                                    console.log(charaData.result[0]);

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
                                                    console.log(data);
                                                    top.location.href = "https://www.ncsoft.jp/login/logout?retURL=https://www.ncsoft.jp/lineage2classic/"
                                                });
                                        });
                                });
                            }, 'json');
                    });

            });
    }

    let account_data = l2ACSgetData('account_data');//account情報

    console.log(account_data);//for debug
    //account 追加用フォーム
    //登録ボタン
    let regist_button = $('<button>').text('登録').on('click', function () {
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
            //dom tuika
            $('#l2ACS_acc_form').append(
                $('<p>').attr('id', mail).text(mail).append(
                    $('<button>').text('削除').data('mail', mail).on('click', l2ACSremoveData))
                    .append(
                        $('<button>').text('受取').data('mail', mail).data('pass',pass).on('click', l2ACSreciveChargeStation)
                    )
            );
        }
        acc[mail] = {
            mail: mail,
            pass: pass
        };
        l2ACSsetData('account_data', acc);
    });

    // let input_css = {"font-size": "15px", "display":"block", "width" : "120px", "border" : "1px solid gray", "margin":"1px"};
    let acc_form = $('<li id="l2ACS_acc_form">');
    for (var mail in account_data) {
        acc_form.append(
            $('<p>').attr('id', mail).text(mail)
                .append(
                    $('<button>').text('削除').data('mail', mail).on('click', l2ACSremoveData))
                .append(
                    $('<button>').text('受取').data('mail', mail).data('pass',account_data[mail].pass).on('click', l2ACSreciveChargeStation)
                )
        );
    }

    acc_form.append($('<input type="text" id="l2ACS_add_mail">'))
        .append($('<input type="password" id="l2ACS_add_pass">'))
        .append(regist_button);
    // .css({ "background":"white","display": "block", "position": "absolute", "z-index": 1000, "right":"0px", "top": "0px", "padding": "5px","text-align":"right"});
    $('#myPlaync .wrapper li').first().after(acc_form);

})();
