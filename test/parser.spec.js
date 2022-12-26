import h from "../src/html.js";
import {expect} from "chai";
import builder from "../src/html.js";

describe("parser", function () {
    it("work", function () {
        const expected = h("div").append(h("div").append(h("div")))

        const doc = h.parse(parser => parser`<div><div></div></div>`)

        const div = document.createElement("div")
        div.append(doc)
        expect(div.innerHTML).to.be.equal(expected.html())
    })
    it("can change special attribute prefix", function () {
        const basePrefix = builder.parse.ATTRIBUTE_PREFIX

        const withBasePrefix = h("div").append(h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${x}'>${i} -> ${x}</div>`)).html()

        builder.parse.ATTRIBUTE_PREFIX = "data-my-prefix-"
        expect(withBasePrefix).to.equal(
            h("div").append(h.parse((parser, o, x, i) => parser`<div data-my-prefix-loop='["a"];${x}'>${i} -> ${x}</div>`)).html()
        )

        builder.parse.ATTRIBUTE_PREFIX = basePrefix
    })

    describe("loop", function () {
        const obj = {a:1,b:2,c:3}
        describe("over an array", function () {
            const arr = [...Object.keys(obj)]
            // add these text node because parse does keep them in the html
            const expected = h("div").append(h.repeat(3, "div", (div, i) => {div.text(`${i} -> ${arr[i]}`)}))
            it("inline", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a","b","c"];${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
            it("using var", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='${arr};${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
        })
        describe("over an object", function () {
            // add these text node because parse does keep them in the html
            const expected = h("div").append(h.repeat(3, "div", (div, i) => {div.text(`${Object.keys(obj)[i]} -> ${Object.values(obj)[i]}`)}))
            it("inline", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='{"a":1,"b":2,"c":3};${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
            it("using var", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='${obj};${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
        })
        describe("over a Map", function () {
            const map = new Map(Object.entries(obj))
            // add these text node because parse does keep them in the html
            const expected = h("div").append(h.repeat(3, "div", (div, i) => {div.text(`${[...map.keys()][i]} -> ${[...map.values()][i]}`)}))
            it("using var", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='${map};${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
        })
        describe("over a Set", function () {
            const set = new Set([...Object.keys(obj)])
            // add these text node because parse does keep them in the html
            const expected = h("div").append(h.repeat(3, "div", (div, i) => {div.text(`${[...set.keys()][i]} -> ${[...set.values()][i]}`)}))
            it("using var", function () {
                const doc = h.parse((parser, o, x, i) => parser`<div data-hp-loop='${set};${x},${i}'>${i} -> ${x}</div>`)
                const div = document.createElement("div")
                div.append(doc)
                expect(div.innerHTML).to.be.equal(expected.html())
            })
        })

        describe("throw when input is", function () {
            const a = ["a"]
            describe("bad format", function () {
                it("missing semicolon", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"]${x},${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${a}${x},${i}'></div>`)).to.throw(" parameters are not valid")
                })
                it("missing colon", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${x}${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${a};${x}${i}'></div>`)).to.throw(" parameters are not valid")
                })
                it("no value bind", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"]'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${a};'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${a}'></div>`)).to.throw(" parameters are not valid")
                })
                it("no iterable", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop=';${x},${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${x},${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop=';${x},${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${x},${i}'></div>`)).to.throw(" parameters are not valid")
                })
            })
            describe("bad values", function () {
                it("iterable not valid", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${"abc"};${x},${i}'></div>`)).to.throw(" iterable argument is not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='"abc";${x},${i}'></div>`)).to.throw(" iterable argument is not valid")
                })
                it("value Symbol not valid", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];["a"],${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${null},${i}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${undefined},${i}'></div>`)).to.throw(" parameters are not valid")

                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${["a"]},${i}'></div>`)).to.throw(" value argument must be a symbol")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${{}},${i}'></div>`)).to.throw(" value argument must be a symbol")
                })
                it("index Symbol not valid", function () {
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${i},["a"]'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${i},${null}'></div>`)).to.throw(" parameters are not valid")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${i},${undefined}'></div>`)).to.throw(" parameters are not valid")

                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${i},${["a"]}'></div>`)).to.throw(" index argument must be a symbol")
                    expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${i},${{}},${i}'></div>`)).to.throw(" index argument must be a symbol")
                })
            })
        })
        it("works when index is omitted", function () {
            const a = ["a"]
            expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='["a"];${x}'>${i} -> ${x}</div>`)).not.to.throw()
            expect(_=>h.parse((parser, o, x, i) => parser`<div data-hp-loop='${a};${x}'>${i} -> ${x}</div>`)).not.to.throw()
        })
    })
})