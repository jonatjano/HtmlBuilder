import {builder as h} from "../src/html.js"
import {expect} from "chai"

/*
 * builders function specific test
 */

describe("builder", () => {
	const el = document.createElement("div")

	it("exists", () => {
		expect(h).to.exist
		expect(h).to.be.a("function")
	})

	it("ns should be frozen", () => {
		expect(h.ns).to.be.frozen
	})

	it("accepts a DOMBuilderElement", () => {
		const el = h("div")

		expect(h(el)).to.equals(el)
		expect(h(h(h(h(h(el)))))).to.equals(el)
	})

	it("accepts a Node", () => {
		const wrap = h(el)

		expect(wrap.node).to.be.equal(el)
	})
	it("accepts a string", () => {
		const wrap = h("div")

		expect(wrap.node).to.be.an.instanceof(Node)
		expect(wrap.node.outerHTML).to.be.equal("<div></div>")
	})

	describe(".comment", () => {
		const comment = h.comment("comment").node

		expect(comment.nodeType).to.be.equal(8)
		expect(comment.textContent).to.be.equal("comment")
		expect(() => comment.id()).to.throw(TypeError)
		expect(() => comment.innerHTML()).to.throw(TypeError)
	})

	describe(".text", () => {
		const text = h.text("text").node

		expect(text.nodeType).to.be.equal(3)
		expect(text.textContent).to.be.equal("text")
		expect(() => text.id()).to.throw(TypeError)
		expect(() => text.innerHTML()).to.throw(TypeError)
	})

	describe(".repeat", () => {
		const length = 5
		describe("1st param type", () => {
			it("accept string", () => {
				const array = h.repeat(length, "div")

				expect(array).to.be.lengthOf(length)
				array.forEach(node => {
					expect(node.node.outerHTML).to.be.equal("<div></div>")
				})
				const allDifferent = array.every((node, i, arr) => arr.every((node2, j) => i === j || node !== node2))
				expect(allDifferent).to.be.true
			})
			it("accept node", () => {
				const array = h.repeat(length, el)

				expect(array).to.be.lengthOf(length)
				array.forEach(node => {
					expect(node.node.outerHTML).to.be.equal(el.outerHTML)
				})
				const allDifferent = array.every(node => node.node !== el)
				expect(allDifferent).to.be.true
			})
			it("accept DOMBuilderElement", () => {
				const array = h.repeat(length, h(el))

				expect(array).to.be.lengthOf(length)
				array.forEach(node => {
					expect(node.node.outerHTML).to.be.equal(el.outerHTML)
				})
				const allDifferent = array.every(node => node.node !== el)
				expect(allDifferent).to.be.true
			})
		})

		describe("callback works", () => {
			it("callback works", () => {
				const array = h.repeat(length, "div", undefined, (div, i) => {div.id(`id${i}`)})
				expect(array).to.be.lengthOf(length)
				array.forEach((node, i) => {
					expect(node.node.outerHTML).to.be.equal(`<div id="id${i}"></div>`)
				})
			})
		})
	})

	describe("namespace works", () => {
		const expected = document.createElementNS("http://www.w3.org/2000/svg", "svg")

		it("with namespace", () => {
			const actual = h("svg", {namespace: h.namespace.svg}).node

			expect(actual.isEqualNode(expected)).to.be.true
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
		})
		it("with ns alias", () => {
			const actual = h("svg", {namespace: h.ns.svg}).node
			expect(actual.isEqualNode(expected)).to.be.true
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
		})
	})

	describe("elementCreationOptions works", () => {
		const expected = document.createElement("ul", { is : "expanding-list" })

		it("with elementCreationOptions", () => {
			const actual = h("ul", {elementCreationOptions: {is: "expanding-list"}}).node
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
			expect(actual.tagName).to.be.equal(expected.tagName)
		})
		it("with options alias", () => {
			const actual = h("ul", {options: {is: "expanding-list"}}).node
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
			expect(actual.tagName).to.be.equal(expected.tagName)
		})
	})
})