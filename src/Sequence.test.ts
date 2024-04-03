import Sequence from "./Sequence";

describe('Sequence.from', () => {
    test('should return a new Sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should create full sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = Array.from(sequence);
        const array2 = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });

    test('should map items using the mapper argument', () => {
        const sequence = Sequence.from([1, 2, 3], x => x * 2);

        const array = Array.from(sequence);

        expect(array).toEqual([2, 4, 6]);
    });

    test('should map items using the mapper argument and bind to thisArg', () => {
        const thisArg = {
            getFactor: jest.fn(() => 2),
        }

        const sequence = Sequence.from([1, 2, 3], function(this: typeof thisArg, x) { return x * this.getFactor() }, thisArg);

        const array = Array.from(sequence);

        expect(array).toEqual([2, 4, 6]);
        expect(thisArg.getFactor).toHaveBeenCalledTimes(3);
    });

    test('should create a sequence from an array like instance', () => {
        const arrayLike = {
            length: 3,
            0: 1,
            1: 2,
            2: 3,
        }

        const sequence = Sequence.from(arrayLike);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    })

    test('should create a sequence from an array like instance with no indeces', () => {
        const arrayLike = {
            length: 3,
        }

        const sequence = Sequence.from(arrayLike);

        const array = Array.from(sequence);

        expect(array).toEqual([undefined, undefined, undefined]);
    });

    test('should create an array-like instance when given an array-like instance', () => {
        const arrayLike = {
            length: 3,
        }

        const sequence = Sequence.from(arrayLike);

        const arrayLike2 = sequence.toArray();

        expect(arrayLike2).toEqual(arrayLike);
    });

    test('should create an arrary when given an array-like instance with a mapper that returns value', () => {
        const arrayLike = {
            length: 3,
        }

        const sequence = Sequence.from(arrayLike, () => 1);

        const array = sequence.toArray();

        expect(array).toEqual([1, 1, 1]);
    })

    test('should bind mapper to thisArg if provided when given an array-like-instance', () => {
        const thisArg = {
            getFactor: jest.fn(() => 2),
        }

        const sequence = Sequence.from({ length: 3 }, function(this: typeof thisArg) { return 1 * this.getFactor() }, thisArg);

        const array = sequence.toArray();

        expect(array).toEqual([2, 2, 2]);
    })

}); 

describe('Sequence.of', () => {
    test('should return a new Sequence', () => {
        const sequence = Sequence.of(1, 2, 3);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should create full sequence more than once', () => {
        const sequence = Sequence.of(1, 2, 3);

        const array = Array.from(sequence);
        const array2 = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });
});

describe('Sequence.isSequence', () => {
    test('should return true if the sequence is an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = Sequence.isSequence(sequence);

        expect(result).toBe(true);
    });

    test('should return false if the sequence is not an array', () => {
        const sequence = { [Symbol.iterator]: () => {} };

        const result = Sequence.isSequence(sequence);

        expect(result).toBe(false);
    });

    test('should return false if the sequence is null', () => {
        const sequence = null;

        const result = Sequence.isSequence(sequence);

        expect(result).toBe(false);
    });

    test('should return false if the sequence is undefined', () => {
        const sequence = undefined;

        const result = Sequence.isSequence(sequence);

        expect(result).toBe(false);
    });
});

describe('Sequence.count', () => {
    test('should return the number of items in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const count = sequence.count();

        expect(count).toBe(3);
    });

    test('should return 0 for an empty sequence', () => {
        const sequence = Sequence.from([]);

        const count = sequence.count();

        expect(count).toBe(0);
    });

    test('should invoke prior steps for every item in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        const predicate = jest.fn(x => x < 4); // Does not shrink sequence to avoid index mismatches in test below.
        const filtered = mapped.filter(predicate);

        filtered.count();

        expect(mapper).toHaveBeenCalledTimes(3);
        expect(predicate).toHaveBeenCalledTimes(3);
    });
})

describe('Sequence.fill', () => {
    test('should return a new Sequence filled with the given value', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4);

        const array = Array.from(filled);

        expect(array).toEqual([4, 4, 4]);
    });

    test('should overwrite values after and including the start index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 1);

        const array = Array.from(filled);

        expect(array).toEqual([1, 4, 4]);
    })

    test('should overwrite values between the start and end index, including the start index but excluding the end', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 1, 2);

        const array = Array.from(filled);

        expect(array).toEqual([1, 4, 3]);
    });

    test('should change nothing if the start and end indices are the same', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 1, 1);

        const array = Array.from(filled);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should change nothing if the start index is greater than the end index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 3, 1);

        const array = Array.from(filled);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should change nothing if the start index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 3, 4);

        const array = Array.from(filled);

        expect(array).toEqual([1, 2, 3]);
    })

    test('should overwrite values after and including the start index if the end index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, 1, 5);

        const array = Array.from(filled);

        expect(array).toEqual([1, 4, 4]);
    })
    
    test('should use start and end relative to the end of the sequence if values are negative', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(4, -3, -2);

        const array = Array.from(filled);

        expect(array).toEqual([4, 2, 3]);
    });

    test('should create full filled sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filled = sequence.fill(0);

        const array = Array.from(filled);
        const array2 = Array.from(filled);

        expect(array).toEqual([0, 0, 0]);
        expect(array2).toEqual([0, 0, 0]);
        expect(array).not.toBe(array2);
    });
});

describe('Sequence.map', () => {
    test('should map a sequence according to the mapper callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const array = Array.from(mapped);

        expect(array).toEqual([2, 4, 6]);
    });

    test('should create full mapped sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const array = Array.from(mapped);
        const array2 = Array.from(mapped);

        expect(array).toEqual([2, 4, 6]);
        expect(array2).toEqual([2, 4, 6]);
        expect(array).not.toBe(array2);
    })

    test('mapper callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        expect(mapper).not.toHaveBeenCalled();

        Array.from(mapped);

        expect(mapper).toHaveBeenCalledTimes(3);
    })

    test('can be combined with other sequence methods as a chain', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence
            .map(x => x * 2)
            .map(x => x + 1);

        const array = Array.from(mapped);

        expect(array).toEqual([3, 5, 7]);
    })

    test('should call mapper every time sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        Array.from(mapped);
        Array.from(mapped);

        expect(mapper).toHaveBeenCalledTimes(6);
    });

    test('should provide indices and sequence to the mapper callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn((x, i) => x + i);
        const mapped = sequence.map(mapper);

        const array = Array.from(mapped);

        expect(mapper).toHaveBeenCalledWith(1, 0, sequence);
        expect(mapper).toHaveBeenCalledWith(2, 1, sequence);
        expect(mapper).toHaveBeenCalledWith(3, 2, sequence);

        expect(array).toEqual([1, 3, 5]);
    });

    test('should interleave calls to multiple steps in the chain', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapper2 = jest.fn(x => x + 1);

        const mapped = sequence
            .map(mapper)
            .map(mapper2);

        const iterator = mapped[Symbol.iterator]();
        const result1 = iterator.next();

        expect(result1).toEqual({ value: 3, done: false });
        expect(mapper).toHaveBeenCalledTimes(1);
        expect(mapper2).toHaveBeenCalledTimes(1);

        const result2 = iterator.next();

        expect(result2).toEqual({ value: 5, done: false });
        expect(mapper).toHaveBeenCalledTimes(2);
        expect(mapper2).toHaveBeenCalledTimes(2);

        const result3 = iterator.next();

        expect(result3).toEqual({ value: 7, done: false });
        expect(mapper).toHaveBeenCalledTimes(3);
        expect(mapper2).toHaveBeenCalledTimes(3);

    })

    test('should bind mapper to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getFactor: jest.fn(() => 2),
        }

        const mapped = sequence.map(function (this: typeof thisArg, x) 
        { 
            return x * this?.getFactor() 
        }, thisArg);

        const array = Array.from(mapped);

        expect(thisArg.getFactor).toHaveBeenCalledTimes(3);
        expect(array).toEqual([2, 4, 6]);
    })
});

describe('Sequence.flatMap', () => {
    test('should flatMap a sequence according to the mapper callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const flatMapped = sequence.flatMap(x => [x, x]);

        const array = Array.from(flatMapped);

        expect(array).toEqual([1, 1, 2, 2, 3, 3]);
    });
    
    test('should pre-allocate and explicitly iterate', () => {
        const sequence = Sequence.from([1, 2, 3, 4]);

        const flatMapped = sequence.flatMap(x => [x, x * 2]);

        const array = Array.from(flatMapped);

        expect(array).toEqual([1, 2, 2, 4, 3, 6, 4, 8]);
    })

    test('should create full flatMapped sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const flatMapped = sequence.flatMap(x => [x, x]);

        const array = Array.from(flatMapped);
        const array2 = Array.from(flatMapped);

        expect(array).toEqual([1, 1, 2, 2, 3, 3]);
        expect(array2).toEqual([1, 1, 2, 2, 3, 3]);
        expect(array).not.toBe(array2);
    })

    test('mapper callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => [x, x]);
        const flatMapped = sequence.flatMap(mapper);

        expect(mapper).not.toHaveBeenCalled();

        Array.from(flatMapped);

        expect(mapper).toHaveBeenCalledTimes(3);
    })

    test('can be combined with other sequence methods as a chain', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const flatMapped = sequence
            .flatMap(x => [x, x])
            .flatMap(x => [x, x]);

        const array = Array.from(flatMapped);

        expect(array).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]);
    })

    test('should call mapper every time sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => [x, x]);
        const flatMapped = sequence.flatMap(mapper);

        Array.from(flatMapped);
        Array.from(flatMapped);

        expect(mapper).toHaveBeenCalledTimes(6);
    });

    test('should provide indices and sequence to the mapper callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn((x, i) => [x, i]);
        const flatMapped = sequence.flatMap(mapper);

        const array = Array.from(flatMapped);

        expect(mapper).toHaveBeenCalledWith(1, 0, sequence);
        expect(mapper).toHaveBeenCalledWith(2, 1, sequence);
        expect(mapper).toHaveBeenCalledWith(3, 2, sequence);

        expect(array).toEqual([1, 0, 2, 1, 3, 2]);
    });

    test('should produce same sequence if original contains only elements', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const flatMapped = sequence.flatMap(x => x);

        const array = Array.from(flatMapped);

        expect(array).toEqual(sequence.toArray());
    
    })

    test('should bind mapper to thisArg if provided', () => { 
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getFactor: jest.fn(() => 2),
        }

        const flatMapped = sequence.flatMap(function (this: typeof thisArg, x) 
        { 
            return [x, x * this?.getFactor()] 
        }, thisArg);

        const array = Array.from(flatMapped);

        expect(thisArg.getFactor).toHaveBeenCalledTimes(3);
        expect(array).toEqual([1, 2, 2, 4, 3, 6]);
    });

});

describe('Sequence.filter', () => {
    test('should filter a sequence according to the predicate callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filtered = sequence.filter(x => x % 2 === 0);

        const array = Array.from(filtered);

        expect(array).toEqual([2]);
    });

    test('should create full mapped sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const filtered = sequence.filter(x => x % 2 === 0);

        const array = Array.from(filtered);
        const array2 = Array.from(filtered);

        expect(array).toEqual([2]);
        expect(array2).toEqual([2]);
        expect(array).not.toBe(array2);
    })

    test('predicate callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 === 0);
        const filtered = sequence.filter(predicate);

        expect(predicate).not.toHaveBeenCalled();

        Array.from(filtered);

        expect(predicate).toHaveBeenCalledTimes(3);
    })

    test('can be combined with other sequence methods as a chain', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

        const filtered = sequence
            .filter(x => x % 2 === 0)
            .filter(x => x % 3 === 0);

        const array = Array.from(filtered);

        expect(array).toEqual([6, 12]);
    })

    test('should call predicate every time sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 === 0);
        const filtered = sequence.filter(predicate);

        Array.from(filtered);
        Array.from(filtered);

        expect(predicate).toHaveBeenCalledTimes(6);
    })

    test('should interleave calls to multiple steps in the chain', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

        const filter = jest.fn(x => x % 2 === 0);
        const filter2 = jest.fn(x => x % 3 === 0);

        const filtered = sequence
            .filter(filter)
            .filter(filter2);

        const iterator = filtered[Symbol.iterator]();
        const result1 = iterator.next();

        expect(result1).toEqual({ value: 6, done: false });
        expect(filter).toHaveBeenCalledTimes(6); // 6 calls to first true result.
        expect(filter2).toHaveBeenCalledTimes(3); // 3 calls to first true result

        const result2 = iterator.next();

        expect(result2).toEqual({ value: 12, done: false });
        expect(filter).toHaveBeenCalledTimes(12);
        expect(filter2).toHaveBeenCalledTimes(6);

        const result3 = iterator.next();
    })

    test('should bind predicate to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getDivisor: jest.fn(() => 2),
        }

        const filtered = sequence.filter(function (this: typeof thisArg, x) { return x % this?.getDivisor() === 0 }, thisArg);

        const array = Array.from(filtered);

        expect(thisArg.getDivisor).toHaveBeenCalledTimes(3);
        expect(array).toEqual([2]);
    })
});

describe('Sequence.reduce', () => {
    test('should reduce a sequence according to the reducer callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.reduce((acc, x) => acc + x, 0);

        expect(result).toBe(6);
    });

    test('should return the initial value if the sequence is empty', () => {
        const sequence = Sequence.from([]);

        const result = sequence.reduce((acc, x) => acc + x, 0);

        expect(result).toBe(0);
    }); 

    test('should return the first value if the sequence has only one element', () => {
        const sequence = Sequence.from([1]);

        const result = sequence.reduce((acc, x) => acc + x, 0);

        expect(result).toBe(1);
    });

    test('should call the reducer callback for every item in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const reducer = jest.fn((acc, x) => acc + x);

        sequence.reduce(reducer, 0);

        expect(reducer).toHaveBeenCalledTimes(3);
    });
    
    test('should call prior steps for every item in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        const reducer = jest.fn((acc, x) => acc + x);

        mapped.reduce(reducer, 0);

        expect(mapper).toHaveBeenCalledTimes(3);
        expect(reducer).toHaveBeenCalledTimes(3);
    });
});

describe('Sequence.reduceRight', () => {
    test('should reduceRight a sequence according to the reducer callback', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.reduceRight((acc, x) => acc + x, 0);

        expect(result).toBe(6);
    });

    test('should return the initial value if the sequence is empty', () => {
        const sequence = Sequence.from([]);

        const result = sequence.reduceRight((acc, x) => acc + x, 0);

        expect(result).toBe(0);
    });

    test('should return the first value if the sequence has only one element', () => {
        const sequence = Sequence.from([1]);

        const result = sequence.reduceRight((acc, x) => acc + x, 0);

        expect(result).toBe(1);
    });

    test('should call the reducer callback for every item in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const reducer = jest.fn((acc, x) => acc + x);

        sequence.reduceRight(reducer, 0);

        expect(reducer).toHaveBeenCalledTimes(3);
    });

    test('should call prior steps for every item in the sequence +3 for necessaray reverse realization', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        const reducer = jest.fn((acc, x) => acc + x);

        mapped.reduceRight(reducer, 0);

        expect(mapper).toHaveBeenCalledTimes(6); // +3 for necessaray reverse realization
        expect(reducer).toHaveBeenCalledTimes(3);
    });
});

describe('Sequence.push', () => {
    test('should return a new Sequence with the given value appended', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const pushed = sequence.push(4);

        const array = Array.from(pushed);

        expect(array).toEqual([1, 2, 3, 4]);
    });

    test('should append multiple values to the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const pushed = sequence.push(4, 5, 6);

        const array = Array.from(pushed);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should create full pushed sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const pushed = sequence.push(4);

        const array = Array.from(pushed);
        const array2 = Array.from(pushed);

        expect(array).toEqual([1, 2, 3, 4]);
        expect(array2).toEqual([1, 2, 3, 4]);
        expect(array).not.toBe(array2);
    });

    test('should not mutate the original sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        sequence.push(4);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    });
});

describe('Sequence.unshift', () => {
    test('should return a new Sequence with the given value prepended', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const unshifted = sequence.unshift(0);

        const array = Array.from(unshifted);

        expect(array).toEqual([0, 1, 2, 3]);
    });

    test('should prepend multiple values to the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const unshifted = sequence.unshift(0, -1, -2);

        const array = Array.from(unshifted);

        expect(array).toEqual([0, -1, -2, 1, 2, 3]);
    });

    test('should create full unshifted sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const unshifted = sequence.unshift(0);

        const array = Array.from(unshifted);
        const array2 = Array.from(unshifted);

        expect(array).toEqual([0, 1, 2, 3]);
        expect(array2).toEqual([0, 1, 2, 3]);
        expect(array).not.toBe(array2);
    });

    test('should not mutate the original sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        sequence.unshift(0);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    });    
});

describe('Sequence.slice', () => {
    test('should return a new Sequence with the given range of values', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice();

        const array = Array.from(sliced);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should return a new Sequence with the given range of values', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(1, 3);

        const array = Array.from(sliced);

        expect(array).toEqual([2, 3]);
    });

    test('should return a new Sequence with the given start index', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(3);

        const array = Array.from(sliced);

        expect(array).toEqual([4, 5, 6]);
    });

    test('should return a new Sequence with the given end index', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(0, 3);

        const array = Array.from(sliced);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should return a new Sequence with the given negative start index', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(-3);

        const array = Array.from(sliced);

        expect(array).toEqual([4, 5, 6]);
    });

    test('should start at 0 if the start index is negative and less than negative length of sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(-7);

        const array = Array.from(sliced);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    });
    
    test('should return a new Sequence with the given negative end index', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(0, -3);

        const array = Array.from(sliced);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should end at length if the end index is negative and less than negative length of sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(0, -7);

        const array = Array.from(sliced);

        expect(array).toEqual([]);
    });

    test('should return an empty sequence if the start index is greater than the end index', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const sliced = sequence.slice(3, 1);

        const array = Array.from(sliced);

        expect(array).toEqual([]);
    });
});

describe('Sequence.with', () => {
    test('should return a new Sequence with the given value replacing the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const withed = sequence.with(1, 4);

        const array = Array.from(withed);

        expect(array).toEqual([1, 4, 3]);
    });

    test('should return a new Sequence with the given value replacing the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const withed = sequence.with(0, 4);

        const array = Array.from(withed);

        expect(array).toEqual([4, 2, 3]);
    });

    test('should throw exception if index is out of rante', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const withed = sequence.with(3, 4);

        const test = () => Array.from(withed);

        expect(test).toThrow('Index 3 is out of range.')
    });

    test('should return a new Sequence with the given value replacing the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const withed = sequence.with(-1, 4);

        const array = Array.from(withed);

        expect(array).toEqual([1, 2, 4]);
    });

    test('should return a new Sequence with the given value replacing the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const withed = sequence.with(-3, 4);

        const array = Array.from(withed);

        expect(array).toEqual([4, 2, 3]);
    });

    test('should return a new Sequence with the given value replacing the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);    

        const test = () => sequence.with(-4, 4);

        expect(test).toThrow('Index -4 is out of range.')
    });
});

describe('Sequence.at', () => {
    test('should return the element at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const element = sequence.at(1);

        expect(element).toBe(2);
    })

    test('should return undefined if the index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const element = sequence.at(3);

        expect(element).toBeUndefined();
    });

    test('should return mapped value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const element = mapped.at(1);

        expect(element).toBe(4);
    })

    test('should only call mapper callback n+1 times given a value of n', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        mapped.at(1);

        expect(mapper).toHaveBeenCalledTimes(2);
    })

    test('should return index of filtered sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const filtered = sequence.filter(x => x % 2 === 0);

        const element = filtered.at(1);

        expect(element).toBe(4);
    })

    test('should not call predicate for ever value of original sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const predicate = jest.fn(x => x % 2 === 0);
        const filtered = sequence.filter(predicate);

        filtered.at(1);

        expect(predicate).toHaveBeenCalledTimes(4);
    })

    test('should return undefined if index is out of range of filtered sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5, 6]);

        const filtered = sequence.filter(x => x % 2 === 0);

        const element = filtered.at(3);

        expect(element).toBeUndefined();
    })
});

describe('Sequence.find', () => {
    test('should find the first item in the sequence for which the predicate callback returns true', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.find(x => x % 2 === 0);

        expect(result).toEqual(2);
    });

    test('predicate callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 === 0);
        const result = sequence.find(predicate);

        expect(predicate).toHaveBeenCalledTimes(2);
        expect(result).toEqual(2);
    })

    test('should bind predicate to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getDivisor: jest.fn(() => 2),
        }

        const result = sequence.find(function (this: typeof thisArg, x) { return x % this?.getDivisor() === 0 }, thisArg);

        expect(thisArg.getDivisor).toHaveBeenCalledTimes(2);
        expect(result).toEqual(2);
    })
    
    test('should return undefined if no item in the sequence passes the predicate', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.find(x => x > 3);

        expect(result).toBeUndefined();
    })

    test('should return mapped value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const result = mapped.find(x => x === 4);

        expect(result).toBe(4);
    })

    test('should only call mapper callback n+1 times given a value of n', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        mapped.find(x => x === 4);

        expect(mapper).toHaveBeenCalledTimes(2);
    })
});

describe('Sequence.findIndex', () => {
    test('should findIndex the first item in the sequence for which the predicate callback returns true', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.findIndex(x => x % 2 === 0);

        expect(index).toEqual(1);
    });

    test('predicate callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 === 0);
        const index = sequence.findIndex(predicate);

        expect(predicate).toHaveBeenCalledTimes(2);
        expect(index).toEqual(1);
    })

    test('should bind predicate to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getDivisor: jest.fn(() => 2),
        }

        const index = sequence.findIndex(function (this: typeof thisArg, x) { return x % this?.getDivisor() === 0 }, thisArg);

        expect(thisArg.getDivisor).toHaveBeenCalledTimes(2);
        expect(index).toEqual(1);
    })

    test('should return undefined if no item in the sequence passes the predicate', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.findIndex(x => x > 3);

        expect(index).toBe(-1);
    })

    test('should return index of mapped value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const index = mapped.findIndex(x => x === 4);

        expect(index).toBe(1);
    })

    test('should only call mapper callback n+1 times given a value of n', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        mapped.findIndex(x => x === 4);

        expect(mapper).toHaveBeenCalledTimes(2);
    })
});

describe('Sequence.findLast', () => {
    test('should findLast the first item in the sequence for which the predicate callback returns true', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.findLast(x => x % 2 !== 0);

        expect(result).toEqual(3);
    });

    test('predicate callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 !== 0);
        const result = sequence.findLast(predicate);

        expect(predicate).toHaveBeenCalledTimes(3);
        expect(result).toEqual(3);
    })

    test('should bind predicate to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getDivisor: jest.fn(() => 2),
        }

        const result = sequence.findLast(function (this: typeof thisArg, x) { return x % this?.getDivisor() !== 0 }, thisArg);

        expect(thisArg.getDivisor).toHaveBeenCalledTimes(3);
        expect(result).toEqual(3);
    })
    
    test('should return undefined if no item in the sequence passes the predicate', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.findLast(x => x > 3);

        expect(result).toBeUndefined();
    })

    test('should return mapped value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const result = mapped.findLast(x => x === 4);

        expect(result).toBe(4);
    })

    test('must call mapper function with all items in the sequence because it must be realized to be reversed.', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        mapped.findLast(x => x === 4);

        expect(mapper).toHaveBeenCalledTimes(3);
    })
});

describe('Sequence.findLastIndex', () => {
    test('should findLastIndex the first item in the sequence for which the predicate callback returns true', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.findLastIndex(x => x % 2 !== 0);

        expect(index).toEqual(2);
    });

    test('predicate callback should not be called until sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const predicate = jest.fn(x => x % 2 !== 0);
        const index = sequence.findLastIndex(predicate);

        expect(predicate).toHaveBeenCalledTimes(3);
        expect(index).toEqual(2);
    })

    test('should bind predicate to thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {
            getDivisor: jest.fn(() => 2),
        }

        const index = sequence.findLastIndex(function (this: typeof thisArg, x) { return x % this?.getDivisor() !== 0 }, thisArg);

        expect(thisArg.getDivisor).toHaveBeenCalledTimes(3);
        expect(index).toEqual(2);
    })

    test('should return undefined if no item in the sequence passes the predicate', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.findLastIndex(x => x > 3);

        expect(index).toBe(-1);
    })

    test('should return index of mapped value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4]);

        const mapped = sequence.map(x => x * 2);

        const index = mapped.findLastIndex(x => x === 4);

        expect(index).toBe(1);
    })

    test('must call mapper for all elements to ensure that last index is found', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => { 
            return x * 2;
        });
        const mapped = sequence.map(mapper);

        mapped.findLastIndex(x => x === 4);

        expect(mapper).toHaveBeenCalledTimes(3);
    })
});

describe('Sequencee.indexOf', () => {
    test('should return the index of the first item in the sequence that matches the given value', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.indexOf(2);

        expect(index).toBe(1);
    });

    test('should return -1 if the value is not in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.indexOf(4);

        expect(index).toBe(-1);
    });

    test('should return the index of the first value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const index = mapped.indexOf(4);

        expect(index).toBe(1);
    });

    test('should only call mapper callback n+1 times given a value of n', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        mapped.indexOf(4);

        expect(mapper).toHaveBeenCalledTimes(2);
    })

    test('should find the index of the first item in the sequence that matches the given value after a given index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.indexOf(2, 2);

        expect(index).toBe(3);
    });

    test('should return -1 if the value is not in the sequence after a given index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.indexOf(1, 2);

        expect(index).toBe(-1);
    });

    test('should return -1 if the index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.indexOf(1, 3);

        expect(index).toBe(-1);
    });

    test('should return the index of the first item in the sequence that matches the given value after a negative index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.indexOf(2, -2);

        expect(index).toBe(3);
    })

    test('should search whole sequence from start to end if the negative index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.indexOf(2, -5);

        expect(index).toBe(1);
    });

});

describe('Sequence.lastIndexOf', () => {
    test('should return the index of the last item in the sequence that matches the given value', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.lastIndexOf(2);

        expect(index).toBe(3);
    });

    test('should return -1 if the value is not in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.lastIndexOf(4);

        expect(index).toBe(-1);
    });

    test('should return the index of the last value of a mapped sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapped = sequence.map(x => x * 2);

        const index = mapped.lastIndexOf(4);

        expect(index).toBe(1);
    });    

    test('should find the index of the last item in the sequence that matches the given value before a given index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.lastIndexOf(2, 2);

        expect(index).toBe(1);
    });

    test('should return -1 if the value is not in the sequence before a given index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.lastIndexOf(3, 1);

        expect(index).toBe(-1);
    });

    test('should search whole sequence from start to end if the negative index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.lastIndexOf(1, 4);

        expect(index).toBe(0);
    });

    test('should return the index of the last item in the sequence that matches the given value after a negative index', () => {
        const sequence = Sequence.from([1, 2, 3, 2]);

        const index = sequence.lastIndexOf(2, -2);

        expect(index).toBe(1);
    })

    test('should return -1 if the negative index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const index = sequence.lastIndexOf(1, -4);

        expect(index).toBe(-1);
    });


});

describe('Sequence.toArray', () => {
    test('should return an array of the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = sequence.toArray();

        expect(array).toEqual([1, 2, 3]);
    });

    test('should return the same array if called multiple times', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = sequence.toArray();
        const array2 = sequence.toArray();

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });
});

describe('Sequence.toString', () => {
    test('should always return the same string', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const string = sequence.toString();

        expect(string).toBe('[...]');
    })
});

describe('Sequence.toLocaleString', () => {
    test('should always return the same string', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const string = sequence.toLocaleString();

        expect(string).toBe('[...]');
    
    })
});

describe('Sequence.forEach', () => {
    test('should call the callback for each item in the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const callback = jest.fn();

        sequence.forEach(callback);

        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenCalledWith(1, 0, sequence);
        expect(callback).toHaveBeenCalledWith(2, 1, sequence);
        expect(callback).toHaveBeenCalledWith(3, 2, sequence);
    });

    test('should call the callback with the thisArg if provided', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const thisArg = {};

        const callback = jest.fn(function (this: any, index: number) {
            expect(this).toBe(thisArg);
        });

        sequence.forEach(callback, thisArg);

        expect(callback).toHaveBeenCalledTimes(3);
    });

    test('should not call the callback until the sequence has been completed', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const callback = jest.fn();

        sequence.forEach(callback);

        expect(callback).toHaveBeenCalledTimes(3);
    });

    test('should call prior callbacks interleaved with forEach callbacks', () => {
        const sequence = Sequence.from([1, 2, 3]); 

        const mapper = jest.fn(x => x * 2);
        const mapped = sequence.map(mapper);

        const predicate = jest.fn(x => x < 4); // Does not shrink sequence to avoid index mismatches in test below.
        const filtered = mapped.filter(predicate);

        filtered.forEach((_, index) => {
            expect(mapper).toHaveBeenCalledTimes(index + 1);
            expect(predicate).toHaveBeenCalledTimes(index + 1);
        })
    });    
})

describe('Sequence.join', () => {
    test('should join the sequence into a string', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.join()

        expect(result).toBe('1,2,3');
    });

    test('should join the sequence into a string with a separator', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.join(' ')

        expect(result).toBe('1 2 3');
    });

    test('should call toString on all members', () => {
        const toString = jest.fn((x: number) => `[${x.toString()}]`);
        const items = [1, 2, 3].map(x => ({toString: function() :string { return toString(x); }, value: x }));
        const sequence = Sequence.from(items);this

        const result = sequence.join();
        expect(result).toBe('[1],[2],[3]');

        expect(toString).toHaveBeenCalledTimes(3);
        expect(toString).toHaveBeenCalledWith(1);
        expect(toString).toHaveBeenCalledWith(2);
        expect(toString).toHaveBeenCalledWith(3);
    })
});

describe('Sequence[Symbol.iterator]', () => {
    test('should return an iterator of the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should return the same iterator if called multiple times', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const array = Array.from(sequence);
        const array2 = Array.from(sequence);

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });
});

describe('Sequence.concat', () => {
    test('should return a new Sequence that is the concatenation of the two sequences', () => {
        const sequence1 = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([4, 5, 6]);

        const concatenated = sequence1.concat(sequence2);

        const array = Array.from(concatenated);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('should create full concatenated sequence more than once', () => {
        const sequence1 = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([4, 5, 6]);

        const concatenated = sequence1.concat(sequence2);

        const array = Array.from(concatenated);
        const array2 = Array.from(concatenated);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
        expect(array2).toEqual([1, 2, 3, 4, 5, 6]);
        expect(array).not.toBe(array2);
    });

    test('should not call the second sequence until the first is realized as an array', () => {
        const sequence1 = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([4, 5, 6]);

        const mapper = jest.fn(x => x);
        const concatenated = sequence1.concat(sequence2.map(mapper));

        expect(mapper).not.toHaveBeenCalled();

        Array.from(concatenated);

        expect(mapper).toHaveBeenCalledTimes(3);
    });

    test('should concatingate n sequences together in order', () => {
        const sequence1 = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([4, 5, 6]);
        const sequence3 = Sequence.from([7, 8, 9]);

        const concatenated = sequence1.concat(sequence2, sequence3);

        const array = Array.from(concatenated);

        expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    })

    test('should call the second sequence n times given n sequences', () => {
        const sequence1 = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([4, 5, 6]);
        const sequence3 = Sequence.from([7, 8, 9]);

        const mapper = jest.fn(x => x);
        const concatenated = sequence1.concat(sequence2.map(mapper), sequence3);

        Array.from(concatenated);

        expect(mapper).toHaveBeenCalledTimes(3);
    });

    test('should concatinate a single item to the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const concatenated = sequence.concat(4);

        const array = Array.from(concatenated);

        expect(array).toEqual([1, 2, 3, 4]);
    });

    test('should concatinate single items with other sequences', () => {
        const sequence = Sequence.from([1, 2, 3]);
        const sequence2 = Sequence.from([7, 8, 9]);

        const concatenated = sequence.concat(4, [5, 6], sequence2);

        const array = Array.from(concatenated);

        expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    })
})

describe('Sequence.toReversed', () => {
    test('should return a new Sequence that is the reverse of the original sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const reversed = sequence.toReversed();

        const array = Array.from(reversed);

        expect(array).toEqual([3, 2, 1]);
    });

    test('should create full reversed sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const reversed = sequence.toReversed();

        const array = Array.from(reversed);
        const array2 = Array.from(reversed);

        expect(array).toEqual([3, 2, 1]);
        expect(array2).toEqual([3, 2, 1]);
        expect(array).not.toBe(array2);
    });

    test('should not call the mapper callback until the sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x);
        const mapped = sequence.map(mapper);
        const reversed = mapped.toReversed();

        expect(mapper).not.toHaveBeenCalled();

        const array = Array.from(reversed);

        expect(mapper).toHaveBeenCalledTimes(3);

        expect(array).toEqual([3, 2, 1]);
    });
});

describe('Sequence.toSorted', () => {
    test('should sort by string value by default', () => {
        const sequence = Sequence.from([3, 2, 1, 11]);

        const sorted = sequence.toSorted();

        const array = Array.from(sorted);

        expect(array).toEqual([1, 11, 2, 3]);
    });

    test('should return a new Sequence that is sorted according to the given comparator', () => {
        const sequence = Sequence.from([3, 2, 1]);

        const sorted = sequence.toSorted((a, b) => a - b);

        const array = Array.from(sorted);

        expect(array).toEqual([1, 2, 3]);
    });
    
    test('should create full sorted sequence more than once', () => {
        const sequence = Sequence.from([3, 2, 1]);

        const sorted = sequence.toSorted((a, b) => a - b);

        const array = Array.from(sorted);
        const array2 = Array.from(sorted);

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });
});

describe('Sequence.toSpliced', () => {
    test('should return a new Sequence with the given range of values spliced in', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(2, 0, 6, 7, 8);

        const array = Array.from(spliced);

        expect(array).toEqual([1, 2, 6, 7, 8, 3, 4, 5]);
    });

    test('should create full spliced sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(2, 0, 6, 7, 8);

        const array = Array.from(spliced);
        const array2 = Array.from(spliced);

        expect(array).toEqual([1, 2, 6, 7, 8, 3, 4, 5]);
        expect(array2).toEqual([1, 2, 6, 7, 8, 3, 4, 5]);
        expect(array).not.toBe(array2);
    });

    test('should not mutate the original sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        sequence.toSpliced(2, 0, 6, 7, 8);

        const array = Array.from(sequence);

        expect(array).toEqual([1, 2, 3, 4, 5]);
    });

    test('should delete all elements after the start index if deleteCount is not provided', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(2);

        const array = Array.from(spliced);

        expect(array).toEqual([1, 2]);
    });

    test('should delete all elements after the start index if deleteCount is Infinity', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(2, Infinity, 7, 8, 9);

        const array = Array.from(spliced);

        expect(array).toEqual([1, 2, 7, 8, 9]);
    });

    test('should delete all elements after the start index if deleteCount is greater than the number of elements', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(2, 10, 7, 8, 9);

        const array = Array.from(spliced);

        expect(array).toEqual([1, 2, 7, 8, 9]);
    });

    test('should delete all elements after the start index relative to the end of the sequence if start is negative', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(-2, 1, 6, 7, 8);

        const array = Array.from(spliced);

        expect(array).toEqual([1, 2, 3, 6, 7, 8, 5]);
    });

    test('should start at 0 if start is negative and less than negative length of sequence', () => {
        const sequence = Sequence.from([1, 2, 3, 4, 5]);

        const spliced = sequence.toSpliced(-10, 1, 6, 7, 8);

        const array = Array.from(spliced);

        expect(array).toEqual([6, 7, 8, 2, 3, 4, 5]);
    });
    
});

describe('Sequence.entries', () => {
    test('should return a new Sequence of [index, value] pairs', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const entries = sequence.entries();

        const array = Array.from(entries);

        expect(array).toEqual([[0, 1], [1, 2], [2, 3]]);
    });

    test('should create full entries sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const entries = sequence.entries();

        const array = Array.from(entries);
        const array2 = Array.from(entries);

        expect(array).toEqual([[0, 1], [1, 2], [2, 3]]);
        expect(array2).toEqual([[0, 1], [1, 2], [2, 3]]);
        expect(array).not.toBe(array2);
        expect(array[0]).not.toBe(array2[0]);
        expect(array[1]).not.toBe(array2[1]);
        expect(array[2]).not.toBe(array2[2]);
    });

    test('should not call the mapper callback until the sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn((value) => value + 1);
        const mapped = sequence.map(mapper);
        const entries = mapped.entries();

        expect(mapper).not.toHaveBeenCalled();

        const array = Array.from(entries);

        expect(mapper).toHaveBeenCalledTimes(3);

        expect(array).toEqual([[0, 2], [1, 3], [2, 4]]);
    });
});

describe('Sequence.keys', () => {
    test('should return a new Sequence of the keys of the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const keys = sequence.keys();

        const array = Array.from(keys);

        expect(array).toEqual([0, 1, 2]);
    });

    test('should create full keys sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const keys = sequence.keys();

        const array = Array.from(keys);
        const array2 = Array.from(keys);

        expect(array).toEqual([0, 1, 2]);
        expect(array2).toEqual([0, 1, 2]);
        expect(array).not.toBe(array2);
    });

    test('should not call the mapper callback until the sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn((value) => value + 1);
        const mapped = sequence.map(mapper);
        const keys = mapped.keys();

        expect(mapper).not.toHaveBeenCalled();

        const array = Array.from(keys);

        expect(mapper).toHaveBeenCalledTimes(3);

        expect(array).toEqual([0, 1, 2]);
    });
});

describe('Sequence.values', () => {
    test('should return a new Sequence of the values of the sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const values = sequence.values();

        const array = Array.from(values);

        expect(array).toEqual([1, 2, 3]);
    });

    test('should return a sequence that is different from the original sequence', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const values = sequence.values();

        const array = Array.from(values);

        expect(array).toEqual([1, 2, 3]);
        expect(values).not.toBe(sequence);
    });

    test('should create full values sequence more than once', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const values = sequence.values();

        const array = Array.from(values);
        const array2 = Array.from(values);

        expect(array).toEqual([1, 2, 3]);
        expect(array2).toEqual([1, 2, 3]);
        expect(array).not.toBe(array2);
    });

    test('should not call the mapper callback until the sequence is realized as an array', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn((value) => value + 1);
        const mapped = sequence.map(mapper);
        const values = mapped.values();

        expect(mapper).not.toHaveBeenCalled();

        const array = Array.from(values);

        expect(mapper).toHaveBeenCalledTimes(3);

        expect(array).toEqual([2, 3, 4]);
    });
});


describe('Sequence.flat', () => {
    test('should return a flattenned version of the sequence', () => {
        const sequence = Sequence.from([[1, 2], [3, 4], [5, 6]]);

        const flat = sequence.flat();

        const array = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    })

    test('should return a flattenned version of a sequence of arrays mixed with non-array items', () => {
        const sequence = Sequence.from([[1, 2], 3, [4, 5], 6]);

        const flat = sequence.flat();

        const array = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    })

    test('should flatten nested arrays one level deep by default', () =>{
        const sequence = Sequence.from([1, 2, [3, 4, [5, 6]]]);

        const flat = sequence.flat();

        const array = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, [5, 6]]);
    })

    test('should flatten nested arrays to the specified depth', () =>{
        const sequence = Sequence.from([1, 2, [3, 4, [5, 6]]]);

        const flat = sequence.flat(2);

        const array = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
    })

    test('should accept Infinity to flatten all levels', () => {
        const sequence = Sequence.from([1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]]);

        const flat = sequence.flat(Infinity);

        const array = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    })

    test('should create full flat sequence more than once', () => {
        const sequence = Sequence.from([[1, 2], [3, 4], [5, 6]]);

        const flat = sequence.flat();

        const array = Array.from(flat);
        const array2 = Array.from(flat);

        expect(array).toEqual([1, 2, 3, 4, 5, 6]);
        expect(array2).toEqual([1, 2, 3, 4, 5, 6]);
        expect(array).not.toBe(array2);
    });

    test('should not call the mapper callback until the sequence is realized as an array', () => {
        const sequence = Sequence.from([[1, 2], [3, 4], [5, 6]]);

        const mapper = jest.fn((value) => [...value, value[0] + value[1]]);
        const mapped = sequence.map(mapper);
        const flat = mapped.flat();

        expect(mapper).not.toHaveBeenCalled();

        const array = Array.from(flat);

        expect(mapper).toHaveBeenCalled();

        expect(array).toEqual([1, 2, 3, 3, 4, 7, 5, 6, 11]);
    });
});

describe('Sequence.every', () => {
    test('should return true if all elements in the sequence pass the predicate', () => {
        const sequence = Sequence.from([2, 4, 6]);

        const result = sequence.every(x => x % 2 === 0);

        expect(result).toBe(true);
    });

    test('should return false if any element in the sequence fails the predicate', () => {
        const sequence = Sequence.from([2, 4, 5]);

        const result = sequence.every(x => x % 2 === 0);

        expect(result).toBe(false);
    });

    test('should invoke prior callbacks only until false is found', () => {
        const sequence = Sequence.from([2, 4, 5]);

        const mapper = jest.fn(x => x);
        const mapped = sequence.map(mapper);

        const predicate = jest.fn(x => x != 2);
        const result = mapped.every(predicate);

        expect(result).toBe(false);
        expect(predicate).toHaveBeenCalledTimes(1);
        expect(mapper).toHaveBeenCalledTimes(1);
    });

    test('should return true for an empty sequence', () => {
        const sequence = Sequence.from([]);

        const result = sequence.every(x => x % 2 === 0);

        expect(result).toBe(true);
    });
});

describe('Sequence.some', () => {
    test('should return true if any element in the sequence passes the predicate', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.some(x => x % 2 === 0);

        expect(result).toBe(true);
    });

    test('should return false if all elements in the sequence fail the predicate', () => {
        const sequence = Sequence.from([1, 3, 5]);

        const result = sequence.some(x => x % 2 === 0);

        expect(result).toBe(false);
    });

    test('should invoke prior callbacks only until true is found', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x);
        const mapped = sequence.map(mapper);

        const predicate = jest.fn(x => x === 2);
        const result = mapped.some(predicate);

        expect(result).toBe(true);
        expect(predicate).toHaveBeenCalledTimes(2);
        expect(mapper).toHaveBeenCalledTimes(2);
    });

    test('should return false for an empty sequence', () => {
        const sequence = Sequence.from([]);

        const result = sequence.some(x => x % 2 === 0);

        expect(result).toBe(false);
    });
});

describe('Sequence.include', () => {
    test('should return true if the sequence includes the value', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(2);

        expect(result).toBe(true);
    });

    test('should return false if the sequence does not include the value', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(4);

        expect(result).toBe(false);
    });

    test('should return true if the sequence includes the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(2, 1);

        expect(result).toBe(true);
    });

    test('should return false if the sequence does not include the value at the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(1, 1);

        expect(result).toBe(false);
    });

    test('should return false if the index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(3, 3);

        expect(result).toBe(false);
    });

    test('should return true if the sequence includes the value after the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(3, 1);

        expect(result).toBe(true);
    });

    test('should return false if the sequence does not include the value after the given index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(1, 1);

        expect(result).toBe(false);
    });

    test('should call prior callbacks only until value is found', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const mapper = jest.fn(x => x);
        const mapped = sequence.map(mapper);

        const predicate = jest.fn(x => x < 4); // Does not shrink sequence to avoid index mismatches in test below.
        const filtered = mapped.filter(predicate);

        const result = filtered.includes(2);

        expect(result).toBe(true);
        expect(predicate).toHaveBeenCalledTimes(2);
        expect(mapper).toHaveBeenCalledTimes(2);
    });

    test('should return true if the sequence includes the value after a negative index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(2, -2);

        expect(result).toBe(true);
    });

    test('should return false if the sequence does not include the value after a negative index', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(1, -2);

        expect(result).toBe(false);
    });

    test('should search whole sequence from start to end if the negative index is out of range', () => {
        const sequence = Sequence.from([1, 2, 3]);

        const result = sequence.includes(1, -4);

        expect(result).toBe(true);
    });
});