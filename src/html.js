const FLAT_DEPTH = 2


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
	 * if node can't have classes (ex: TextNode), returns undefined
	 * @returns {?DOMTokenList}
	 *//**
	 * set node classes (if node can have class)
	 * 	- class(string) : add the named class to the node
	 * 	- class(string[]) : add each class of the array to the node
	 * 	- class({[k: string]: boolean}) : toggle each class named by the keys to the state given by the boolean value
	 *
	 * array parameters can be nested and can contain object following the object parameter format
	 *
	 * if node can't have classes (ex: TextNode), does nothing and returns this
	 * @param {string | string[] | Object<string, boolean>} args
	 * @returns {this}
	 */
	class(...args) {
		if (args.length === 0) {
			if (! ("classList" in this._node)) {return undefined}
			return this._node.classList
		}

		if (! ("classList" in this._node)) {return this}
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
	 * if node can't have an id, returns ""
	 * @returns {string} the current id
	 *//**
	 * set the id of the node
	 *
	 * if node can't have an id, do nothing and returns this
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} value
	 * @returns {this}
	 */
	id(value) {
		if (! ("id" in this._node)) {
			return value !== undefined ? this : ""
		}
		if(value !== undefined) {
			if (typeof value.toString !== "function") {
				throw new TypeError("value must have a toString() method")
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
				throw new TypeError("value must have a toString() method")
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
	 * if the node doesn't have a innerHTML, calls text(value)
	 *
	 * @throws {TypeError} when value doesn't have a toString() function
	 * @param {string | Object} value
	 * @returns {this}
	 */
	html(value) {
		if (value !== undefined && typeof value.toString !== "function") {
			throw new TypeError("value must have a toString() method")
		}
		if (! ("innerHTML" in this._node)) {
			return this.text(value)
		}
		if(value !== undefined) {
			this._node.innerHTML = value.toString()
			return this
		}
		return this._node.innerHTML
	}

	/**
	 * get node attribute by name
	 *
	 * if node can't have attributes (ex: TextNode), returns null
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
	 * if node can't have attributes (ex: TextNode), does nothing and returns this
	 * @param { Array<Object.<string, string | null | undefined>> | Object.<string, string | null | undefined> | string } args
	 * @returns {this}
	 */
	attr(...args) {
		if (args.length === 1 && (typeof args[0] === "string" || args[0] instanceof String)) {
			if ("getAttribute" in this._node) {
				return this._node.getAttribute(args[0])
			} else {
				return null
			}
		}

		if (! ("setAttribute" in this._node)) {return this}
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
	 * @return {Node | null} null if node doesn't have querySelector method
	 *//**
	 * easy access to node.querySelector
	 * @param {string} query
	 * @param {false} [nakedNode = false]
	 * @return {DOMBuilderElement | null} null if node doesn't have querySelector method
	 */
	querySelector(query, nakedNode = false) {
		if ("querySelector" in this._node) {
			const node = this._node.querySelector(query)
			return nakedNode ? node : new DOMBuilderElement(node)
		}
		return null
	}

	/**
	 * easy access to node.querySelectorAll
	 * @param {string} query
	 * @param {true} nakedNodes
	 * @return {Node[]} empty array if node doesn't have querySelectorAll method
	 *//**
	 * easy access to node.querySelectorAll
	 * @param {string} query
	 * @param {false} [nakedNodes = false]
	 * @return {DOMBuilderElement[]} empty array if node doesn't have querySelectorAll method
	 */
	querySelectorAll(query, nakedNodes = false) {
		if ("querySelectorAll" in this._node) {
			const nodes = this._node.querySelectorAll(query)
			return nakedNodes ? [...nodes] : [...nodes].map(node => new DOMBuilderElement(node))
		}
		return []
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
		while (this._node.childNodes.length) { this._node.firstChild.remove() }
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
 * @property {string} [namespace]
 * @property {string} [ns]
 * @property {ElementCreationOptions} [elementCreationOptions]
 * @property {ElementCreationOptions} [options]
 */

/**
 * wrap a DOM element with a fluent interface
 *
 * @memberOf builder
 * @param {string | DOMBuilderElement | Node} tag if string, the tag name of a newly created element, else the element to wrap
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
builder.namespace = {
	...builder.namespace,
	...{
		default: builder.namespace.html,
		HTML: builder.namespace.html,
		SVG: builder.namespace.svg,
		MATH_ML: builder.namespace.mathML
	}
}
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
 * @param {builder~buildCallback} buildCallback function to call to create elements, continue as long as it doesn't return undefined
 * @return {DOMBuilderElement[]}
 *//**
 * create an array of size count and call repeatCallback for each of it's elements
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
		const finalArray = []
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
			const newArray = array.map(repeatCallback)
			if (! newArray.every(e => e === undefined)) {
				array = newArray
			}
		} else {
			array = array.map(repeatCallback)
		}
	}
	return array
}

/***********************************************************************************
 *
 *
 *                                START OF PARSER
 *
 *
 **********************************************************************************/


/**
 * number of temporary symbols sent by parse
 * @private
 * @type {number}
 */
const PARSER_TEMPORARY_SYMBOL_COUNT = 10
/**
 * map keeping the values of symbols between parses
 * temporary parse symbols are forgotten after each parse
 * @private
 * @type {Map<Symbol, any>}
 */
const PARSER_SYMBOL_VALUE_MAP = new Map()
const PARSER_TOKEN_LOOP = "loop"
const PARSER_TOKEN_PARSER_ARG = "parser-arg"
const PARSER_TOKEN_SET = "set"
const PARSER_TOKEN_USE = "use"

/**
 * recursively visit the given element to find special nodes and attribute to replace using args values
 * @param {HTMLElement} element the element parsed from the string given to the parser
 * @param {any[]} args the values sent to the parser using the ${} syntax
 * @param {HTMLElement} [attributeParentElement] used when recurring inside an attribute to give a link to the parent element
 * @private
 */
function parserVisitor(element, args, attributeParentElement) {
	// return immediately if element is not an HTMLElement (not supposed to happen)
	if (element.children) {
		// if the element is an argument tag
		if (element.tagName === parser.argTagName.toUpperCase()) {
			// get the argument value from the args array
			// and find the right way to use it
			const input = args[+element.textContent]
			// symbols are used as internal variable by the parser
			if (typeof input === "symbol") {
				element.innerHTML = "0"
				parserVisitor(element, [PARSER_SYMBOL_VALUE_MAP.get(input)])
			// binders bind to the attribute container or create a new text tag depending on the situation
			} else if (typeof input === "object" && input !== null && input[binder.isBinder]) {
				if (attributeParentElement) {
					input.addNode("value", attributeParentElement)
				} else {
					const text = document.createTextNode("")
					input.addNode("value", text)
					element.replaceWith(text)
				}
			// if the argument is a function, call it and apply its result
			} else if (typeof input === "function" && input.length === 0) {
				element.innerHTML = "0"
				parserVisitor(element, [input()])
			// Nodes and DOMBuilderElements are inserted as is inside the DOM tree
			} else if (input instanceof Node) {
				element.replaceWith(input)
			} else if (input instanceof DOMBuilderElement) {
				element.replaceWith(input.node)
			// other values are replaced by their string representation
			} else if (typeof input === "object") {
				element.outerHTML = JSON.stringify(input)
			} else {
				element.outerHTML = input.toString()
			}
			return
		}
		// the element is a parser set
		// sets the symbol value
		// <hp-set>${symbol} = "value"</hp-set>
		// <hp-set>${symbol} = ${"value"}</hp-set>
		// <hp-set>${symbol} = ${otherSymbol}</hp-set>
		// TODO create parser script and remove this
		else if (element.tagName === parser.setTagName.toUpperCase()) {
			if (element.childNodes.length < 2 ||
				element.childNodes[0].nodeType !== Node.ELEMENT_NODE ||
				element.childNodes[0].tagName !== parser.argTagName.toUpperCase() ||
				typeof args[+element.childNodes[0].textContent] !== "symbol" ||
				! PARSER_SYMBOL_VALUE_MAP.has(args[+element.childNodes[0].textContent]) ||
				element.childNodes[1].nodeType !== Node.TEXT_NODE ||
				! element.childNodes[1].textContent.replaceAll(" ", "").startsWith("=") ||
				element.childNodes[1].textContent.replaceAll(" ", "").startsWith("==")
			) {
				throw `${PARSER_TOKEN_SET} content must be in the form : \${symbol} = <expression>`
			}

			// TODO parse by hand to avoid eval like Function constructor
			const functionParameters = []
			const functionArguments = []
			let functionBody = "return "

			;[...element.childNodes].forEach((node, i) => {
				if (i === 0) {return}
				if (i === 1) {
					const text = node.textContent
					functionBody += text.substring(text.indexOf("=") + 1)
					return
				}
				if (node.nodeType === Node.ELEMENT_NODE && node.tagName === parser.argTagName.toUpperCase()) {
					const input = args[+node.textContent]
					functionBody += `htmlParserArgument${node.textContent}`
					functionParameters.push(`htmlParserArgument${node.textContent}`)
					if (typeof input === "symbol") {
						functionArguments.push(PARSER_SYMBOL_VALUE_MAP.get(input))
					} else {
						functionArguments.push(input)
					}
					return
				}
				functionBody += node.textContent
			})
			const func = new Function(...functionParameters, functionBody)
			PARSER_SYMBOL_VALUE_MAP.set(args[+element.childNodes[0].textContent], func(...functionArguments))

			element.remove()
			return
		}
		// the element is a parser use
		// <hp-use>${symbol}.property</hp-use>
		// TODO create parser script and remove this
		else if (element.tagName === parser.useTagName.toUpperCase()) {
			// TODO parse by hand to avoid eval like Function constructor
			const functionParameters = []
			const functionArguments = []
			let functionBody = "return "

			;[...element.childNodes].forEach(node => {
				if (node.nodeType === Node.ELEMENT_NODE && node.tagName === parser.argTagName.toUpperCase()) {
					const input = args[+node.textContent]
					functionBody += `htmlParserArgument${node.textContent}`
					functionParameters.push(`htmlParserArgument${node.textContent}`)
					if (typeof input === "symbol") {
						functionArguments.push(PARSER_SYMBOL_VALUE_MAP.get(input))
					} else {
						functionArguments.push(input)
					}
					return
				}
				functionBody += node.textContent
			})

			const func = new Function(...functionParameters, functionBody)
			const newElement = document.createElement(parser.argTagName)
			newElement.textContent = "0"
			element.insertAdjacentElement("beforebegin", newElement)
			element.remove()
			parserVisitor(newElement, [func(...functionArguments)])
			return
		}

		// if the element has attributes, find argument tag in there
		if (element.attributes.length) {
			const attributes = [...element.attributes]
			// element who'll be used to parse the attribute value like some html
			// allows us to navigate it using DOM api
			const doc = document.createElement("div")

			for (const attrib of attributes) {
				// actual moment when the attribute value is parsed
				doc.innerHTML = attrib.value

				// start with special attributes

				/* data-hp-loop
				 * duplicate the element for each iterable entry setting the symbols to the corresponding entry key and value
				 * data-hp-loop="iterable;value,index"
				 * - iterable can be an array, an object, a map, a set or a JSON string parseable to an array or an object
				 * 	in the case of the JSON string, it can be written inline directly
				 * - value must be a symbol
				 * - index is optional, when present must be a symbol
				 */
				if (attrib.name === parser.ATTRIBUTE_PREFIX + PARSER_TOKEN_LOOP) {
					const validateIndexArg = arg => typeof arg === "symbol" && PARSER_SYMBOL_VALUE_MAP.has(arg)
					const validateValueArg = arg => typeof arg === "symbol" && PARSER_SYMBOL_VALUE_MAP.has(arg)
					const validateIterableArg = arg => Array.isArray(arg) || arg instanceof Map || arg instanceof Set || typeof arg === "object"

					const nodes = doc.childNodes
					const parameters = {
						index: null,
						value: null,
						iterable: []
					}

					let i = 0
					// if starts with `${value};` check that the value is a valid iterable
					if (nodes[i] && nodes[i+1] &&
						nodes[i].nodeType === Node.ELEMENT_NODE && nodes[i].tagName === parser.argTagName.toUpperCase() &&
						nodes[i+1].nodeType === Node.TEXT_NODE && nodes[i+1].textContent === ";"
					) {
						const iterableArg = args[+nodes[i].textContent]
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_LOOP} iterable argument is not valid` }
						parameters.iterable = iterableArg
						i += 2
					// if starts with `["some", "string"]` parse it as json and check that it's a valid iterable
					} else if (nodes[i] &&
						nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent.length > 1 && nodes[i].textContent.endsWith(";")
					) {
						const iterableArg = JSON.parse(nodes[i].textContent.substring(0, nodes[i].textContent.length - 1))
						if (! validateIterableArg(iterableArg)) { throw `${PARSER_TOKEN_LOOP} iterable argument is not valid` }
						parameters.iterable = iterableArg
						i++
					} else {
						throw `${PARSER_TOKEN_LOOP} parameters are not valid`
					}

					// ensure that the next part is a `${symbol}` and use it for the value symbol
					if (nodes[i] && nodes[i].nodeType === Node.ELEMENT_NODE && nodes[i].tagName === parser.argTagName.toUpperCase()) {
						const valueArg = args[+nodes[i].textContent]
						if (! validateValueArg(valueArg)) { throw `${PARSER_TOKEN_LOOP} value argument must be a symbol` }
						parameters.value = valueArg
						i++
					} else {
						throw `${PARSER_TOKEN_LOOP} parameters are not valid`
					}

					// if the end is `,${symbol}`, ensure that it can be used as the index symbol
					if (nodes[i] && nodes[i+1] &&
						nodes[i].nodeType === Node.TEXT_NODE && nodes[i].textContent === "," &&
						nodes[i+1].nodeType === Node.ELEMENT_NODE && nodes[i+1].tagName === parser.argTagName.toUpperCase()
					) {
						const indexArg = args[+nodes[i+1].textContent]
						if (! validateIndexArg(indexArg)) { throw `${PARSER_TOKEN_LOOP} index argument must be a symbol` }
						parameters.index = indexArg
						i += 2
					} else if (nodes[i] && (nodes[i].textContent !== "," || ! nodes[i+1])) {
						throw `${PARSER_TOKEN_LOOP} parameters are not valid`
					}

					// clone the current node in order to repeat it
					const template = element.cloneNode(true)
					// remove the loop attribute, we don't want infinite recursion
					template.removeAttribute(parser.ATTRIBUTE_PREFIX + PARSER_TOKEN_LOOP)

					// callback for each key,value pair
					const loopCb = (index, value) => {
						// set the symbol to value map
						if (parameters.index) {
							PARSER_SYMBOL_VALUE_MAP.set(parameters.index, index)
						}
						PARSER_SYMBOL_VALUE_MAP.set(parameters.value, value)

						// clone the template
						const newElement = template.cloneNode(true)
						// insert it and visit like a normal node
						element.insertAdjacentElement("beforebegin", newElement)
						parserVisitor(newElement, args)
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

					// remove the original element
					element.remove()
					return

				// any attribute without special recognition
				} else if (attrib.value.includes(parser.argTagName)) {
					// recursive call on the attribute value
					parserVisitor(doc, args, element)
					attrib.value = doc.innerHTML
				}
			}
		}

		// recursive call on each child
		[...element.children].forEach(child => parserVisitor(child, args, attributeParentElement))
	}
}

/**
 * internal callback for the parser function
 * @private
 * @param {string[]} stringParts
 * @param {any} args
 * @returns DocumentFragment
 */
function parserInternalCallback(stringParts, ...args) {
	const doc = document.createElement("div")

	// rebuild template string and replace args with <parser.argTagName>${argsIndex}</parser.argTagName>
	let index = 0
	let partialString = ""
	while (index < stringParts.length) { partialString += stringParts[index] + (args[index] !== undefined ? `<${parser.argTagName}>${index}</${parser.argTagName}>` : ""); index++ }
	doc.innerHTML = partialString

	// create a map of the symbols used in the code to parse
	args.filter(arg => typeof arg === "symbol")
		.forEach(symbol => {
			if (! PARSER_SYMBOL_VALUE_MAP.has(symbol)) {
				PARSER_SYMBOL_VALUE_MAP.set(symbol, null)
			}
		})
	// visit doc recursively and look for things to replace
	;[...doc.children].forEach(node => parserVisitor(node, args))

	// put things in a fragment for a clean result when the result has multiple root tags
	const fragment = document.createDocumentFragment()
	fragment.append(...doc.childNodes)
	return fragment
}

/**
 * @callback parser~parser
 * @description must be used as a template literal tag
 * @param {string[]} stringParts
 * @param {...*} args
 * @return {DocumentFragment}
 */
/**
 * @callback parser~parserCallback
 * @param {parser~parser} parser
 * @param {...Symbol} parserToken
 * @return {DocumentFragment}
 */
/**
 * parse some html code into a DocumentFragment
 * @param {parser~parserCallback} cb
 * @return {DocumentFragment}
 * TODO add possibility to send an html file path
 */
const parser = cb => {
	const tmpSymbols = Array(PARSER_TEMPORARY_SYMBOL_COUNT).fill(null).map((_,i) => Symbol(`htmlBuilder.parse symbol ${i}`))
	const ret = cb(parserInternalCallback, ...tmpSymbols)
	tmpSymbols.forEach(symbol => { PARSER_SYMBOL_VALUE_MAP.delete(symbol) })
	return ret
}
/**
 * can be used to preset a symbol value before calling the parser
 * @param {Symbol} symbol
 * @param {any} value
 */
parser.setSymbolValue = (symbol, value) => {
	PARSER_SYMBOL_VALUE_MAP.set(symbol, value)
}
/**
 * the prefix used in parser specific attributes
 * can be edited to change the attributes recognized by the parser
 * the "data-" part is required to conform to the standard but can be edited away if you don't mind
 * @type {string}
 */
parser.ATTRIBUTE_PREFIX = "data-hp-"
/**
 * the prefix used in parser specific tags
 * can be edited to change the tags recognized by the parser
 * @type {string}
 */
parser.TAG_PREFIX = "hp-"
/**
 * the arg tag name taking into account the user own tag prefix, used to surround the variables in the parsed string
 * is reserved for an internal usage
 * @private
 * @type {string}
 */
Object.defineProperty(parser, "argTagName", { configurable: false, get: () => parser.TAG_PREFIX + PARSER_TOKEN_PARSER_ARG })
/**
 * can be used by the user to change the value of a symbol during the parsing
 * @private
 * @type {string}
 */
Object.defineProperty(parser, "setTagName", { configurable: false, get: () => parser.TAG_PREFIX + PARSER_TOKEN_SET })
/**
 * can be used by the user to output the value of a symbol during the parsing
 * @private
 * @type {string}
 */
Object.defineProperty(parser, "useTagName", { configurable: false, get: () => parser.TAG_PREFIX + PARSER_TOKEN_USE })


/***********************************************************************************
 *
 *
 *                                START OF BINDER
 *
 *
 **********************************************************************************/

/**
 * @description internal structure used to store binder recognized nodes and current value
 * @typedef {Map<string, {value: any, nodes: Set<Node>}>} binder~bindings
 * @private
 */
/**
 * @callback binder~addNode
 * @param {string} propertyName
 * @param {DOMBuilderElement | Node} element
 */
/**
 * @callback binder~onchange
 * @param {string} propertyName
 * @param {any} newValue
 */
/**
 * @typedef {Object} binder~return
 * @property {binder~addNode} addNode
 * @property {binder~onchange} [onchange]
 */
/**
 * get a binder object, it is used to make bindings between itself and html elements
 * any element with a value property (input, textarea, ...) gets two way bindings
 * other elements gets a one way binding, getting its text updated when the variable change
 *
 * the onchange method can be added by the final user to get notified when any property value is changed
 * @return {binder~return}
 */
function binder() {
	const object = Object.create(null)
	/**
	 * @type {binder~bindings}
	 */
	const bindings = new Map()
	const proxy = new Proxy(object, {
		get(target, prop) {
			if (bindings.has(prop)) { return bindings.get(prop).value }
			if (prop === "addNode") { return binder.addNode.bind(null, bindings, this) }
			if (prop === "onchange") { return this.onchange }
			if (prop === binder.isBinder) { return true }
			// TODO find how to store and remove event listener in order to uncomment next line
			// if (prop === "removeNode") { return binder2.removeElement.bind(null, bindings, prop) }
			return null
		},
		set(target, prop, value) {
			if (bindings.has(prop)) {
				const bind = bindings.get(prop)
				bind.value = value
				this.onchange?.(prop, value)
				bind.nodes.forEach(el => binder.setElementValue(el, value))
				return true
			}
			if (prop === "onchange") {
				if (typeof value === "function") {
					this.onchange = value
					return true
				} else {
					throw new TypeError("binder.onchange must be a function")
				}
			}
			return false
		}
	})
	Object.preventExtensions(proxy)
	return proxy
}

binder.isBinder = Symbol("binder.isBinder")

/**
 * add an event listener to an element
 * this listener updates the binder property when the element fire the input event
 * @protected
 * @param {HTMLElement} element the added element
 * @param {Object} proxyHandler the proxy handler
 * @param {string} propName the property name
 */
binder.elementAddEventListener = (element, proxyHandler, propName) => {
	if (element instanceof HTMLInputElement) {
		if (element.type === "checkbox") {
			element.addEventListener("change", () => {
				proxyHandler.set(proxyHandler, propName, element.checked)
			})
		} else {
			element.addEventListener("input", () => {
				proxyHandler.set(proxyHandler, propName, element.value)
			})
		}
	}
}

/**
 * create the connection between a binder and an element
 * @private
 * @param {binder~bindings} bindings
 * @param {object} proxyHandler
 * @param {string} propName
 * @param {DOMBuilderElement | Node} element
 */
binder.addNode = (bindings, proxyHandler, propName, element) => {
	if (propName === "addNode") { throw new SyntaxError(`Can't bind to the name addNode, the name is already in use by the binder internals`) }
	if (propName === "removeNode") { throw new SyntaxError(`Can't bind to the name removeNode, the name is reserved for future use by the binder internals`) }
	if (propName === "onchange") { throw new SyntaxError(`Can't bind to the name onchange, the name is already in use by the binder internals`) }
	if (element instanceof DOMBuilderElement) {
		element = element.node
	}
	if (! bindings.has(propName)) {
		bindings.set(propName, {value: undefined, nodes: new Set()})
	}
	bindings.get(propName).nodes.add(element)
	binder.elementAddEventListener(element, proxyHandler, propName)
	return element
}

/**
 * change the value of a html element
 * @private
 * @param {HTMLElement} element
 * @param {any} value
 */
binder.setElementValue = (element, value) => {
	if (element instanceof HTMLInputElement) {
		if (element.type === "checkbox") {
			element.checked = value
		} else {
			element.value = value
		}
	} else {
		element.textContent = value
	}
}

export {builder, parser, binder}