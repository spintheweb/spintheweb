/*!
 * Base
 * Copyright(c) 2017 Giancarlo Trevisan
 * MIT Licensed
 */
'use strict';

const uuid = require('uuid'),
	util = require('../utilities');

module.exports = (webspinner) => {
	webspinner.Base = class Base {
		constructor(name) {
			this.id = uuid.v1();
			this.parent = null;
			this.children = [];
			this.cultures = null; // TODO: International vs Multinational concern
			this._name = {}; // lang: string
			this.rbv = {}; // role: { false | true } Role Based Visibilities
			this.lastmod = (new Date()).toISOString();

			this.name(name || this.constructor.name); // NOTE: siblings may have identical names, however, the router will select the first
		}
		name(value) {
			if (typeof value === 'undefined') return util.localize(webspinner.lang(), this._name);
			this._name[webspinner.lang()] = value;
			this.lastmod = (new Date()).toISOString();
			return this;
		}

		inRole(user, role) {
			return (webspinner.webbase.users[user].roles || []).includes(role);
		}

		// Grant a role an access control, if no access control is specified remove the role from the RBVC list.
		grant(role, ac) {
			if (webspinner.webbase.roles[role]) {
				if (this.rbv[role] && !ac)
					delete this.rbv[role];
				else
					this.rbv[role] = ac ? 1 : 0;
				this.lastmod = (new Date()).toISOString();
			}
			return this;
		}

		// Return the highest access control associated to the given roles
		granted(role = null, recurse = false) {
			let ac = null;

			let roles = webspinner.webbase.users[webspinner.user()].roles;
			if (this instanceof webspinner.Page && webspinner.webbase.webo.mainpage() === this)
				ac = recurse ? 0b11 : 0b01; // Main web page always visible

			if (role) {
				if (this.rbv[role] !== undefined)
					ac = this.rbv[role] ? 0b01 : 0b00;
			} else
				for (let i = 0; ac != 0b01 && i < roles.length; ++i)
					if (this.rbv.hasOwnProperty(roles[i]))
						ac |= this.rbv[roles[i]] ? 0b01 : 0b00;

			if (ac === null)
				if (this.parent)
					ac = 0b10 | this.parent.granted(role, true);
				else if (this instanceof webspinner.Content)
					ac = 0b10; // NOTE: this is a content without a parent nor a RBVC, it's in limbo! Contents referenced by Copycats

			return ac || 0b00;
		}

		// Add child to element, note, we are adding a child not moving it
		add(child) {
			if (child && !(child instanceof webspinner.Webo) && child !== this && this.children.indexOf(child) === -1) {
				if (child.parent) child = new webspinner.Reference(child);
				child.parent = this;
				this.children.push(child);
				this.lastmod = (new Date()).toISOString();
			}
			return this;
		}

		// Deep copy element, note, the web is not clonable, use write() instead
		clone() {
			let obj;
			if (this instanceof webspinner.Area) {
				obj = new webspinner.Area();
			} else if (this instanceof webspinner.Page) {
				obj = new webspinner.Page();
			} else if (this instanceof webspinner.Content) {
				obj = new this.constructor();
			}
			return obj;
		}

		// Move and Remove element
		move(parent) {
			if (this !== parent) {
				let i = this.parent.children.indexOf(this);
				if (i !== -1)
					this.parent.children.splice(i, 1);
				if (parent)
					parent.children.push(this);
				else {
					// TODO: while visiting the site remove shortcuts that point to nothing
					delete this;
					return;
				}
			}
		}
		remove() {
			this.move();
		}

		// Semantic URL based on element name and active language
		slug(full) {
			if (full)
				return _slug(this);
			return this.name().trim().toLowerCase().replace(/[^a-z0-9 _-]/g, '').replace(/\s+/g, '_');

			function _slug(element) {
				if (!element || (!(element instanceof webspinner.Area) && element instanceof webspinner.Webo))
					return '';
				return _slug(element.parent) + '/' + element.name().trim().toLowerCase().replace(/[^a-z0-9 _-]/g, '').replace(/\s+/g, '_');
			}
		}

		permalink() {
			if (this.parent)
				return this.parent.permalink() + '/' + this.slug();
			return '';
		}

		getElementById(id) { // TODO: Make index to speed-up
			if (this.id === id)
				return this;
			for (let child of this.children) {
				let el = child.getElementById(id);
				if (el)
					return el;
			}
			return null;
		}

		write() {
			let fragment;

			fragment = '<name>\n';
			for (let name in this._name)
				fragment += `<text lang="${name}"><![CDATA[${this._name[name]}]]></text>\n`;
			fragment += '</name>\n';

			if (this.children.length > 0) {
				fragment += '<children>\n';
				this.children.forEach(child => fragment += child.write());
				fragment += '</children>\n';
			}

			if (Object.keys(this.rbv).length > 0) {
				fragment += '<authorizations>\n';
				for (let role in this.rbv)
					fragment += `<authorize role="${role}" permission="${['-', 'r', 'w', 'x'][this.rbv[role]]}"/>\n`;
				fragment += '</authorizations>\n';
			}

			return fragment;
		}
	};
};