import h from "../src/html.js"

describe("domEditor", function () {
	let el
	beforeEach(function () {
		el = document.createElement("div")
	})

	describe("builder", function () {
		it("exists", function () {
			expect(h).to.exist
			expect(h).to.be.a("function")
		})
		it("accept a Node", function () {
			const wrap = h(el)

			expect(wrap.node).to.be.equal(el)
		})
		it("accept a string", function () {
			const wrap = h("div")

			expect(wrap.node).to.be.an.instanceof(Node)
			expect(wrap.node.outerHTML).to.be.equal("<div></div>")
		})

		describe(".comment", function () {
			const comment = h.comment("comment").node

			expect(comment.nodeType).to.be.equal(8)
			expect(comment.textContent).to.be.equal("comment")
			expect(() => comment.id()).to.throw(TypeError)
			expect(() => comment.innerHTML()).to.throw(TypeError)
		})

		describe(".text", function () {
			const text = h.text("text").node

			expect(text.nodeType).to.be.equal(3)
			expect(text.textContent).to.be.equal("text")
			expect(() => text.id()).to.throw(TypeError)
			expect(() => text.innerHTML()).to.throw(TypeError)
		})

		describe(".repeat", function () {
			const length = 5
			describe("1st param type", function () {
				it("accept string", function () {
					const array = h.repeat(length, "div")

					expect(array).to.be.lengthOf(length)
					array.forEach(node => {
						expect(node.node.outerHTML).to.be.equal("<div></div>")
					})
					const allDifferent = array.every((node, i, arr) => arr.every((node2, j) => i === j || node !== node2))
					expect(allDifferent).to.be.true
				})
				it("accept node", function () {
					const array = h.repeat(length, el)

					expect(array).to.be.lengthOf(length)
					array.forEach(node => {
						expect(node.node.outerHTML).to.be.equal(el.outerHTML)
					})
					const allDifferent = array.every(node => node.node !== el)
					expect(allDifferent).to.be.true
				})
				it("accept DOMBuilderElement", function () {
					const array = h.repeat(length, h(el))

					expect(array).to.be.lengthOf(length)
					array.forEach(node => {
						expect(node.node.outerHTML).to.be.equal(el.outerHTML)
					})
					const allDifferent = array.every(node => node.node !== el)
					expect(allDifferent).to.be.true
				})
			})

			describe("callback works", function () {
				it("callback works", function () {
					const array = h.repeat(length, "div", undefined, (div, i) => {div.id(`id${i}`)})
					expect(array).to.be.lengthOf(length)
					array.forEach((node, i) => {
						expect(node.node.outerHTML).to.be.equal(`<div id="id${i}"></div>`)
					})
				})
			})
		})

		describe("namespace works", function () {
			const expected = document.createElementNS("http://www.w3.org/2000/svg", "svg")

			it("with namespace", function () {
				const actual = h("svg", {namespace: h.namespace.svg}).node
				expect(actual.namespaceURI).to.be.equal(expected.namespaceURI)
				expect(actual.outerHTML).to.be.equal(expected.outerHTML)
				expect(actual.transform).to.be.instanceof(SVGAnimatedTransformList)
			})
			it("with ns alias", function () {
				const actual = h("svg", {namespace: h.ns.svg}).node
				expect(actual.namespaceURI).to.be.equal(expected.namespaceURI)
				expect(actual.outerHTML).to.be.equal(expected.outerHTML)
				expect(actual.transform).to.be.instanceof(SVGAnimatedTransformList)
			})
		})

		describe("elementCreationOptions works", function () {
			const expected = document.createElement('ul', { is : 'expanding-list' })

			it("with elementCreationOptions", function () {
				const actual = h("ul", {elementCreationOptions: {is: "expanding-list"}}).node
				expect(actual.outerHTML).to.be.equal(expected.outerHTML)
				expect(actual.tagName).to.be.equal(expected.tagName)
			})
			it("with options alias", function () {
				const actual = h("ul", {options: {is: "expanding-list"}}).node
				expect(actual.outerHTML).to.be.equal(expected.outerHTML)
				expect(actual.tagName).to.be.equal(expected.tagName)
			})
			it("with opt alias", function () {
				const actual = h("ul", {opt: {is: "expanding-list"}}).node
				expect(actual.outerHTML).to.be.equal(expected.outerHTML)
				expect(actual.tagName).to.be.equal(expected.tagName)
			})
		})
	})
	describe("DOMBuilderElement", function () {
		it("has node property", function () {
			const wrap = h(el)

			expect(wrap.node).to.not.be.undefined
			expect(wrap.node).to.be.equal(el)
		})
		describe("class", function () {
			it("no argument returns element.classList", function () {
				expect(h(el).class()).to.be.equals(el.classList)
			})
			describe("accept", function () {
				it("string", function () {
					h(el).class("test")

					expect(Array.from(el.classList)).to.contains("test")
				})
				it("object", function () {
					h(el).class({test: true, test2: false})

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
				})
				describe("array of", function () {
					it("string", function () {
						h(el).class(["test", "test2"])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.contains("test2")
					})
					it("object", function () {
						h(el).class([{test: true, test2: true}, {test2: false}])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
					})
					it("object and string", function () {
						h(el).class([{test: true, test2: true}, "test3", {test2: false}])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
					it("arrays", function () {
						h(el).class([[{test: true, test2: true}], ["test3", {test2: false}]])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
					it("mixed", function () {
						h(el).class([[{test: true, test2: true}], "test3", {test2: false}])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
				})
				describe("multiple arguments", function () {
					it("string", function () {
						h(el).class("test", "test2")

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.contains("test2")
					})
					it("object", function () {
						h(el).class({test: true, test2: true}, {test2: false})

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
					})
					it("object and string", function () {
						h(el).class({test: true, test2: true}, "test3", {test2: false})

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
					it("arrays", function () {
						h(el).class([{test: true, test2: true}], ["test3", {test2: false}])

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
					it("mixed", function () {
						h(el).class([{test: true, test2: true}], "test3", {test2: false})

						expect(Array.from(el.classList)).to.contains("test")
						expect(Array.from(el.classList)).to.not.contains("test2")
						expect(Array.from(el.classList)).to.contains("test3")
					})
				})
			})
		})

		describe("append", function () {
			describe("accept", function () {
				it("DOMBuilderElement", function () {
					h(el).append(h("span"))

					expect(el.outerHTML).to.be.equal("<div><span></span></div>")
				})
				it("Node", function () {
					h(el).append(document.createElement("span"))

					expect(el.outerHTML).to.be.equal("<div><span></span></div>")
				})
				it("string", function () {
					h(el).append("text")

					expect(el.outerHTML).to.be.equal("<div>text</div>")
				})
				it("anything with a toString", function () {
					h(el).append({})

					expect(el.outerHTML).to.be.equal("<div>[object Object]</div>")
				})
				it("array", function () {
					h(el).append([ h("span"), "text", document.createElement("span"), {}, 42 ])

					expect(el.outerHTML).to.be.equal("<div><span></span>text<span></span>[object Object]42</div>")
				})
				it("multiple arguments", function () {
					h(el).append( h("span"), "text", document.createElement("span"), {}, 42 )

					expect(el.outerHTML).to.be.equal("<div><span></span>text<span></span>[object Object]42</div>")
				})
			})
		})

		describe("id", function () {
			it("set", function () {
				h(el).id("test")

				expect(el.id).to.be.equal("test")
			})
			it("get", function () {
				el.id = "test"

				expect(h(el).id()).to.be.equal("test")
			})
		})

		describe("text", function () {
			it("set", function () {
				h(el).text("<div></div>test")

				expect(el.childElementCount).to.be.equal(0)
				expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
			})
			it("get", function () {
				el.innerText = "<div></div>test"

				expect(h(el).text()).to.be.equal("<div></div>test")
				expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
			})
		})

		describe("html", function () {
			it("set", function () {
				h(el).html("<div></div>test")

				expect(el.childElementCount).to.be.equal(1)
				expect(el.outerHTML).to.be.equal("<div><div></div>test</div>")
			})
			it("get", function () {
				el.innerHTML = "<div></div>test"

				expect(h(el).html()).to.be.equal("<div></div>test")
			})
		})

		describe("attr", function () {
			it("name alone returns attribute value", function () {
				h(el).attr("title", "value")

				expect(h(el).attr("title")).to.be.equals("value")
				expect(h(el).attr("title")).to.be.equals(el.getAttribute("title"))
			})
			describe("accept", function () {
				it("key value pair", function () {
					h(el).attr("title", "text")

					expect(el.getAttribute("title")).to.be.equal("text")
				})
				it("object", function () {
					h(el).attr({title: "text", color: "red"})

					expect(el.getAttribute("title")).to.be.equal("text")
					expect(el.getAttribute("color")).to.be.equal("red")
				})
				it("array of object", function () {
					h(el).attr([{title: "text"}, {color: "red"}])

					expect(el.getAttribute("title")).to.be.equal("text")
					expect(el.getAttribute("color")).to.be.equal("red")
				})
				it("multiple arguments objects", function () {
					h(el).attr({title: "text"}, {color: "red"})

					expect(el.getAttribute("title")).to.be.equal("text")
					expect(el.getAttribute("color")).to.be.equal("red")
				})
				it("array of array and object", function () {
					h(el).attr([{title: "text"}], {color: "red"})

					expect(el.getAttribute("title")).to.be.equal("text")
					expect(el.getAttribute("color")).to.be.equal("red")
				})
				it("multiple objects override", function () {
					h(el).attr([{title: "text"}, {color: "red"}, {color: "blue"}])

					expect(el.getAttribute("title")).to.be.equal("text")
					expect(el.getAttribute("color")).to.be.equal("blue")
				})
			})
			it("undefined and null value removes the attribute", function () {
				h(el).attr({title: "text", color: "red"}, {title: undefined, color: null})

				expect(el.getAttribute("title")).to.be.null
				expect(el.getAttribute("color")).to.be.null
			})
		})
	})

	it("ns should be frozen", function () {
		expect(h.ns).to.be.frozen
	})

	describe("big tests", function () {
		it(`<div class="...">...<span class="... ...">...</span>...<a href="..."><b>...</b></a>...<img title="..." src="..."></div>`, function () {
			h(el)
				.class("test")
				.append(
					"un peu de texte ",
					h("span")
						.class(["span", "autre"])
						.text("un span"),
					" et un truc a attribut ",
					h("a")
						.attr("href", "link")
						.html("<b>link</b>"),
					" mais il faut aussi que plusieurs attributs ce sois simple ",
					h("img")
						.attr({title: "LOL", src: "img.jpg"})
				)

			expect(el.outerHTML.trim()).to.be
				.equal(`<div class="test">un peu de texte <span class="span autre">un span</span> et un truc a attribut <a href="link"><b>link</b></a> mais il faut aussi que plusieurs attributs ce sois simple <img title="LOL" src="img.jpg"></div>`.trim())
		})

	})
})


/* TODO
	constructor namespace
	elementCreationOption
	commentaires
 */
