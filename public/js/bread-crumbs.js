'use strict';

window.customElements.define('bread-crumbs', class extends HTMLElement {
	constructor () {
		super();

		this.compStyle = window.getComputedStyle(this);
		let shadowRoot = this.attachShadow({mode: 'open'});

		shadowRoot.innerHTML = `
			<style>
				:host {
					overflow: hidden;
					display: block;
				}
				nav {
					max-width: 100%;
					box-sizing: border-box;
				}
				nav > ul {
					display: flex;
					align-items: center;
					overflow-x: auto;
					gap: var(--item-gap, 10px);
					max-width: 100%;
					box-sizing: border-box;
					padding: 0;
					margin: 0;
					scrollbar-width: none;
				}
				nav > ul::-webkit-scrollbar {
					height: 0;
				}
				a:first-of-type:not(.crumb) {
					display: flex;
					align-items: center;
					gap: var(--icon-gap, 2px);
				}
				@media (max-width: 480px) {
					a:first-of-type:not(.crumb) > .home-label {
						display: none;
					}
				}
				a:focus {
					outline: 0;
					box-shadow: 0 0 1px 1px black;
				}
				nav > ul > li {
					position: relative;
				}
				.crumb {
					display: inline-flex;
					align-items: center;
					gap: var(--icon-gap);
				}
				.crumb > span:not(.crumbicon) {
					margin: 1px;
				}
				.crumb > span {
					white-space: nowrap;
				}
				.crumb a[aria-current=page] {
					font-weight: 700;
				}
				.crumb.tree-changed ~ * {
					display: none;
				}
				.crumb:not(:last-child):after {
					content: var(--divider, '/');
					position: absolute;
					right: calc(var(--item-gap, 10px) * -1);
					width: var(--item-gap, 10px);
					text-align: center;
					color: var(--divider-color, #aaa);
					font-size: 11px;
				}
				.disguised-select {
					inline-size: 100%;
					block-size: 100%;
					opacity: .01;
					font-size: min(100%, 16px);
				}
				.crumbicon {
					--size: 2ch;
					display: grid;
					grid: [stack] var(--size)/[stack] var(--size);
					align-items:c enter;
					justify-items: center;
					place-items: center;
					border-radius: 30%;
					--icon-shadow-size: 0px;
					box-shadow: inset 0 0 0 var(--icon-shadow-size) currentColor;
					position: relative;
				}
				.crumbicon:not(.homeicon) {
					left: 3px;
					margin-left: -3px;
				}
				@media (prefers-reduced-motion: no-preference) {
					.crumbicon {
						transition: box-shadow .2s ease;
					}
				}
				.crumb:is([focus-within], :hover) > .crumbicon {
					--icon-shadow-size: 1px;
				}
				.crumb:is(:focus-within, :hover) > .crumbicon {
					--icon-shadow-size: 1px;
				}
				.crumb > .crumbicon:is([focus-within], :hover) {
					--icon-shadow-size: 2px;
				}
				.crumb > .crumbicon:is(:focus-within, :hover) {
					--icon-shadow-size: 2px;
				}
				.crumb > .crumbicon:is([focus-within], :hover) svg {
					stroke-width: 1px;
				}
				.crumb > .crumbicon:is(:focus-within, :hover) svg {
					stroke-width: 1px;
				}
				.crumbicon > * {
					grid-area: stack;
				}
				.crumbicon > svg {
					max-block-size: 100%;
					stroke: currentColor;
					fill: currentColor;
					stroke-linecap: round;
					stroke-linejoin: round;
					stroke-width: 0px;
				}
				.github-corner {
					fill: CanvasText;
					color: Canvas;
				}
				.github-corner:hover .octo-arm {
					-webkit-animation: octocat-wave 560ms ease-in-out;
					animation: octocat-wave 560ms ease-in-out;
				}
				@-webkit-keyframes octocat-wave {
					0%,100% {
						transform:rotate(0);
					}
					20%,60% {
						transform:rotate(-25deg);
					}
					40%,80% {
						transform:rotate(10deg);
					}
				}
				@keyframes octocat-wave{
					0%,100% {
						transform:rotate(0);
					}
					20%,60% {
						transform:rotate(-25deg);
					}
					40%,80% {
						transform:rotate(10deg);
					}
				}
			</style>
			<svg style="display: none;" viewBox="0 0 24 24">
				<symbol id="icon-home">
					<title>A home icon</title>
					<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
				</symbol>
				<symbol id="icon-dropdown-arrow">
					<title>A down arrow</title>
					<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
				</symbol>
			</svg>
			<nav role="navigation" part="nav"></nav>
		`;
	}

	escapeUrl (text) {
		return text.replace(/"/g, '%22');
	}
	escapeHTML (text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
	}

	generate (data) {
		let build = '<ul>';

		data.nav.forEach((node, index) => {
			if (Array.isArray(node)) {
				let active = node[0];
				let options = '';
				node.forEach(child => {
					options += `<option name=""`;
					if (child.state === 'active') {
						active = child;
						options += ' selected';
						options += ' disabled';
					}
					options += ` value="${this.escapeUrl(child.link)}">${this.escapeHTML(child.label)}</option>`;
				});
				let a = `<a href="${this.escapeUrl(active.link)}" part="a">${active.label}</a>`;
				if (data.nav.length === index + 1) {
					a = active.label;
				}
				build += `<li class="crumb">
					<span>${a}</span>
					<span class="crumbicon">
						<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
							<use href="#icon-dropdown-arrow"/>
						</svg>
						<select class="disguised-select">${options}</select>
					</span>
				</li>`;
			}
			else {
				if ((index === 0) && (node.link !== undefined)) {
					build += `<li class="crumb"><span><a href="${this.escapeUrl(node.link)}" part="a"><span class="crumbicon homeicon"><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><use href="#icon-home"/></svg></span><span class="home-label">${node.label}</span></a></span></li>`;
				}
				else if ((node.link !== undefined) && (data.nav.length !== index + 1)) {
					build += `<li class="crumb"><span><a href="${this.escapeUrl(node.link)}" part="a">${node.label}</a></span></li>`;
				}
				else {
					build += `<li class="crumb"><span>${node.label}</span></li>`;
				}
			}
		});

		build += '</ul>';

		this.shadowRoot.querySelector('nav').innerHTML = build;
		this.shadowRoot.querySelector('nav > ul').scrollLeft = 10000000;
	}

	connectedCallback () {
		let data = new Function(`"use strict"; return ${this.getAttribute('use')};`)();
		this.generate(data);

		(new ResizeObserver(entries => {
			this.shadowRoot.querySelector('nav > ul').scrollLeft = 10000000;
		})).observe(this);

		this.shadowRoot.addEventListener('change', (e) => {
			e.preventDefault();
			document.location.href = e.target.value;
			return false;
		});
	}
});
