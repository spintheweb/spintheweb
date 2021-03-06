/*!
 * table
 * Copyright(c) 2017 Giancarlo Trevisan
 * MIT Licensed
 */
'use strict';

const Content = require('../elements/Content');
const layout = require(`../elements/WBLL`);

module.exports = class Table extends Content {
	constructor(name, template, lang) {
		super(name, template, lang, true);
	}

	render(socket) {
		return super.render(socket, (socket, template) => {
			let fragment = '<table>';
			fragment += '<thead><tr></tr></thead><tbody>'; // TODO: Special handling of l, \t and \n symbols
			socket.dataset.forEach(function (row, i) {
				socket.row = i;
				fragment += `<tr>${layout.renderer(socket, this, template)}</tr>`;
			});
			fragment += '</tbody><tfoot><tr>';
			fragment += 'This is pager space'; // TODO: Paging
			fragment += '</tr></tfoot></table>';
			return fragment;
		});
	}
}