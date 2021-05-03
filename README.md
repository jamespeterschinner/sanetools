# sanetools

Sane tools for chaining generator functions in JavaScript. Inspired by pythons Itertools with a few exceptions.

- There is no `repeat(object, times)` function, `cycle` does the same thing when called with an object

- `Accumulate` does not repeat the initial value if one is provided.

- Many of the functions in Python.itertools are missing

Rational, this projected stared off as a way to learn about javascript generators, implementing python itertools using JS generator functions seemed like a good way to do that. I soon realized that this was reimplementing many Lodash functions in generator form which could be useful in the real world.

# Usage

There are two distinct categories of genertaors in this libray. Ones that create initial values and ones that transform values.

The two value creating generators are `range` and `count`. Range generates a finite stream of values and count generates an infinite stream of values.

###### note: don't call `cycle` on an infinite generator

Once you have a stream of values, you can chain the value transforming generators to get the result you like. finally you can call `collect` on the generator to collect the values of the chained generators into an `Array`

### example

```javascript
    >> sanetools.count(13, 2).nwise(3).drop(2).take(5).collect();
```

The above code says "starting from **thirteen** and counting by **two**, give me the next **three** elements for each item, disregard the first **two** blocks of three and only take the next **five**"

### returns

```
    Array(5)
    ​
    0: Array(3) [ 19, 21, 23 ]
    ​
    1: Array(3) [ 21, 23, 25 ]
    ​
    2: Array(3) [ 23, 25, 27 ]
    ​
    3: Array(3) [ 25, 27, 29 ]
    ​
    4: Array(3) [ 27, 29, 31 ]
    ​
    length: 5
    ​
    <prototype>: Array 

    ...

```