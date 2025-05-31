'use strict'

const html = require('../requires/templates.js');

exports.notFound = () => {
    
    let base = html.getHTML('notFound.html');

    html.returnHTML(base);
}