const FLAT_DEPTH = 2

class DOMBuilderElement {
	/**
	 * @type {Node}
	 * @private
	 */
	_element

	/**
	 * @param {string | Node} tag
	 * @param {string} [ns]
	 * @param {ElementCreationOptions} [elementCreationOption]
	 */
	constructor(tag, ns = builder.namespace.default, elementCreationOption) {
		if (tag instanceof Node) {
			this._element = tag
		} else {
			this._element = document.createElementNS(ns, tag, elementCreationOption)
		}
	}
	
	/**
	class("test")
	class(["test"])
	class({test: true})
	*/
	/**
	 * @param {string, string[], Object.<string, boolean>} args
	 * @returns {DOMBuilderElement}
	 */
	class(...args) {
		if (args.length === 0) {
			return this._element.classList
		}
		
		args.flat(FLAT_DEPTH).forEach(classDesc => {
			if (typeof classDesc === "string" || classDesc instanceof String) {
				this._element.classList.add(classDesc)
			} else if (typeof classDesc === "object") {
				Object.entries(classDesc).forEach(([name, value]) => this._element.classList.toggle(name, Boolean(value)))
			}
		})
		return this
	}

	/**
	 * @param {DOMBuilderElement | Node | Object} args
	 * @returns {DOMBuilderElement}
	 */
	append(...args) {
		args.flat(FLAT_DEPTH).forEach(child => {
			if (child instanceof DOMBuilderElement) {
				this._element.appendChild(child.node)
			} else if (child instanceof Node) {
				this._element.appendChild(child)
			} else {
				this._element.appendChild(builder.text(child.toString()).node)
			}
		})
		return this
	}

	/**
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement|string} this if used as a setter, the current id is used as a getter
	 */
	id(value) {
		if (! this._element instanceof Element) {
			throw new TypeError("This method doesn't work when element is not instance of the Element class")
		}
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be a string")
			}
			this._element.id = value.toString()
			return this
		}
		return this._element.id
	}

	/**
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement|string} this if used as a setter, the current textContent is used as a getter
	 */
	text(value) {
		if (! this._element instanceof Element) {
			throw new TypeError("This method doesn't work when element is not instance of the Element class")
		}
		if(value !== undefined) {
			this._element.textContent = value.toString()
			return this
		}
		return this._element.textContent
	}

	/**
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement | string} this if used as a setter, the current innerHTML is used as a getter
	 */
	html(value) {
		if (! this._element instanceof Element) {
			throw new TypeError("This method doesn't work when element is not instance of the Element class")
		}
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be a string")
			}
			this._element.innerHTML = value.toString()
			return this
		}
		return this._element.innerHTML
	}

	/**
	 * @typedef {string[]} DestructuredAttribute
	 * @property {string} destructuredAttribute.name
	 * @property {string} destructuredAttribute.value
	 */
	/**
	 * @param { DestructuredAttribute | Object.<string, string> | Array<Object.<string, string>> | string } args
	 * @returns { DOMBuilderElement | string }
	 */
	attr(...args) {
		if (args.length === 1 && (typeof args[0] === "string" || args[0] instanceof String)) {
			return this._element.getAttribute(args[0])
		}

		if (args.length === 2 &&
			typeof args[0] === "string" || args[0] instanceof String &&
			typeof args[1] === "string" || args[1] instanceof String
		) {
			args = [{[args[0]]: args[1]}]
		}

		for(const attributeList of args.flat(FLAT_DEPTH)) {
			for(const attributeName of Object.getOwnPropertyNames(attributeList)) {
				const value = attributeList[attributeName]
				if (value !== undefined && value !== null) {
					this._element.setAttribute(attributeName, value)
				} else {
					this._element.removeAttribute(attributeName)
				}
			}
		}
		return this
	}

	/**
	 * @typedef {string[]} DestructuredEvent
	 * @property {string} destructuredAttribute.name
	 * @property {function} destructuredAttribute.handler
	 */
	/**
	 * @param { DestructuredEvent | Object.<string, function> | Array<Object.<string, function>> } args
	 * @returns {DOMBuilderElement}
	 */
	events(...args) {
		if (args.length === 2 &&
			typeof args[0] === "string" || args[0] instanceof String &&
			typeof args[1] === "function"
		) {
			args = [{[args[0]]: args[1]}]
		}

		for(const eventList of args.flat(FLAT_DEPTH)) {
			for(const eventName of Object.getOwnPropertyNames(eventList)) {
				const handler = eventList[eventName]
				if (typeof handler === "function") {
					if (eventName.startsWith("on")) {
						this._element[eventName] = handler
					} else {
						this._element.addEventListener(eventName, handler)
					}
				}
			}
		}
		return this
	}

	/**
	 * @param {function(Node)} callback
	 * @return {DOMBuilderElement}
	 */
	cb(callback) {
		callback(this._element)
		return this
	}

	/**
	 * @returns {Node}
	 */
	get node() {
		return this._element
	}

	/**
	 * deep clone the current element
	 * @returns {DOMBuilderElement}
	 */
	get clone() {
		return builder(this._element.cloneNode(true))
	}
}


class BuilderArgs {
	/**
	 * @type {string}
	 * @private
	 */
	_namespace
	/**
	 * @type {ElementCreationOptions}
	 * @private
	 */
	_elementCreationOptions

	/**
	 * @param {string} [namespace]
	 * @param {string} [ns]
	 * @param {ElementCreationOptions} [elementCreationOptions]
	 * @param {ElementCreationOptions} [options]
	 * @param {ElementCreationOptions} [opt]
	 */
	constructor({namespace, ns, elementCreationOptions, options, opt} = {}) {
		this._namespace = ns ?? namespace ?? builder.namespace.default
		this._elementCreationOptions = opt ?? options ?? elementCreationOptions ?? {}
	}

	/**
	 * @returns {string}
	 */
	get namespace() {return this._namespace}
	/**
	 * @returns {ElementCreationOptions}
	 */
	get elementCreationOptions() {return this._elementCreationOptions}
}

/**
 * @param {string | Node | DOMBuilderElement} tag
 * @param {!BuilderArgs} [args]
 * @returns {DOMBuilderElement}
 */
function builder(tag, args) {
	if (tag instanceof DOMBuilderElement) { return tag }
	const builderArgs = new BuilderArgs(args)
	return new DOMBuilderElement(tag, builderArgs.namespace, builderArgs.elementCreationOptions)
}

builder.namespace = {
	html: "http://www.w3.org/1999/xhtml",
	svg: "http://www.w3.org/2000/svg",
	mathML : "http://www.w3.org/1998/Math/MathML"
}
builder.namespace = {...builder.namespace, ...{
	default: builder.namespace.html,
	HTML: builder.namespace.html,
	SVG: builder.namespace.svg,
	MATH_ML: builder.namespace.mathML
}}
builder.namespace = {...builder.namespace, ...{
	default: builder.namespace.html,
	HTML: builder.namespace.html,
	SVG: builder.namespace.svg,
	MATH_ML: builder.namespace.mathML
}}
builder.ns = builder.namespace
Object.freeze(builder.namespace)

/**
 * generate a comment node
 * @param {string} comment
 * @returns {DOMBuilderElement}
 */
builder.comment = comment => {
	return builder(document.createComment(comment))
}
/**
 * generate a text node
 * @param {string} content
 * @returns {DOMBuilderElement}
 */
builder.text = content => {
	return builder(document.createTextNode(content))
}

/**
 * type of the callback executed on each element generated by the builder.repeat fonction
 *
 * @callback builder~repeatCallback
 * @param {DOMBuilderElement} element
 * @param {number} index
 * @param {DOMBuilderElement[]} array
 */

/**
 * @param {number} count
 * @param {DOMBuilderElement | Node | Object} tag
 * @param {BuilderArgs} [builderArgs]
 * @param {builder~repeatCallback} [forEachCallback]
 * @return {DOMBuilderElement[]}
 */
builder.repeat = (count, tag, builderArgs, forEachCallback) => {
	let array = []
	if (tag instanceof Node) {
		array = Array(count).fill(true).map(() => builder(tag).clone)
	} else if (tag instanceof DOMBuilderElement) {
		array = Array(count).fill(true).map(() => tag.clone)
	} else {
		array = Array(count).fill(true).map(() => builder(tag.toString(), builderArgs))
	}
	if (forEachCallback && typeof forEachCallback === "function") {
		array.forEach(forEachCallback)
	}
	return array
}

export default builder
