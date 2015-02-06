var app = require('./src/backend/app');
var debug = require('debug')('server');

// launch
app.listen(app.get('port'), function() {
    debug('hdo-transcript-counts started on ' + app.get('port'));
});
