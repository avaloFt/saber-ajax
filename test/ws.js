/**
 * @file 测试服务器
 * @author treelite(c.xinle@gmail.com)
 */

var MIME_TYPES = {
    json : 'application/json',
    js: 'text/javascript',
    html: 'text/html'
};

function extend(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }

    return target;
}

function createResponse(response, data) {
    if (data.headers) {
        for (var key in data.headers) {
            if (data.headers.hasOwnProperty(key)) {
                response.setHeader(key, data.headers[key]);
            }
        }
    }
    if (!response.getHeader('Content-Type')) {
        response.setHeader('Content-Type', 'text/html');
    }
    response.statusCode = data.status || 200;
    response.end(data.content);
}

function isStatic(pathname) {
    if (pathname.charAt(0) == '/') {
        pathname = pathname.substring(1);
    }
    var path = require('path');
    var fs = require('fs');
    var file = path.resolve(process.cwd(), pathname);

    return fs.existsSync(file);
}

function getStatic(pathname) {
    if (pathname.charAt(0) == '/') {
        pathname = pathname.substring(1);
    }
    var path = require('path');
    var fs = require('fs');
    var file = path.resolve(process.cwd(), pathname);

    return {
        content: fs.readFileSync(file),
        mimetype: MIME_TYPES[path.extname(file).substring(1)] || 'text/html'
    };
}

var actionList = {};

actionList['/sleep'] = function (request, response) {
    var queryString = require('url').parse(request.url, true).query;
    var time = queryString.time || 3000;

    setTimeout(
        function () {
            createResponse(
                response,
                {
                    content: 'sleep '+ time +' ms'
                }
            );
        }, 
        time
    );
};

actionList['/echo'] = function (request, response) {
    var queryString = require('url').parse(request.url, true).query || {};
    if (request.method == 'POST') {
        var data = [];
        request.on('data', function (chunk) {
            data.push(chunk);
        });
        request.on('end', function () {
            data = data.join('');
            data = extend(queryString, require('querystring').parse(data));
            createResponse(response, {
                content: data.content || '',
                status: data.status || 200
            });
        });
    }
    else {
        createResponse(response, {
            content: queryString.content || '',
            status: queryString.status || 200
        });
    }
};

actionList['/info'] = function (request, response) {
    var queryString = require('url').parse(request.url);
    var querys = require('querystring').parse(queryString);
    var info = {
        method: request.method,
        url: request.url,
        params: querys
    };
    if (request.method == 'POST') {
        var data = [];
        request.on('data', function (chunk) {
            data.push(chunk);
        });
        request.on('end', function () {
            data = data.join('');
            data = extend(querys, require('querystring').parse(data));
            info.params = data;
            createResponse(response, {
                content: JSON.stringify(info),
                status: data.status || 200
            });
        });
    }
    else {
        createResponse(response, {
            content: JSON.stringify(info),
            status: querys.status || 200
        });
    }
};

var http = require('http');

var port = process.argv[2] || 8848;

var server = http.createServer();

var urlMgr = require('url');
server.on('request', function (request, response) {
    var url = urlMgr.parse(request.url);
    var pathname = url.pathname;
    console.log('[Request]' + pathname);
    var action = actionList[pathname];
    if (action) {
        action(request, response);
    }
    else if (isStatic(pathname)) {
        var data = getStatic(pathname);

        response.statusCode = 200;
        response.setHeader('Content-Type', data.mimetype);
        response.end(data.content);
    }
    else {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html');
        response.end('not find');
    }
});

server.listen(port);
console.log('test server start at ' + port + '...');