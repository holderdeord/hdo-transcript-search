var d3 = require('d3');

function Hits(element) {
    this.element = element;
    this.state = [];
}

Hits.prototype.setState = function (state) {

};

Hits.prototype.render = function () {
    d3.select('.hits')
      .data(this.state)
      .enter()
        ;
};

module.exports = Hits;