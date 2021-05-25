const FLAT_DEPTH = 2

class DOMBuilderElement {
	/**
	 * the wrapped node
	 * @type {Node}
	 */
	_node

	/**
	 * wrap or create a node
	 * @param {string | Node} tag either a node or a string to use as parameter of document.createElement
	 * @param {string} [ns] the namespace for that tag (only used if tag is a string)
	 * @param {ElementCreationOptions} [elementCreationOption] only used if tag is a string
	 */
	constructor(tag, ns = builder.namespace.default, elementCreationOption) {
		if (tag instanceof Node) {
			this._node = tag
		} else {
			this._node = document.createElementNS(ns, tag, elementCreationOption)
		}
	}

	/**
	 * get or set node classes (if node can have class)
	 * 	- class() : returns node.classList
	 * 	- class(string) : add the named class to the node
	 * 	- class(string[]) : add class each class of the array to the node
	 * 	- class({[string]: boolean}) : toggle each class named by the keys to the state given by the boolean
	 *
	 * array parameters can be nested and can contains object following the object parameter format
	 *
	 * if node can't have classes (TextNode or CommentNode), returns undefined
	 * @param {string, string[], Object.<string, boolean>} args
	 * @returns {DOMBuilderElement}
	 */
	class(...args) {
		if (! this._node.classList) {return undefined}

		if (args.length === 0) {
			return this._node.classList
		}

		args.flat(FLAT_DEPTH).forEach(classDesc => {
			if (typeof classDesc === "string" || classDesc instanceof String) {
				this._node.classList.add(classDesc)
			} else if (typeof classDesc === "object") {
				Object.entries(classDesc).forEach(([name, value]) => this._node.classList.toggle(name, Boolean(value)))
			}
		})
		return this
	}

	/**
	 * append the given args to the node
	 * @param {DOMBuilderElement | Node | Object} args
	 * @returns {DOMBuilderElement}
	 */
	append(...args) {
		args.flat(FLAT_DEPTH).forEach(child => {
			if (child instanceof DOMBuilderElement) {
				this._node.appendChild(child.node)
			} else if (child instanceof Node) {
				this._node.appendChild(child)
			} else {
				this._node.appendChild(builder.text(child.toString()).node)
			}
		})
		return this
	}

	/**
	 * get or set the id of the node
	 * 	- id() : gets the node id
	 * 	- id(Object) : sets the id of the node to value.toString()
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement|string} this if used as a setter, the current id is used as a getter
	 */
	id(value) {
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be have a toString()")
			}
			this._node.id = value.toString()
			return this
		}
		return this._node.id
	}

	/**
	 * get or set the textContent of the node
	 * 	- text() : gets the node textContent
	 * 	- text(Object) : sets the textContent of the node to value.toString()
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement|string} this if used as a setter, the current textContent is used as a getter
	 */
	text(value) {
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be have a toString()")
			}
			this._node.textContent = value.toString()
			return this
		}
		return this._node.textContent
	}

	/**
	 * get or set the innerHTML of the node
	 * 	- html() : gets the node innerHTML
	 * 	- html(Object) : sets the innerHTML of the node to value.toString()
	 *
	 * if the node is a TextNode or CommentNode, use text() to edit the displayed text
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} [value]
	 * @returns {DOMBuilderElement | string} this if used as a setter, the current innerHTML is used as a getter
	 */
	html(value) {
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be a string")
			}
			this._node.innerHTML = value.toString()
			return this
		}
		return this._node.innerHTML
	}

	/**
	 * get or set node attributes (if node can have attribute)
	 * 	- attr(string) : returns the attribute whose name is the argument
	 * 	- attr(string, string) : sets the attribute named by the first arg to the second arg
	 * 	- attr({[string]: string | undefined | null}) : for each entry of the object :
	 * 		- if the value is a string, set the attribute named by the key to the value
	 * 		- if the value is null or undefined, remove the attribute named by the key
	 *
	 * args can be an array of objects, following the same rules of when args is an object
	 *
	 * if node can't have attributes (TextNode or CommentNode), returns undefined
	 * @param { Array<Object.<string, string>> | Object.<string, string> | string } args
	 * @returns { DOMBuilderElement | string }
	 */
	attr(...args) {
		if (! this._node.setAttribute) {return undefined}

		if (args.length === 1 && (typeof args[0] === "string" || args[0] instanceof String)) {
			return this._node.getAttribute(args[0])
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
					this._node.setAttribute(attributeName, value)
				} else {
					this._node.removeAttribute(attributeName)
				}
			}
		}
		return this
	}

	/**
	 * set events listener for the node
	 * if the event name starts with "on" ("onclick", "onchange", ...) it sets that property of the node to the function
	 * 		node.onclick = function
	 * otherwise, it calls addEventListener(name, function) on the node
	 *
	 * 	- events(string, function) : set the event named by the string argument to the function argument
	 * 	- events({[string]: function}) : set the events named by the keys to the function stored in the corresponding values
	 *
	 * args can be an array of objects, following the same rules of when args is an object
	 * @param { string | function | Object.<string, function> | Array<Object.<string, function>> } args
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
						this._node[eventName] = handler
					} else {
						this._node.addEventListener(eventName, handler)
					}
				}
			}
		}
		return this
	}

	/**
	 * call the given function with the node as argument
	 * @param {function(Node)} callback
	 * @return {DOMBuilderElement}
	 */
	cb(callback) {
		callback(this._node)
		return this
	}

	/**
	 * gets the wrapped node
	 * @returns {Node}
	 */
	get node() {
		return this._node
	}

	/**
	 * create a copy wrapping a deep clone of the node
	 * @returns {DOMBuilderElement}
	 */
	get clone() {
		return builder(this._node.cloneNode(true))
	}
}

class BuilderArgs {
	/**
	 * @type {string}
	 */
	_namespace
	/**
	 * @type {ElementCreationOptions}
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
 * wrap a DOM element in order to make it less verbose to use
 * @param {string | Node | DOMBuilderElement} tag if string, the tagname of a newly created element, else the element to wrap
 * @param {!BuilderArgs} [args] some args for the creation of new tags
 * @returns {DOMBuilderElement}
 */
function builder(tag, args) {
	if (tag instanceof DOMBuilderElement) { return tag }
	const builderArgs = new BuilderArgs(args)
	return new DOMBuilderElement(tag, builderArgs.namespace, builderArgs.elementCreationOptions)
}

/**
 * some namespace constants
 * @type {{[string]: string}}
 */
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
builder.ns = builder.namespace
Object.freeze(builder.namespace)

/**
 * generate a wrapped comment node
 * @param {string} comment the text contained in the created CommentNode
 * @returns {DOMBuilderElement}
 */
builder.comment = comment => {
	return builder(document.createComment(comment))
}
/**
 * generate a wrapped text node
 * @param {string} content the text contained in the created TextNode
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
 * clone the inputted element the number of time asked, then call the forEachCallback for each newly created element
 * @param {number} count the number of element to create
 * @param {DOMBuilderElement | Node | Object} tag see {@link builder}
 * @param {BuilderArgs} [builderArgs] see {@link builder}
 * @param {builder~repeatCallback} [forEachCallback] function to call on each of the created elements
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
