import {builder as h} from "../src/html.js"
import jsdomGlobal from "jsdom-global"
jsdomGlobal("", { url: "http://localhost" })
import {expect} from "chai"

/*
 * DOMBuilderElement methods specific tests
 */

describe("DOMBuilderElement", () => {
	let el
	let hel
	beforeEach(() => {
		hel = h("div").append(h("span"), h("p").append("ul").appendRepeat(5, "li"))
		el = hel.clone.node
	})

	describe("class", () => {
		it("no argument returns element.classList", () => {
			expect(h(el).class()).to.be.equals(el.classList)
		})
		describe("accept", () => {
			it("string", () => {
				h(el).class("test")

				expect(Array.from(el.classList)).to.contains("test")
			})
			it("object", () => {
				h(el).class({test: true, test2: false})

				expect(Array.from(el.classList)).to.contains("test")
				expect(Array.from(el.classList)).to.not.contains("test2")
			})
			describe("array of", () => {
				it("string", () => {
					h(el).class(["test", "test2"])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.contains("test2")
				})
				it("object", () => {
					h(el).class([{test: true, test2: true}, {test2: false}])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
				})
				it("object and string", () => {
					h(el).class([{test: true, test2: true}, "test3", {test2: false}])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
				it("arrays", () => {
					h(el).class([[{test: true, test2: true}], ["test3", {test2: false}]])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
				it("mixed", () => {
					h(el).class([[{test: true, test2: true}], "test3", {test2: false}])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
			})
			describe("multiple arguments", () => {
				it("string", () => {
					h(el).class("test", "test2")

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.contains("test2")
				})
				it("object", () => {
					h(el).class({test: true, test2: true}, {test2: false})

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
				})
				it("object and string", () => {
					h(el).class({test: true, test2: true}, "test3", {test2: false})

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
				it("arrays", () => {
					h(el).class([{test: true, test2: true}], ["test3", {test2: false}])

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
				it("mixed", () => {
					h(el).class([{test: true, test2: true}], "test3", {test2: false})

					expect(Array.from(el.classList)).to.contains("test")
					expect(Array.from(el.classList)).to.not.contains("test2")
					expect(Array.from(el.classList)).to.contains("test3")
				})
			})
		})
		describe("special handling of Node without classList", function() {
			const node = h.text()
			expect(node.node.classList).to.be.undefined
			it ("get returns undefined", () => {
				expect(node.class()).to.be.undefined
			})
			it ("set return this", () => {
				expect(node.class("test")).to.equal(node)
			})
		})
	})

	describe("append", () => {
		beforeEach(() => {
			el = document.createElement("div")
		})

		describe("accept", () => {
			it("DOMBuilderElement", () => {
				h(el).append(h("span"))

				expect(el.outerHTML).to.be.equal("<div><span></span></div>")
			})
			it("Node", () => {
				h(el).append(document.createElement("span"))

				expect(el.outerHTML).to.be.equal("<div><span></span></div>")
			})
			it("string", () => {
				h(el).append("text")

				expect(el.outerHTML).to.be.equal("<div>text</div>")
			})
			it("anything with a toString", () => {
				h(el).append({})

				expect(el.outerHTML).to.be.equal("<div>[object Object]</div>")
			})
			it("array", () => {
				h(el).append([ h("span"), "text", document.createElement("span"), {}, 42 ])

				expect(el.outerHTML).to.be.equal("<div><span></span>text<span></span>[object Object]42</div>")
			})
			it("multiple arguments", () => {
				h(el).append( h("span"), "text", document.createElement("span"), {}, 42 )

				expect(el.outerHTML).to.be.equal("<div><span></span>text<span></span>[object Object]42</div>")
			})
		})
	})

	describe("appendRepeat", () => {
		it("equals append(html.repeat(...))", () => {
			const expected = h("div").append(h.repeat(8, "div", (el, i) => el.text(`div n°${i}`))).html()
			const result = h("div").appendRepeat(8, "div", (el, i) => el.text(`div n°${i}`)).html()
			expect(result).to.be.equal(expected)
		})
	})

	describe("id", () => {
		it("set", () => {
			h(el).id("test")

			expect(el.id).to.be.equal("test")
		})
		it("get", () => {
			el.id = "test"

			expect(h(el).id()).to.be.equal("test")
		})
		it("set throw if value doesn't have a toString", () => {
			expect(() => h(el).id(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
		})
		it("gracefully downgrade if node can't have an id", () => {
			const node = h.text()
			expect(node.id("test")).to.equal(node)
			expect(node.id()).to.equal("")
		})
	})

	describe("text", () => {
		it("set", () => {
			h(el).text("<div></div>test")

			expect(el.childElementCount).to.be.equal(0)
			expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
		})
		it("get", () => {
			// el.innerText works in browser but not with jsdom
			el.textContent = "<div></div>test"

			expect(h(el).text()).to.be.equal("<div></div>test")
			expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
		})
		it("set throw if value doesn't have a toString", () => {
			expect(() => h(el).text(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
		})
	})

	describe("html", () => {
		it("set", () => {
			h(el).html("<div></div>test")

			expect(el.childElementCount).to.be.equal(1)
			expect(el.outerHTML).to.be.equal("<div><div></div>test</div>")
		})
		it("get", () => {
			el.innerHTML = "<div></div>test"

			expect(h(el).html()).to.be.equal("<div></div>test")
		})
		it("set throw if value doesn't have a toString", () => {
			expect(() => h(el).html(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
		})
		it("calls text() if node doesn't have an innerHTML", function() {
			const el = h.text("a")
			const ret = el.text("test")

			expect("innerHTML" in el.node).to.be.false
			expect(ret).to.be.equal(el)

			expect(el.html()).to.be.equal(el.text())
			expect(el.html()).to.be.equal("test")
		})
	})

	describe("attr", () => {
		it("name alone returns attribute value", () => {
			h(el).attr("title", "value")

			expect(h(el).attr("title")).to.be.equals("value")
			expect(h(el).attr("title")).to.be.equals(el.getAttribute("title"))
		})
		describe("accept", () => {
			it("key value pair", () => {
				h(el).attr("title", "text")

				expect(el.getAttribute("title")).to.be.equal("text")
			})
			it("object", () => {
				h(el).attr({title: "text", color: "red"})

				expect(el.getAttribute("title")).to.be.equal("text")
				expect(el.getAttribute("color")).to.be.equal("red")
			})
			it("array of object", () => {
				h(el).attr([{title: "text"}, {color: "red"}])

				expect(el.getAttribute("title")).to.be.equal("text")
				expect(el.getAttribute("color")).to.be.equal("red")
			})
			it("multiple arguments objects", () => {
				h(el).attr({title: "text"}, {color: "red"})

				expect(el.getAttribute("title")).to.be.equal("text")
				expect(el.getAttribute("color")).to.be.equal("red")
			})
			it("array of array and object", () => {
				h(el).attr([{title: "text"}], {color: "red"})

				expect(el.getAttribute("title")).to.be.equal("text")
				expect(el.getAttribute("color")).to.be.equal("red")
			})
			it("multiple objects override", () => {
				h(el).attr([{title: "text"}, {color: "red"}, {color: "blue"}])

				expect(el.getAttribute("title")).to.be.equal("text")
				expect(el.getAttribute("color")).to.be.equal("blue")
			})
		})
		it("undefined and null value removes the attribute", () => {
			h(el).attr({title: "text", color: "red"}, {title: undefined, color: null})

			expect(el.getAttribute("title")).to.be.null
			expect(el.getAttribute("color")).to.be.null
		})
		it("gracefully downgrade for nodes without attributes", function() {
			const node = h.text("")
			expect(node.attr("attrName", "attrValue")).to.be.equal(node)
			expect(node.attr("attrName")).to.equals(null)
		})
	})

	describe("event", () => {
		// TODO
	})

	describe("querySelector", () => {
		it("works", () => {
			expect(hel.querySelector("li:nth-child(3)").node).to.be.equal(hel.node.querySelector("li:nth-child(3)"))
		})
		it("works with nakedNode = true", () => {
			expect(hel.querySelector("li:nth-child(3)", true)).to.be.equal(hel.node.querySelector("li:nth-child(3)"))
		})
		it("returns null when node is not compatible", () => {
			const el = h.text()
			expect(el.querySelector("*")).to.be.null
		})
	})

	describe("querySelectorAll", () => {
		it("works", () => {
			const withWrapper = [...hel.querySelectorAll("li")].map(dbe => dbe.node)
			const withoutWrapper = [...hel.node.querySelectorAll("li")]

			expect(withWrapper).to.be.deep.equal(withoutWrapper)
		})
		it("works with nakedNode = true", () => {
			const withWrapper = [...hel.querySelectorAll("li", true)]
			const withoutWrapper = [...hel.node.querySelectorAll("li")]

			expect(withWrapper).to.be.deep.equal(withoutWrapper)
		})
		it("returns empty array when node is not compatible", () => {
			const el = h.text()
			expect(el.querySelectorAll("*")).to.be.deep.equal([])
		})
	})

	describe("cb", () => {
		it("receives the node as argument", () => {
			hel.cb(node => {
				expect(hel.node).to.be.equal(node)
			})
		})
	})

	describe("reset", () => {
		// TODO
	})

	describe("empty", () => {
		// TODO
	})

	describe("node", () => {
		it("returns the wrapped node", () => {
			expect(h(el).node).to.be.equal(el)
		})
	})

	describe("clone", () => {
		it("returns a clone of the wrapped node", () => {
			const clone = hel.clone
			expect(clone.node).not.to.be.equal(hel.node)
			expect(clone.node.outerHTML).not.to.be.undefined
			expect(clone.node.outerHTML).to.be.equal(hel.node.outerHTML)
		})
	})
})

