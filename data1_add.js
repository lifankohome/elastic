// 添加数据到lifanko索引，comment类型
// 数据是NodeJS爬取到的李袁杰《离人愁》在QQ音乐上的评论，当时陷入抄袭风波，所以评论都很“和谐”，70000+数据

var fs = require('fs');
var readline = require('readline');
var request = require("request");

// 更新一个资源，或新增一个含有ID的资源（ID不存在时）
function put(url, data, n) {
    var options = {
        url: url,
        json: data
    };

    request.put(options, function (error, response, body) {
        if (response.statusCode === 200 || response.statusCode === 201) {
            console.log(n + ' OK ' + body._id);
        } else {
            console.log(n + ' Fail ' + response.statusCode);
        }
    });
}

// 按行读取txt内容程序
function readFileToArr(fReadName, callback) {
    var fRead = fs.createReadStream(fReadName);
    var objReadline = readline.createInterface({
        input: fRead
    });

    var n = 0;

    objReadline.on('line', function (line) {
        line = line.substring(1, line.length);
        var from_qq_pos = line.indexOf('(');
        if (from_qq_pos !== -1) {
            var from_nickname = line.substring(0, from_qq_pos);
            var from_qq_number = line.substring(from_qq_pos + 1, line.indexOf(')'));

            var to_nickname = '';
            var to_qq_number = '';
            var content = line.substring(line.indexOf('：') + 1, line.length);
            var to_nickname_pos = line.indexOf('@');
            if (to_nickname_pos !== -1) {
                var buffer = line.substring(to_nickname_pos + 1, line.length);
                var to_qq_pos = buffer.indexOf('(');
                to_nickname = buffer.substring(0, to_qq_pos);
                to_qq_number = buffer.substring(to_qq_pos + 1, buffer.indexOf(')'));
                content = buffer.substring(buffer.indexOf('：') + 1, buffer.length);
            }

            if (content !== 'javascript:void(0)') {
                n++;

                // 输出解析后的数据
                // console.log(n + ' - ' + from_nickname + ' - ' + from_qq_number + ' - ' + to_nickname + ' - ' + to_qq_number + ' - ' + content);

                var limit = 100000;
                if (n <= limit) {
                    // 将解析后的数据进行存储，type定义为qq_music
                    put('http://localhost:9200/lifanko/qq_music/' + n, {
                        "id": n,
                        "from_nickname": from_nickname,
                        "from_qq_number": from_qq_number,
                        "to_nickname": to_nickname,
                        "to_qq_number": to_qq_number,
                        "content": content
                    }, n);
                }
            }
        }
    });

    objReadline.on('close', function () {
        console.log('\nComplete!');
    });
}

readFileToArr('data1.txt');
