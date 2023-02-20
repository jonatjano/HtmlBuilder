import {builder as h} from "../src/html.js"
import {expect} from "chai"

/*
 * this file contains some more complex test which could be real life usage
 */

describe("big tests", () => {
	it(`<div class="...">...<span class="... ...">...</span>...<a href="..."><b>...</b></a>...<img title="..." src="..."></div>`, () => {
		const el = h("div")
			.class("test")
			.append(
				"some text ",
				h("span")
					.class(["span", "someClass"])
					.text("span text"),
				", a tag with 1 attribute ",
				h("a")
					.attr("href", "link")
					.html("<b>link</b>"),
				" and a tag with multiple attributes ",
				h("img")
					.attr({title: "some title", src: "img.jpg"})
			).node

		expect(el.outerHTML.trim()).to.be
			.equal(`<div class="test">some text <span class="span someClass">span text</span>, a tag with 1 attribute <a href="link"><b>link</b></a> and a tag with multiple attributes <img title="some title" src="img.jpg"></div>`.trim())
	})
})
