var Timeline = require('./timeline');
var reqwest  = require('reqwest');
var d3       = require('d3');

var chart = new Timeline('.timeline');

d3.select('form').on('submit', function () {
    d3.event.preventDefault();
    var q = this.query.value;
    var interval = this.interval.value;

    var path = '/api/timeline?interval=' + encodeURIComponent(interval) + '&query=' + encodeURIComponent(q);

    reqwest(path).then(function (data) {
        chart.add(q, data);
        this.query.value = '';
    });
});

d3.select('input[name=cancel]').on('click', function () {
    chart.reset();
});