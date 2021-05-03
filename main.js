export var sanetools;
(function (sanetools) {

    sanetools.identity = (arraylikeOrIterable) =>
        new Wrapper(function* () {
            for (let item of arraylikeOrIterable) {
                yield item
            }
        }())

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
            return sanetools.takeWhile(predicate, this)
        }

        enumerate() {
            return sanetools.enumerate(this)
        }

        take(number) {
            return sanetools.take(number, this)
        }

        cycle(times = -1) {
            return sanetools.cycle(this, times)
        }

        accumulate(operator = (a, b) => a + b, initial = null) {
            return sanetools.accumulate(this, operator, initial)
        }

        tee(splits = 2) {
            return sanetools.tee(this, splits)
        }

        drop(items = 1) {
            return sanetools.drop(this, items)
        }

        step(step = 1) {
            return sanetools.step(this, step)
        }

        islice(start = 0, stop = null, step = 1) {
            return sanetools.islice(this, start, stop, step)
        }

        map(func) {
            return sanetools.map(func, this)
        }

        nwise(n = 2) {
            return sanetools.nwise(this, n)
        }

    }

    sanetools.map = (func, iterable) =>
        new Wrapper(function* () {
            for (let item of iterable) {
                yield func(item)
            }

        }())

    sanetools.zip = (...args) =>
        new Wrapper(function* () {
            let iterators = args.map(sanetools.identity);
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


    sanetools.tee = (iterable, splits = 2) =>
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
            for (let idxIndex of sanetools.range(splits)) {
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

    sanetools.drop = (iterable, items = 1) =>
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

    sanetools.step = (iterable, step = 1) =>
        new Wrapper(function* () {
            let count = 0;
            while (true) {
                let { value, done } = iterable.next();
                if (value == undefined || done) {
                    break
                } else if (count === 0) {
                    yield value
                }
                count += 1;

                if (count >= step) {
                    count = 0;
                }

            }
            return

        }())

    sanetools.islice = (iterable, start = 0, stop = null, step = 1) => {
        // Not a generator function*, it is a generator builder.
        let gen;
        if (start == 0) {
            gen = iterable
        } else {
            gen = sanetools.drop(iterable, start)
        }
        if (step > 0) {
            gen = gen.step(step)
        }
        if (stop != null) {
            gen = gen.take(Math.floor((stop - start) / step))
        }
        return gen

    }


    sanetools.nwise = (iterable, n = 2) =>
        // Not a generator function*, it is a generator builder.
        sanetools.zip(...
            sanetools.tee(iterable, n).enumerate().map(
                function ([idx, gen]) {
                    return gen.islice(idx);
                }).collect()
        )


    sanetools.count = (start = 0, step = 1) =>
        new Wrapper(function* () {
            let n = start;
            while (true) {
                yield n;
                n += step
            }
        }())

    sanetools.range = (start = 0, stop = NaN, step = 1) =>
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

    sanetools.cycle = (objectOrIterable, times = -1) =>
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


    sanetools.accumulate = (iterable, operator = add, initial = null) =>
        new Wrapper(function* () {
            let acc;
            for (let [index, item] of sanetools.enumerate(iterable)) {
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


    sanetools.enumerate = (iterable) =>
        new Wrapper(function* () {
            let index = 0;
            for (let item of iterable) {
                yield [index, item]
                index += 1
            }
        }())

    sanetools.take = (number, iterable) =>
        new Wrapper(function* () {
            for (let [index, item] of sanetools.enumerate(iterable)) {

                if (index < number) {
                    yield item
                } else {
                    return
                }
            }

        }())

    sanetools.takeWhile = (predicate, iterable) =>
        new Wrapper(function* () {
            for (let item of iterable) {
                if (predicate(item)) {
                    yield item
                } else {
                    return
                }
            }
        }())



}(sanetools || (sanetools = {})))
