const FLAT_DEPTH = 2
const PARSER_TOKEN_COUNT = 5
const PARSER_TOKEN_HTML_LOOP = "html-loop"

/**
 * Wrapper around html nodes
 */
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
	 * @param {builder~BuilderArgs} [builderArgs] see {@link builder}
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
	 * set the innerHTML of the node
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
	 * set events listener for the node<br/>
	 * if the event name starts with "on" ("onclick", "onchange", ...) it sets that property of the node to the function (node.onclick = function)<br/>
	 * otherwise, it calls addEventListener(name, function) on the node<br/>
	 * <br/>
	 * 	- events(string, function) : set the event named by the string argument to the function argument<br/>
	 * 	- events(Object&lt;string, function&gt;) : set the events named by the keys to the function stored in the corresponding values<br/>
	 * <br/>
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
	 * easy access to node.querySelector
	 * @param {string} query
	 * @param {true} nakedNode
	 * @return {Node|null} null if node doesn't have querySelector method
	 *//**
	 * easy access to node.querySelector
	 * @param {string} query
	 * @param {false} [nakedNode = false]
	 * @return {DOMBuilderElement|null} null if node doesn't have querySelector method
	 */
	querySelector(query, nakedNode = false) {
		if (this._node.querySelector) {
			const node = this._node.querySelector(query)
			return nakedNode ? node : new DOMBuilderElement(node)
		}
		return null
	}

	/**
	 * easy access to node.querySelectorAll
	 * @param {string} query
	 * @param {true} nakedNodes
	 * @return {NodeList|null} null if node doesn't have querySelectorAll method
	 *//**
	 * easy access to node.querySelectorAll
	 * @param {string} query
	 * @param {false} [nakedNodes = false]
	 * @return {DOMBuilderElement[]|null} null if node doesn't have querySelectorAll method
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
	 * replace the node with a clean new node of the same tag and namespace
	 * @param {boolean} [keepId = true] if true, the id of the node will be kept
	 * @return {this}
	 */
	reset(keepId = true) {
		let newNode = null
		if (this._node.tagName) {
			newNode = document.createElementNS(this._node.namespaceURI, this._node.tagName.toLowerCase(), this._node._elementCreationOptions ?? {})
		} else {
			switch (this._node.nodeType) {
				case Node.COMMENT_NODE: {
					newNode = document.createComment(this._node.textContent)
					break
				}
				case Node.TEXT_NODE: {
					newNode = document.createTextNode(this._node.textContent)
					break
				}
				case Node.CDATA_SECTION_NODE: {
					newNode = document.createCDATASection(this._node.textContent)
					break
				}
			}
		}
		if (newNode === null) {
			throw "Couldn't create a new node"
		}
		if (keepId && this._node.id && newNode.id) {
			newNode = this._node.id
		}

		this._node.replaceWith(newNode)
		this._node = newNode
		return this
	}

	/**
	 * remove every child element
	 * @return {this}
	 */
	empty() {
		while (this._node.childNodes.length) { this._node.firstChild.remove(); }
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

/**
 * @namespace builder
 */

/**
 * @typedef builder~BuilderArgs
 * @property {string} namespace
 * @property {string} ns
 * @property {ElementCreationOptions} elementCreationOptions
 * @property {ElementCreationOptions} options
 */

/**
 * wrap a DOM element in order to make it less verbose to use
 *
 * @memberOf builder
 * @param {string | Node | DOMBuilderElement} tag if string, the tagname of a newly created element, else the element to wrap
 * @param {builder~BuilderArgs} [args] some args for the creation of new tags
 * @returns {DOMBuilderElement}
 */
function builder(tag, args) {
	if (tag instanceof DOMBuilderElement) { return tag }
	const builderArgs = {
		namespace: args?.namespace ?? args?.ns,
		elementCreationOptions: args?.elementCreationOptions ?? args?.options
	}
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
 * @param {builder~BuilderArgs} [builderArgs] see {@link builder}
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

/**
 * @private
 */
function parserVisitor(element, args, symbolValues, argTagName) {
	// return immediately if element is not an HTMLElement (not supposed to happen)
	if (element.children) {
		// if the element is an argument tag
		if (element.tagName === argTagName.toUpperCase()) {
			const input = args[+element.textContent]
			if (typeof input === "symbol") {
				element.outerHTML = symbolValues.get(input)
			} else if (typeof input === "object") {
				element.outerHTML = JSON.stringify(input)
			} else {
				element.outerHTML = input.toString()
			}
		}

		// if the element has attributes, find argument tag in there
		if (element.attributes.length) {
			const attributes = [...element.attributes]
			// element who'll be used to parse the attribute value like some html
			// allows us to navigate it using DOM api
			const doc = document.createElement("div")

			attributes.forEach(attrib => {
				// actual moment when the attribute value is parsed
				doc.innerHTML = attrib.value

				// start with special attributes
				if (attrib.name === PARSER_TOKEN_HTML_LOOP) {
					// loop
					const validateIndexArg = arg => typeof arg === "symbol" && symbolValues.has(arg)
					const validateValueArg = arg => typeof arg === "symbol" && symbolValues.has(arg)
					const validateIterableArg = arg => Array.isArray(arg) || arg instanceof Map || arg instanceof Set || typeof arg === "object"

					const nodes = doc.childNodes
					const parameters = {
						index: null,
						value: null,
						iterable: []
					}
					// TODO: that if/else if/else is horrendous, find a way to make it cleaner
					// 	there are so many repetitions in there, there must be a way
					if (nodes.length === 2 &&
						nodes[0].nodeType === Node.ELEMENT_NODE && nodes[0].tagName === argTagName.toUpperCase() &&
						nodes[1].nodeType === Node.TEXT_NODE && nodes[1].textContent.startsWith(";")
					) {
						const valueArg = args[+nodes[0].textContent]
						if (! validateValueArg(valueArg)) { throw `${PARSER_TOKEN_HTML_LOOP} value argument must be a parser symbol` }

						const iterableArg = JSON.parse(nodes[1].textContent.substring(1))
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_HTML_LOOP} iterable argument must be iterable` }

						parameters.value = valueArg
						parameters.iterable = iterableArg
					} else if (nodes.length === 3 &&
						nodes[0].nodeType === Node.ELEMENT_NODE && nodes[0].tagName === argTagName.toUpperCase() &&
						nodes[1].nodeType === Node.TEXT_NODE && nodes[1].textContent === ";" &&
						nodes[2].nodeType === Node.ELEMENT_NODE && nodes[2].tagName === argTagName.toUpperCase()
					) {
						const valueArg = args[+nodes[0].textContent]
						if (! validateValueArg(valueArg)) { throw `${PARSER_TOKEN_HTML_LOOP} value argument must be a parser symbol` }

						const iterableArg = args[+nodes[2].textContent]
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_HTML_LOOP} iterable argument must be iterable` }

						parameters.value = valueArg
						parameters.iterable = iterableArg
					} else if (nodes.length === 4 &&
						nodes[0].nodeType === Node.ELEMENT_NODE && nodes[0].tagName === argTagName.toUpperCase() &&
						nodes[1].nodeType === Node.TEXT_NODE && nodes[1].textContent === "," &&
						nodes[2].nodeType === Node.ELEMENT_NODE && nodes[2].tagName === argTagName.toUpperCase() &&
						nodes[3].nodeType === Node.TEXT_NODE && nodes[3].textContent.startsWith(";")
					) {
						const indexArg = args[+nodes[0].textContent]
						if (! validateIndexArg(indexArg)) { throw `${PARSER_TOKEN_HTML_LOOP} index argument must be a parser symbol` }

						const valueArg = args[+nodes[2].textContent]
						if (! validateValueArg(valueArg)) { throw `${PARSER_TOKEN_HTML_LOOP} value argument must be a parser symbol` }

						const iterableArg = JSON.parse(nodes[3].textContent.substring(1))
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_HTML_LOOP} iterable argument must be iterable` }

						parameters.index = indexArg
						parameters.value = valueArg
						parameters.iterable = iterableArg
					} else if (nodes.length === 5 &&
						nodes[0].nodeType === Node.ELEMENT_NODE && nodes[0].tagName === argTagName.toUpperCase() &&
						nodes[1].nodeType === Node.TEXT_NODE && nodes[1].textContent === "," &&
						nodes[2].nodeType === Node.ELEMENT_NODE && nodes[2].tagName === argTagName.toUpperCase() &&
						nodes[3].nodeType === Node.TEXT_NODE && nodes[3].textContent === ";" &&
						nodes[4].nodeType === Node.ELEMENT_NODE && nodes[4].tagName === argTagName.toUpperCase()
					) {
						const indexArg = args[+nodes[0].textContent]
						if (! validateIndexArg(indexArg)) { throw `${PARSER_TOKEN_HTML_LOOP} index argument must be a parser symbol` }

						const valueArg = args[+nodes[2].textContent]
						if (! validateValueArg(valueArg)) { throw `${PARSER_TOKEN_HTML_LOOP} value argument must be a parser symbol` }

						const iterableArg = args[+nodes[4].textContent]
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_HTML_LOOP} iterable argument must be iterable` }

						parameters.index = indexArg
						parameters.value = valueArg
						parameters.iterable = iterableArg
					} else {
						throw `${PARSER_TOKEN_HTML_LOOP} parameters are not valid`
					}

					// clone the current node in order to repeat it
					const template = element.cloneNode(true)
					// remove the loop attribute, we don't want infinite recursion
					template.removeAttribute(PARSER_TOKEN_HTML_LOOP)

					// callback for each key,value pair
					const loopCb = (index, value) => {
						// set the symbol to value map
						if (parameters.index) {
							symbolValues.set(parameters.index, index)
						}
						symbolValues.set(parameters.value, value)

						// clone the template
						const newElement = template.cloneNode(true)
						// insert it and visit like a normal node
						element.insertAdjacentElement('beforebegin', newElement)
						parserVisitor(newElement, args, symbolValues, argTagName)
					}

					// different way to iterate depending on the iterable
					if (parameters.iterable instanceof Map || parameters.iterable instanceof Set) {
						parameters.iterable.forEach((value, key) => loopCb(key, value))
					} else if (Array.isArray(parameters.iterable)) {
						for (const index in parameters.iterable) { loopCb(index, parameters.iterable[index]) }
					} else {
						const entries = Object.entries(parameters.iterable)
						for (const entry of entries) { loopCb(...entry) }
					}

					// remove original element
					element.remove()

				} else if (attrib.value.includes(argTagName)) {
					// any classic attribute
					parserVisitor(doc, args, symbolValues, argTagName)
					attrib.value = doc.innerHTML
				}
			})
		}

		// recursive call on each child
		;[...element.children].forEach(child => parserVisitor(child, args, symbolValues, argTagName))
	}
}

/**
 * @private
 */
function parser(stringParts, ...args) {
	const argTagName = "htmlbuilder-parserarg"
	const doc = document.createElement("div")

	// rebuild template string and replace args with <token>${argsIndex}</token>
	let index = 0
	let partialString = ""
	while (index < stringParts.length) { partialString += stringParts[index] + (args[index] ? `<${argTagName}>${index}</${argTagName}>` : ""); index++ }
	doc.innerHTML = partialString

	// visit doc recursively and look for things to replace and stuff
	const symbolValues = new Map(args.filter(arg => typeof arg === "symbol").map(symbol => ([symbol, null])))
	;[...doc.children].forEach(node => parserVisitor(node, args, symbolValues, argTagName))

	// put things in a fragment for a clean result when the result has multiple root tags
	const fragment = document.createDocumentFragment()
	fragment.append(...doc.children)
	return fragment
}

/**
 * @callback builder~parser
 * @description must be used as a template literal tag
 * @param {string[]} stringParts
 * @param {...*} args
 * @return {DocumentFragment}
 */
/**
 * @callback builder~parserCallback
 * @memberOf builder
 * @param {builder~parser} parser
 * @param {...Symbol} parserToken
 * @return {DocumentFragment}
 */
/**
 * parse some html code into a DocumentFragment
 * @memberOf builder
 * @param {builder~parserCallback} cb
 * @return {DocumentFragment}
 */
builder.parse = cb => cb(parser, ...Array(PARSER_TOKEN_COUNT).fill(null).map((_,i) => Symbol(`htmlBuilder.parse token ${i}`)))

export default builder