import h from "../src/html.js"

import jsdom_global from 'jsdom-global'
jsdom_global("", { url: "http://localhost" })
import {expect} from 'chai'

describe("DOMBuilderElement", function () {
	let el = document.createElement("div")
	beforeEach(function () {
		el = document.createElement("div")
	})

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
		describe("special handling of Node without classList", function() {
			const node = h.text()
			expect(node.node.classList).to.be.undefined
			it ("get returns undefined", function () {
				expect(node.class()).to.be.undefined
			})
			it ("set return this", function () {
				expect(node.class("test")).to.equal(node)
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

	describe("appendRepeat", function () {
		it("equals append(html.repeat(...))", function () {
			let expected = h("div").append(h.repeat(8, "div", (el, i) => el.text(`div n°${i}`))).html()
			let result = h("div").appendRepeat(8, "div", (el, i) => el.text(`div n°${i}`)).html()
			expect(result).to.be.equal(expected)
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
		it("set throw if value doesn't have a toString", function () {
			expect(() => h(el).id(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
		})
		it("gracefully downgrade if node can't have an id", function () {
			const node = h.text()
			expect(node.id("test")).to.equal(node)
			expect(node.id()).to.equal("")
		})
	})

	describe("text", function () {
		it("set", function () {
			h(el).text("<div></div>test")

			expect(el.childElementCount).to.be.equal(0)
			expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
		})
		it("get", function () {
			// el.innerText works in browser but not with jsdom
			el.textContent = "<div></div>test"

			expect(h(el).text()).to.be.equal("<div></div>test")
			expect(el.outerHTML).to.be.equal("<div>&lt;div&gt;&lt;/div&gt;test</div>")
		})
		it("set throw if value doesn't have a toString", function () {
			expect(() => h(el).text(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
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
		it("set throw if value doesn't have a toString", function () {
			expect(() => h(el).html(Object.create(null))).to.throw(TypeError, "value must have a toString() method")
		})
		it("calls text() if node doesn't have an innerHTML", function() {
			const el = h.text("a")
			let ret = null
			ret = el.text("test")

			expect("innerHTML" in el.node).to.be.false
			expect(ret).to.be.equal(el)

			expect(el.html()).to.be.equal(el.text())
			expect(el.html()).to.be.equal("test")
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
		it("gracefully downgrade for nodes without attributes", function() {
			const node = h.text("")
			expect(node.attr("attrName", "attrValue")).to.be.equal(node)
			expect(node.attr("attrName")).to.equals(null)
		})
	})
})

