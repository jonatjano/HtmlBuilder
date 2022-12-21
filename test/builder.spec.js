import h from "../src/html.js"
import {expect} from 'chai'

describe("builder", function () {
	const el = document.createElement("div")

	it("exists", function () {
		expect(h).to.exist
		expect(h).to.be.a("function")
	})

	it("ns should be frozen", function () {
		expect(h.ns).to.be.frozen
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

			expect(actual.isEqualNode(expected)).to.be.true
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
		})
		it("with ns alias", function () {
			const actual = h("svg", {namespace: h.ns.svg}).node
			expect(actual.isEqualNode(expected)).to.be.true
			expect(actual.outerHTML).to.be.equal(expected.outerHTML)
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
	})
})