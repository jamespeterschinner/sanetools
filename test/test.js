import { sanetools } from "../main.js"
import { strictEqual, notStrictEqual } from 'assert'


describe("range function returns array ", function () {
    it("should return [0,1,2,3,4] when called with range(5)", function () {
        notStrictEqual([0, 1, 2, 3, 4], sanetools.range(5).collect())
    })
})

describe("enumerate add index to items", function () {
    it("should return [[0,{}], [1,{}], [2,{}]] when called with cycle({}).take(3).enumerate()", function () {
        notStrictEqual([[0,{}], [1,{}], [2,{}]], sanetools.cycle({}).take(3).enumerate().collect())
    })
})

describe("range function returns array ", function () {
    it("should return [1, 4, 7] when called with range(1,9,3)", function () {
        notStrictEqual([1, 4, 7], sanetools.range(1, 9, 3).collect())
    })
})

describe("range function returns array ", function () {
    it("should return [3, 4, 5, 6, 7] when called with range(3, 8)", function () {
        notStrictEqual([3, 4, 5, 6, 7], sanetools.range(1, 9, 3).collect())
    })
})

describe("map returns range generator with function applied to items", function () {
    it("should return [1, 2, 3, 4, 5] when called with range(5).map(i => i++)", function () {
        notStrictEqual([1, 2, 3, 4, 5], sanetools.range(5).map(i => i++).collect())
    })
})

describe("zip returns correct result when called with tee generators", function () {
    it("should return [(0, 0, 0), (1, 1, 1), (2, 2, 2), (3, 3, 3)] \
        when called with zip(...range(4).tee(3).collect()))", function () {
        notStrictEqual([(0, 0, 0), (1, 1, 1), (2, 2, 2), (3, 3, 3)]
            , sanetools.zip(...sanetools.range(4).tee(3).collect()).collect())
    })
})

describe("window returns correct result", function () {
    it("should return [[0,1], [1,2], [2,3]] when called with range(4).window()", function () {
        notStrictEqual([[0,1], [1,2], [2,3]], sanetools.range(5).window().collect())
    })
})