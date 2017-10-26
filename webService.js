var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

app.get('/lottery', function (req, res) {
    var lottery = {};
    lottery['date'] = {};
    lottery['first-prize'] = {};
    lottery['front3'] = {};
    lottery['back3'] = {};
    lottery['back2'] = {};
    lottery['nearby'] = {};
    lottery['second-prize'] = {};
    lottery['third-prize'] = {};
    lottery['four-prize'] = {};
    lottery['five-prize'] = {};

    var urlget = 'http://lottery.kapook.com/';

    request(urlget, function (error, response, html) {
        if (!error) {
            var $ = cheerio.load(html);

            //วันที่
            $('h5').filter(function () {
                var data = $(this);
                var a = data.children();
                lottery['date'] = {
                    'date': a[0].children[0].data
                }
            });


            //รางวัลที่ 1
            $('.bigprize').filter(function () {
                var data1 = $(this);
                var a = data1.children();
                lottery['first-prize'] = {
                    '1': a[0].children[1].children[0].data
                }
                lottery['front3'] = {
                    '1': a[1].children[3].children[1].children[0].data,
                    '2': a[1].children[3].children[3].children[0].data
                }
                lottery['back3'] = {
                    '1': a[1].children[5].children[1].children[0].data,
                    '2': a[1].children[5].children[3].children[0].data
                }
                lottery['back2'] = {
                    '1': a[2].children[2].children[0].data
                }
            });

            //รางวัลใกล้เคียง => 2 รางวัล
            $('.nearby').filter(function () {
                var data2 = $(this);
                var b = data2.children();
                lottery['nearby'] = {
                    '1': b[1].children[0].data,
                    '2': b[2].children[0].data
                }
            });

            //รางวัลที่ 2  => 5 รางวัล
            $('.second-prize').filter(function () {
                var data3 = $(this);
                var c = data3.children();
                for (var i = 1; i <= 5; i++) {
                    lottery['second-prize'][i] = c[i].children[0].data
                }
            });


            //รางวัลที่ 3  => 10 รางวัล
            $('.third-prize').filter(function () {
                var data4 = $(this);
                var d = data4.children();
                for (var i = 1; i <= 10; i++) {
                    lottery['third-prize'][i] = d[i].children[0].data
                }
            });

            //รางวัลที่ 4  => 50 รางวัล
            $('.four-prize').filter(function () {
                var data5 = $(this);
                var e = data5.children();
                for (var i = 1; i <= 50; i++) {
                    lottery['four-prize'][i] = e[i].children[0].data
                }
            });

            //รางวัลที่ 5  => 100 รางวัล
            $('.five-prize').filter(function () {
                var data6 = $(this);
                var f = data6.children();
                for (var i = 1; i <= 100; i++) {
                    lottery['five-prize'][i] = f[i].children[0].data
                }
            });
        }
        // console.log(lottery);
        res.send(lottery);
    });
});


app.post('/checklotto', function (req, response) {
    var body = req.body;

    var tmp = body['1'] + '\n' + body['2'] + '\n' + body['3'] + '\n' + body['4'];
    tmp = tmp.split('\n');
    console.log("req.body = ", tmp);

    //get json from webservice (localhost)
    request({
        url: 'http://localhost:8080/lottery',
        json: true
    }, function (err, res, json) {
        if (err) {
            throw err;
        }
        // console.log(json);

        var textAns = "ตรวจหวยประจำงวดวันที่ " + json.date.date + "\n";
        for (var i = 0; i < tmp.length; i++) {
            var check = true;
            textAns += "=========== ใบที่ " + (i + 1) + " ฉลากหมายเลข " + tmp[i] + " ===========\n"
            var f = tmp[i].substring(0, 3);
            var b = tmp[i].substring(3, 6);
            var l = tmp[i].substring(4, 6);
            if (json['first-prize']['1'] === tmp[i]) {
                textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลที่ 1 รางวัลละ 6,000,000 บาท\n";
                check = false;
            }
            if (f === json['front3']['1'] || f === json['front3']['2']) {
                textAns += "หมายเลข : " + f + " ถูกรางวัลเลขหน้า 3 ตัว รางวัลละ 4,000 บาท\n";
                check = false;
            }
            if (b === json['back3']['1'] || b === json['back3']['1']) {
                textAns += "หมายเลข : " + b + " ถูกรางวัลเลขท้าย 3 ตัว รางวัลละ 4,000 บาท\n";
                check = false;
            }
            if (l === json['back2']['1']) {
                textAns += "หมายเลข : " + l + " ถูกรางวัลเลขท้าย 2 ตัว รางวัลละ 2,000 บาท\n";
                check = false;
            }
            if (tmp[i] === json['nearby']['1'] || tmp[i] === json['nearby']['2']) {
                textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลข้างเคียงรางวัลที่ 1 รางวัลละ 100,000 บาท\n";
                check = false;
            }

            for (var j = 0; j < 5; j++) {
                if (tmp[i] === json['second-prize'][j + 1]) {
                    textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลที่ 2 รางวัลละ 200,000 บาท\n";
                    check = false;
                }
            }

            for (var j = 0; j < 10; j++) {
                if (tmp[i] === json['third-prize'][j + 1]) {
                    textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลที่ 3 รางวัลละ 80,000 บาท\n";
                    check = false;
                }
            }

            for (var j = 0; j < 50; j++) {
                if (tmp[i] === json['third-prize'][j + 1]) {
                    textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลที่ 4 รางวัลละ 40,000 บาท\n";
                    check = false;
                }
            }

            for (var j = 0; j < 100; j++) {
                if (tmp[i] === json['third-prize'][j + 1]) {
                    textAns += "หมายเลข : " + tmp[i] + " ถูกรางวัลที่ 5 รางวัลละ 20,000 บาท\n";
                    check = false;
                }
            }

            if (check) {
                textAns += "เสียใจด้วยจ๊าา ฉลากหมายเลข " + tmp[i] + " ไม่ถูกรางวัลนะจ๊ะ..\n\n"
            } else {
                textAns += "\n";
            }
        }
        //console.log(textAns);
        response.send(textAns);
    });
});


app.listen(8080);
console.log('node app running on port 8080');