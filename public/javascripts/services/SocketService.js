angular.module('UIApp')
.service('SocketService', function (socketFactory) {
    var socket = socketFactory({

        ioSocket: io.connect('http://localhost:8080')

    });
    return socket;
});
