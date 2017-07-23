'use strict';
//商品类型
function item(barcode,name,unit,price,count,promotion){
    this.barcode=barcode;
    this.name=name;
    this.unit=unit;
    this.price=price;
    this.count=count;
    this.promotion=promotion;
}

function load_item_to_itemList(allItem,input){
    let ans=[];
    let itemMap=[];
    for(let i=0;i<input.length;i++){
        let s=input[i].split('-');//处理遇到了barcode-count这种情况的输入
        if(s.length>1){
            var code=s[0];
            var number=Number(s[1]);
        }else{
            var code=s[0];
            var number=1;
        }
        if(typeof(itemMap[code])=="undefined"){
            itemMap[code]=number;
        }else{
            itemMap[code]+=number;
        }
    }
    //上面都是将输入转化为统一的barcode:count形式，以方便item对象的创建
    for(let i in itemMap){
        for(let j=0;j<allItem.length;j++){
            if(i==allItem[j].barcode){
                ans.push(new item(allItem[j].barcode,allItem[j].name,allItem[j].unit,allItem[j].price,itemMap[i],{type:"",flag:false}));
            }
        }
    }
    return ans;
}

//将优惠信息加入到itemList中
function check_promotions(itemList,promotion){
    for(let i=0;i<promotion.length;i++){
        for(let j=0;j<itemList.length;j++){
            if(promotion[i].barcodes.indexOf(itemList[j].barcode)!=-1){
                itemList[j].promotion={type:promotion_type_info(promotion[i].type),flag:true};
            }
        }
    }
    return itemList;
}

//将优惠类型以简单的形式保存下来，但是这只适用于买N-1的情况
//其实我还没想到怎么用一个统一的表达方法表示各种优惠信息
//暂时不考虑那么多，实在是考虑了也不知道怎么办
function promotion_type_info(promotion){
    let pro=promotion.split('_');
    let ans=pro[1]+"-"+pro[3];
    return ans;
}

function calculate_price(itemList){
    //这其实也是一种很不全面的获取优惠信息的方法，但是我也不知道怎么做更好。
    let numbers=["ZERO","ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE"];
    let total=0;
    let bonus=0;
    for(let i=0;i<itemList.length;i++){
        let ii=itemList[i];
        let cnt=0;
        if(ii.promotion.flag){
            let s=ii.promotion.type.split('-');
            let buy=numbers.indexOf(s[0]);
            let cut=numbers.indexOf(s[1]);
            buy+=cut;
            cnt=(Math.floor(ii.count/buy))*cut;
        }
        itemList[i].total=ii.price*(ii.count-cnt);
        total+=itemList[i].total;
        bonus+=cnt*itemList[i].price;
    }
    let ret=[total,bonus];
    return ret;
}

function print_list(itemList,total_price){
    let s="***<没钱赚商店>收据***";
    for(let i=0;i<itemList.length;i++){
        s+="\n名称："+itemList[i].name+"，数量："+itemList[i].count+itemList[i].unit+"，单价："+itemList[i].price.toFixed(2)+"(元)，小计："+itemList[i].total.toFixed(2)+"(元)";
    }
    s+="\n----------------------";
    s+="\n总计："+total_price[0].toFixed(2)+"(元)";
    if(total_price[1]!=0){
        s+="\n节省："+total_price[1].toFixed(2)+"(元)";
    }
    s+="\n**********************";
    console.log(s);
}

function printReceipt(tags){
    let itemList=load_item_to_itemList(loadAllItems(),tags);
    //商品清单基本完成，还差优惠信息
    itemList=check_promotions(itemList,loadPromotions());
    //商品清单总算完成啦,接着就是计算总价了
    let total_price=calculate_price(itemList);
    //现在所有信息都处理完毕，接下来是生成清单字符
    print_list(itemList,total_price);
}