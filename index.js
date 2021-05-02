console.log("loading Itertools");

var Itertools;
(function (Itertools) {

    identity = (arraylikeOrIterable) =>
        new Wrapper(function* () {
            for (let item of arraylikeOrIterable) {
                yield item
            }
        }())

    // default accumulate operator
    add = (a, b) => a + b;

    class Wrapper {
        constructor(generator) {
            this.generator = generator
        }

        [Symbol.iterator]() {
            return this.generator
        }

        next() {
            return this.generator.next()
        }
        collect() {
            return Array.from(this)
        }

        takeWhile(predicate) {
            return Itertools.takeWhile(predicate, this)
        }

        enumerate() {
            return Itertools.enumerate(this)
        }

        take(number) {
            return Itertools.take(number, this)
        }

        cycle(times = -1) {
            return Itertools.cycle(this, times)
        }

        accumulate(operator = add, initial = null) {
            return Itertools.accumulate(this, operator, initial)
        }

        tee(splits = 2) {
            return Itertools.tee(this, splits)
        }

        drop(items = 1) {
            return Itertools.drop(this, items)
        }

        step(step = 1) {
            return Itertools.step(this, step)
        }

        islice(start = 0, stop = null, step = 0) {
            return Itertools.islice(this, start, stop, step)
        }

        map(func) {
            return Itertools.map(func, this)
        }

        nwise(n = 2) {
            return Itertools.nwise(this, n)
        }

    }

    Itertools.map = (func, iterable) =>
        new Wrapper(function* () {
            for (let item of iterable) {
                yield func(item)
            }

        }())

    Itertools.zip = (...args) =>
        new Wrapper(function* () {
            let iterators = args.map(identity);
            while (true) {
                let result = iterators.map(it => it.next().value)
                if (result.every(item => item != undefined)) {
                    yield result;
                } else {
                    break
                }
            }
            return
        }())


    Itertools.tee = (iterable, splits = 2) =>
        new Wrapper(function* () {
            let indexes = Array(splits).fill(0);
            let acc = [];
            let bufferIterator = (upto) => {
                let bufferFull = false;
                if (acc.length - 1 < upto) {
                    let { value, done } = iterable.next();
                    bufferFull = done;
                    if (value !== undefined) {
                        acc.push(value);
                    }
                }

                if (Math.min(...indexes) != 0) {
                    acc.shift();
                    indexes = indexes.map(idx => idx - 1);
                }

                return bufferFull;
            }
            for (let idxIndex of Itertools.range(splits)) {
                yield new Wrapper(function* () {
                    while (true) {
                        if (bufferIterator(indexes[idxIndex])) {
                            // underlying generator is done
                            return
                        }
                        yield acc[indexes[idxIndex]];
                        indexes[idxIndex] += 1;
                    }
                }())

            }

            return
        }())

    Itertools.drop = (iterable, items = 1) =>
        new Wrapper(function* () {
            let count = 0;
            while (count < items) {
                let { value, done } = iterable.next();
                if (done) { return }
                count += 1;
            }
            for (let item of iterable) {
                yield item
            }

            return

        }())

    Itertools.step = (iterable, step = 1) =>
        new Wrapper(function* () {
            let count = 0;
            while (true) {
                let { value, done } = iterable.next();
                if (count == 0) {
                    yield value
                } else if (done || value === undefined) {
                    return
                }
                count += 1;

                if (count >= step) {
                    count = 0;
                }

            }

        }())

    Itertools.islice = (iterable, start = 0, stop = null, step = 1) =>
        new Wrapper(function () {
            // Not a generator function*
            // It is a generator builder
            let gen;
            if (start == 0) {
                gen = iterable
            } else {
                gen = Itertools.drop(iterable, start)
            }
            if (step > 0) {
                gen = gen.step(step)
            }
            if (stop != null) {
                gen = gen.take(Math.floor((stop - start) / step + 1))
            }
            return gen

        }())


    Itertools.nwise = (iterable, n = 2) =>
        Itertools.zip(...
            Itertools.tee(iterable, n).enumerate().map(
                function ([idx, gen]) {
                    return gen.islice(idx);
                }).collect()
        )


    Itertools.count = (start = 0, step = 1) =>
        new Wrapper(function* () {
            let n = start;
            while (true) {
                yield n += step
            }
        }())

    Itertools.range = (start = 0, stop = NaN, step = 1) =>
        new Wrapper(function* () {
            if (isNaN(stop)) {
                stop = start;
                start = 0
            }
            let value = start
            while (value < stop) {
                yield value
                value += step
            }
            return

        }())

    Itertools.cycle = (objectOrIterable, times = -1) =>
        new Wrapper(function* () {
            let count = 0;
            let previousItems = [];

            try {
                for (let item of objectOrIterable) {
                    previousItems.push(item)
                    yield item
                }
                count += 1
            } catch (TypeError) {
                // Not iterable
            }

            while (count < times || times == -1) {
                if (previousItems.length > 0) {
                    for (let item of previousItems) {
                        yield item
                    }
                } else {
                    yield objectOrIterable

                }
                count = times > 0 ? count + 1 : 1
            }


        }())


    Itertools.accumulate = (iterable, operator = add, initial = null) =>
        new Wrapper(function* () {
            let acc;
            for (let [index, item] of Itertools.enumerate(iterable)) {
                if (index === 0) {
                    if (initial !== null) {
                        acc = operator(item, initial);
                    } else {
                        acc = item
                    }
                } else {
                    acc = operator(item, acc)

                }
                yield acc;
            }

        }())


    Itertools.enumerate = (iterable) =>
        new Wrapper(function* () {
            let index = 0;
            for (let item of iterable) {
                yield [index, item]
                index += 1
            }
        }())

    Itertools.take = (number, iterable) =>
        new Wrapper(function* () {
            for (let [index, item] of Itertools.enumerate(iterable)) {

                if (index < number) {
                    yield item
                } else {
                    return
                }
            }

        }())

    Itertools.takeWhile = (predicate, iterable) =>
        new Wrapper(function* () {
            for (let item of iterable) {
                if (predicate(item)) {
                    yield item
                } else {
                    return
                }
            }
        }())



}(Itertools || (Itertools = {})))
