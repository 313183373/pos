'use strict';



class Pos_v2 {
    constructor(items, promotions) {
        this.allItems = items;
        this.promotions = promotions;
    }

    run(tags) {
        let map = this.countItems(tags);
        this.createList(map);
        this.createPromotions();
        this.calcPromotions();
        this.print();
    }

    countItems(tags) {
        let map = new Map();
        for (let i of tags) {
            let [id, cnt] = i.split('-');
            cnt = Number(cnt ? cnt : 1);
            map.set(id, map.has(id) ? map.get(id) + cnt : cnt);
        }
        return map;
    }

    createList(map) {
        this.itemList=[];
        for (let [key, value] of map) {
            for(let {barcode,name,unit,price} of this.allItems){
                if(barcode===key){
                    let temp=new Item(barcode,name,unit,price);
                    temp.count=value;
                    this.itemList.push(temp);
                }
            }
        }
    }

    createPromotions() {
        for(let i of this.itemList){
            for(let {type,barcodes} of this.promotions){
                for(let j of barcodes){
                    if(i.barcode===j){
                        i.promotion=type;
                    }
                }
            }
        }
    }

    calcPromotions() {
        for(let i of this.itemList){
            if(i.promotion){
                i.cutNum=this.calcCutNumber(i);
            }else{
                i.cutNum=0;
            }
            i.total=i.price*(i.count-i.cutNum).toFixed(2);
        }
    }

    calcCutNumber(i) {
        let numbers=['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE'];
        let [a,n1,n2,b]=i.promotion.split(/^\w+\_(\w+)\_\w+\_(\w+)\_\w+$/);
        n1=numbers.indexOf(n1);
        n2=numbers.indexOf(n2);
        return Math.floor(i.count/(n1+n2));
    }

    print() {
        let result='***<没钱赚商店>收据***';
        result+=this.addTime();
        result+='\n----------------------';
        for(let i of this.itemList){
            result+='\n名称：'+i.name+'，数量：'+i.count+i.unit+'，单价：'+i.price.toFixed(2)+'(元)，小计：'+i.total.toFixed(2)+'(元)';
        }
        result+=this.addTotalInfo();
        result+='\n**********************';
        console.log(result);
    }


    addTime() {
        const dateDigitToString = num => (num < 10 ? `0${num}` : num);
        let d=new Date();
        let year = dateDigitToString(d.getFullYear());
        let month = dateDigitToString(d.getMonth() + 1);
        let date = dateDigitToString(d.getDate());
        let hour = dateDigitToString(d.getHours());
        let minute = dateDigitToString(d.getMinutes());
        let second = dateDigitToString(d.getSeconds());
        let formattedDateString = `${year}年${month}月${date}日 ${hour}:${minute}:${second}`;
        let result='\n打印时间：'+formattedDateString;
        return result;
    }

    addTotalInfo() {
        let spendTotal=0,saveTotal=0;
        for(let i of this.itemList){
            spendTotal+=i.total;
            saveTotal+=i.cutNum*i.price;
        }
        let result='\n----------------------'
        result+='\n总计：'+spendTotal.toFixed(2)+'(元)';
        result+='\n节省：'+saveTotal.toFixed(2)+'(元)';
        return result;
    }
}

const tags = [
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000001',
    'ITEM000003-2.5',
    'ITEM000005',
    'ITEM000005-2',
];

function printReceipt(tags) {
    new Pos_v2(Item.all(), Promotion.all()).run(tags);
}
