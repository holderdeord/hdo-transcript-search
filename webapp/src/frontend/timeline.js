var c3 = require('c3');

var Timeline = function (element) {
    this.chart = c3.generate({
        bindto: element,
        data: {
            x: 'x',
            columns: [
                ['x']
            ],
            type: 'line'
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: "%Y-%m-%d"
                }
            },
            y: {
                tick: {
                    format: function (d) { return d + '%'; }
                },
                // max: 100,
                // min: 100,
                padding: { top: 0, bottom: 0 }
            }
        },
        point: { show: false },
        subchart: { show: false }

//        color: { pattern: ["#111", "#fadd00", "#b8bfcc", "#ccc", "#455068"] }
    });
};

Timeline.prototype = {
    add: function(query, data) {
        var dates = [];
        var vals = [];

        data.forEach(function (e) {
            dates.push(new Date(e.date));
            vals.push(e.pct);
        });

        var cols = [
            ['x'].concat(dates),
            [query].concat(vals)
        ];

        this.chart.load({ columns: cols });
    },

    reset: function () {
        this.chart.unload();
    }

};

module.exports = Timeline;