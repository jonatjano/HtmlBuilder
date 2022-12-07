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
	 * get node classes (if node can have class)
	 * if node can't have classes (TextNode or CommentNode), returns undefined
	 * @returns {?DOMTokenList}
	 *//**
	 * set node classes (if node can have class)
	 * 	- class(string) : add the named class to the node
	 * 	- class(string[]) : add each class of the array to the node
	 * 	- class({[k: string]: boolean}) : toggle each class named by the keys to the state given by the boolean value
	 *
	 * array parameters can be nested and can contain object following the object parameter format
	 *
	 * if node can't have classes (TextNode or CommentNode), does nothing and returns this
	 * @param {string | string[] | Object<string, boolean>} args
	 * @returns {this}
	 */
	class(...args) {
		if (args.length === 0) {
			if (! this._node.classList) {return undefined}
			return this._node.classList
		}

		if (! this._node.classList) {return this}
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
	 * @param {DOMBuilderElement | Node | Object | Array<DOMBuilderElement | Node | Object>} args
	 * @returns {this}
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
	 * less verbose way to call append(htmlBuilder.repeat(buildCallback))
	 *
	 * @param {builder~buildCallback} buildCallback function to call on each of the created elements
	 * @return {this}
	 * @see {@link builder.repeat}
	 *//**
	 * less verbose way to call append(htmlBuilder.repeat(count, repeatCallback))
	 *
	 * @param {number} count the number of element to create
	 * @param {builder~repeatCallback} repeatCallback function to call on each of the created elements
	 * @return {this}
	 * @see {@link builder.repeat}
	 *//**
	 * less verbose way to call append(htmlBuilder.repeat(count, tag, builderArgs, repeatCallback))
	 *
	 * @param {number} count the number of element to create
	 * @param {DOMBuilderElement | Node | Object} tag see {@link builder}
	 * @param {BuilderArgs} [builderArgs] see {@link builder}
	 * @param {builder~repeatCallback} [repeatCallback] function to call on each of the created elements
	 * @return {this}
	 * @see {@link builder.repeat}
	 */
	appendRepeat(count, tag, builderArgs, repeatCallback) {
		return this.append(builder.repeat(count, tag, builderArgs, repeatCallback))
	}

	/**
	 * get the id of the node
	 *
	 * @returns {string} the current id
	 *//**
	 * set the id of the node
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} value
	 * @returns {this}
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
	 * get the textContent of the node
	 *
	 * @returns {string} the current textContent
	 *//**
	 * set the textContent of the node
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} value
	 * @returns {this}
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
	 * get the innerHTML of the node
	 *
	 * if the node doesn't have a innerHTML, calls text()
	 *
	 * @returns {string} the current innerHTML
	 *//**
	 * set the textContent of the node
	 *
	 * if the node doesn't have a innerHTML, calls text()
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} value
	 * @returns {this}
	 */
	html(value) {
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must be a string")
			}
			if (typeof this._node.innerHTML === "string") {
				this._node.innerHTML = value.toString()
			} else {
				this.text(value.toString())
			}
			return this
		}
		return this._node.innerHTML ?? this.text()
	}

	/**
	 * get node attribute by name
	 *
	 * if node can't have attributes (TextNode or CommentNode), returns undefined
	 *
	 * @param {string} name
	 * @returns {string} the attribute value
	 *//**
	 * set node attributes
	 * 	- attr(string, string) : sets the attribute named by the first arg to the second arg
	 * 	- attr({[string]: string | undefined | null}) : for each entry of the object :
	 * 		- if the value is a string, set the attribute named by the key to the value
	 * 		- if the value is null or undefined, remove the attribute named by the key
	 *
	 * args can be an array of objects, following the same rules of when args is an object
	 *
	 * if node can't have attributes (TextNode or CommentNode), does nothing and returns this
	 * @param { Array<Object.<string, string>> | Object.<string, string> | string } args
	 * @returns {this}
	 */
	attr(...args) {
		if (args.length === 1 && (typeof args[0] === "string" || args[0] instanceof String)) {
			return this._node.getAttribute?.(args[0])
		}

		if (! this._node.setAttribute) {return undefined}
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
	 * @returns {this}
	 */
	event(...args) {
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
	 * easy access to element.querySelector
	 * @param {string} query
	 * @param {true} nakedNode
	 * @return {Node|null} null when node doesn't have a element.querySelector method
	 *//**
	 * easy access to element.querySelector
	 * @param {string} query
	 * @param {false} [nakedNode = false]
	 * @return {DOMBuilderElement|null} null when node doesn't have a element.querySelector method
	 */
	querySelector(query, nakedNode = false) {
		if (this._node.querySelector) {
			const node = this._node.querySelector(query)
			return nakedNode ? node : new DOMBuilderElement(node)
		}
		return null
	}

	/**
	 * easy access to element.querySelectorAll
	 * @param {string} query
	 * @param {true} nakedNodes
	 * @return {NodeList|null} null when node doesn't have a element.querySelector method
	 */	/**
	 * easy access to element.querySelectorAll
	 * @param {string} query
	 * @param {false} [nakedNodes = false]
	 * @return {DOMBuilderElement[]|null} null when node doesn't have a element.querySelector method
	 */
	querySelectorAll(query, nakedNodes = false) {
		if (this._node.querySelectorAll) {
			const nodes = this._node.querySelectorAll(query)
			return nakedNodes ? nodes : [...nodes].map(node => new DOMBuilderElement(node))
		}
		return null
	}


	/**
	 * @callback DOMBuilderElement~nodeCallback
	 * @param {Node} node the node
	 */
	/**
	 * call the given function with the node as argument
	 * @param {DOMBuilderElement~nodeCallback} callback
	 * @return {this}
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
	#namespace
	/**
	 * @type {ElementCreationOptions}
	 */
	#elementCreationOptions

	/**
	 * @param {object} paramBag
	 * @property {string} [namespace]
	 * @property {string} [ns]
	 * @property {ElementCreationOptions} [elementCreationOptions]
	 * @property {ElementCreationOptions} [options]
	 * @property {ElementCreationOptions} [opt]
	 */
	constructor({namespace, ns, elementCreationOptions, options, opt} = {}) {
		this.#namespace = ns ?? namespace ?? builder.namespace.default
		this.#elementCreationOptions = opt ?? options ?? elementCreationOptions ?? {}
	}

	/**
	 * @returns {string}
	 */
	get namespace() {return this.#namespace}
	/**
	 * @returns {ElementCreationOptions}
	 */
	get elementCreationOptions() {return this.#elementCreationOptions}
}

/**
 * @namespace builder
 */
/**
 * wrap a DOM element in order to make it less verbose to use
 *
 * @memberOf builder
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
 * some xml namespace constants
 * @type {Object<string, string>}
 * @memberOf builder
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
 * @memberOf builder
 * @param {string} comment the text contained in the created CommentNode
 * @returns {DOMBuilderElement}
 */
builder.comment = comment => {
	return builder(document.createComment(comment))
}
/**
 * generate a wrapped text node
 * @memberOf builder
 * @param {string} content the text contained in the created TextNode
 * @returns {DOMBuilderElement}
 */
builder.text = content => {
	return builder(document.createTextNode(content))
}

/**
 * type of the callback executed on each element generated by the builder.repeat function when count is given
 *
 * @callback builder~repeatCallback
 * @param {DOMBuilderElement} element current element
 * @param {number} index current index
 * @param {DOMBuilderElement[]} array the array
 * @return {?DOMBuilderElement} if always undefined, does a foreach, else does a map
 */
/**
 * type of the callback executed on each element generated by the builder.repeat function when there is no count given
 *
 * @callback builder~buildCallback
 * @param {number} index current index
 * @return {?DOMBuilderElement} the created element
 */
/**
 * create new elements as long as buildCallback returns something different from undefined
 * @memberOf builder
 *
 * @param {builder~buildCallback} buildCallback function to call on each of the created elements
 * @return {DOMBuilderElement[]}
 *//**
 * clone the inputted element the number of time asked, then call the forEachCallback for each newly created element
 * if tag and repeatCallback are both undefined, return an array of size count filled with nulls
 * @memberOf builder
 *
 * @param {number} count the number of element to create
 * @param {builder~repeatCallback} repeatCallback function to call on each of the created elements
 * @return {DOMBuilderElement[]}
 *//**
 * clone the inputted element the number of time asked, then call the forEachCallback for each newly created element
 * if tag and repeatCallback are both undefined, return an array of size count filled with nulls
 * @memberOf builder
 *
 * @param {number} count the number of element to create
 * @param {DOMBuilderElement | Node | Object} tag see {@link builder}
 * @param {BuilderArgs} [builderArgs] see {@link builder}
 * @param {builder~repeatCallback} [repeatCallback] function to call on each of the created elements
 * @return {DOMBuilderElement[]}
 */
builder.repeat = (count, tag, builderArgs, repeatCallback) => {
	if (typeof count === "function") {
		repeatCallback = count
		let i = 0
		let finalArray = []
		let ret = repeatCallback(i++)
		while (ret !== undefined) {
			finalArray.push(ret)
			ret = repeatCallback(i++)
		}
		return finalArray
	} else if (typeof tag === "function") {
		repeatCallback = tag
		tag = undefined
		builderArgs = undefined
	} else if (typeof builderArgs === "function") {
		repeatCallback = builderArgs
		builderArgs = undefined
	}

	let array = Array(count).fill(null)

	if (tag !== undefined) {
		if (tag instanceof Node) {
			array = array.map(() => builder(tag).clone)
		} else if (tag instanceof DOMBuilderElement) {
			array = array.map(() => tag.clone)
		} else {
			array = array.map(() => builder(tag.toString(), builderArgs))
		}
	}
	if (repeatCallback && typeof repeatCallback === "function") {
		if (tag !== undefined) {
			let newArray = array.map(repeatCallback)
			if (! newArray.every(e => e === undefined)) {
				array = newArray
			}
		} else {
			array = array.map(repeatCallback)
		}
	}
	return array
}

export default builder
