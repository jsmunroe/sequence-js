type FlatSequence<TItem, Depth extends number> = {
    done: Sequence<TItem>;
    recur: TItem extends Sequence<infer InnerItem> ? FlatSequence<InnerItem, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
        : Sequence<TItem>;
}[Depth extends -1 ? "done" : "recur"];

export default class Sequence<TItem = any> {
    private constructor(readonly generator: () => Generator<TItem>) { }

    [Symbol.iterator](): Iterator<TItem> {
        return this.getIterator();
    }

    count(): number {
        let count = 0;
        for (const _ of this) {
            count++;
        }

        return count;
    }

    fill(value: TItem, start?: number, end?: number): Sequence<TItem> {
        return new Sequence<TItem>(() => fillGenerator(this, value, start, end));
    }

    map<TResult, TThis = undefined>(mapper: (item: TItem, index: number, sequence: Sequence<TItem>) => TResult, thisArg?: TThis): Sequence<TResult> {
        return new Sequence<TResult>(() => mapGenerator(this, mapper, thisArg));
    }

    flatMap<TResult, TThis = undefined>(mapper: (item: TItem, index: number, sequence: Sequence<TItem>) => TResult, thisArg?: TThis): Sequence<TResult> {
        return new Sequence<TResult>(() => flatMapGenerator(this, mapper, thisArg));
    }

    filter<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): Sequence<TItem> {
        return new Sequence<TItem>(() => filterGenerator(this, predicate, thisArg));
    }

    reduce<TAccumulator>(reducer: (accumulator: TAccumulator, item: TItem, index: number, sequence: Sequence<TItem>) => TAccumulator, initialValue: TAccumulator): TAccumulator {
        let accumulator = initialValue;
        let index = 0;
        for (const item of this) {
            accumulator = reducer(accumulator, item, index++, this);
        }

        return accumulator;
    }

    reduceRight<TAccumulator>(reducer: (accumulator: TAccumulator, item: TItem, index: number, sequence: Sequence<TItem>) => TAccumulator, initialValue: TAccumulator): TAccumulator {
        let accumulator = initialValue;
        let index = this.count() - 1;
        for (const item of this.toReversed()) {
            accumulator = reducer(accumulator, item, index--, this);
        }

        return accumulator;
    }

    at(index: number): TItem | undefined {
        for (const item of this) {
            if (index-- === 0) {
                return item;
            }
        }

        return undefined;
    }

    find(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean): TItem | undefined;
    find<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): TItem | undefined;
    find<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): TItem | undefined {
        const [, item] = this.findEntry(predicate, thisArg);

        return item;
    }

    findIndex(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean): number;
    findIndex<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): number;
    findIndex<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): number {
        const [index] = this.findEntry(predicate, thisArg);

        return index;
    }

    findLast(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean): TItem | undefined;
    findLast<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): TItem | undefined;
    findLast<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): TItem | undefined {
        const [, item] = this.findLastEntry(predicate, thisArg);

        return item;
    }

    findLastIndex(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean): number;
    findLastIndex<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): number;
    findLastIndex<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): number {
        const [index] = this.findLastEntry(predicate, thisArg);

        return index;
    }

    indexOf(searchElement: TItem): number;
    indexOf(searchElement: TItem, fromIndex: number): number;
    indexOf(searchElement: TItem, fromIndex?: number): number {
        if (fromIndex && fromIndex < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();
            if (fromIndex < -length) {
                fromIndex = 0;
            }
            else {
                fromIndex += length;
            }
        }

        let index = 0;
        for (const item of this) {
            if (fromIndex && index < fromIndex) {
                index++
                continue;
            }

            if ((!fromIndex || index >= fromIndex) && item === searchElement) {
                return index;
            }

            index++
        }

        return -1;
    }

    lastIndexOf(searchElement: TItem): number;
    lastIndexOf(searchElement: TItem, fromIndex: number): number;
    lastIndexOf(searchElement: TItem, fromIndex?: number): number {
        if (fromIndex && fromIndex < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();
            if (fromIndex < -length) {
                return -1;
            }
            else {
                fromIndex += length;
            }
        }

        let index = 0;
        let foundIndex = -1;
        for (const item of this) {
            if (fromIndex && index > fromIndex) {
                index++
                continue;
            }

            if (item === searchElement) {
                foundIndex = index;
            }

            index++
        }

        return foundIndex;
    }

    entries(): Iterable<[number, TItem]> {
        return entriesGenerator(this);
    }

    keys(): Iterable<number> {
        return keysGenerator(this);
    }

    values(): Iterable<TItem> {
        return valuesGenerator(this);
    }

    concat(...others: (Iterable<TItem> | TItem)[]): Sequence<TItem> {
        return new Sequence<TItem>(() => concatGenerator(this, others));
    }

    toReversed(): Sequence<TItem> {
        return new Sequence<TItem>(() => reversedGenerator(this));
    }

    toSorted(): Sequence<TItem>;
    toSorted(compare: (a: TItem, b: TItem) => number): Sequence<TItem>;
    toSorted(compare?: (a: TItem, b: TItem) => number): Sequence<TItem> {
        return new Sequence<TItem>(() => toSortedGenerator(this, compare));
    }

    toSpliced(start: number, deleteCount: number = Infinity, ...items: TItem[]): Sequence<TItem> { 
        if (start < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();
            if (start < -length) {
                start = 0;
            }
            else {
                start += length;
            }
        }

        return new Sequence<TItem>(() => toSplicedGenerator(this, start, deleteCount, items));
    }

    flat(): FlatSequence<TItem, -1>;
    flat<D extends number = -1>(depth: number): FlatSequence<TItem, D>;
    flat<D extends number = -1>(depth: number = 1): FlatSequence<TItem, D> {
        return new Sequence<TItem>(() => flatGenerator(this, depth)) as FlatSequence<TItem, D>;
    }

    push(...items: TItem[]): Sequence<TItem> {
        return new Sequence<TItem>(() => pushGenerator(this, ...items));
    }
    
    unshift(...items: TItem[]): Sequence<TItem> {
        return new Sequence<TItem>(() => unshiftGenerator(this, ...items));
    }

    slice(): Sequence<TItem>;
    slice(start: number): Sequence<TItem>;
    slice(start: number, end: number): Sequence<TItem>;
    slice(start: number = 0, end: number = Infinity): Sequence<TItem> {
        if (start < 0 || end < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();

            if (start && start < 0) {
                if (start < -length) { 
                    start = 0;
                }
                else {
                    start += length;
                }
            }
            if (end && end < 0) {
                if (end < -length) {
                    end = 0;
                }
                else {
                    end += length;
                }
            }
        }

        if (start > end) {
            return Sequence.empty<TItem>();
        }

        return new Sequence<TItem>(() => sliceGenerator(this, start, end));
    }

    with(index: number, item: TItem): Sequence<TItem> {
        if (index < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();
            index += length;

            if (index < 0 || index >= length) {
                throw new RangeError(`Invalid index : ${index - length}`);
            }
        }

        return new Sequence<TItem>(() => withGenerator(this, index, item));
    }

    every(predicate: (item: TItem) => boolean): boolean {
        for (const item of this) {
            if (!predicate(item)) {
                return false;
            }
        }

        return true;
    }

    some(predicate: (item: TItem) => boolean): boolean {
        for (const item of this) {
            if (predicate(item)) {
                return true;
            }
        }

        return false;
    }

    includes(searchElement: TItem, fromIndex?: number): boolean {
        if (fromIndex && fromIndex < 0) {
            // In order to support negative indices, we need to know the length of the sequence.
            const length = this.count();
            if (fromIndex < -length) {
                fromIndex = 0;
            }
            else {
                fromIndex += length;
            }
        }

        let index = 0;
        for (const item of this) {
            if (fromIndex && index++ < fromIndex) {
                continue;
            }

            if (item === searchElement) {
                return true;
            }
        }

        return false;
    }

    toArray(): TItem[] {
        const array =  Array.from(this);

        return array;
    }

    toString(): string {
        return "[...]"; // The data items are not known, without iterating the generator entirely.
    }

    toLocaleString(): string {
        return this.toString(); // The data items are not known, without iterating the generator entirely.
    }

    forEach<TThis = undefined>(callback: (item: TItem, index: number, sequence: Sequence<TItem>) => void, thisArg?: TThis): void {
        let index = 0;
        for (const item of this) {
            thisArg ? callback.call(thisArg, item, index++, this) : callback(item, index++, this);
        }
    }

    join(separator: string = ','): string {
        // Since the sequence will be realized entirely anyway,
        // we can just use the built-in Array.join method.
        return Array.from(this).join(separator);
    }

    static from<TItem, TResult, TThis>(items: ArrayLike<TItem>): Sequence<TItem>;
    static from<TItem, TResult, TThis>(items: ArrayLike<TItem>, mapper: (item: TItem, index: number) => TResult, thisArg?: TThis): Sequence<TResult>;
    static from<TItem, TResult, TThis>(items: ArrayLike<TItem>, mapper?: (item: TItem, index: number) => TResult, thisArg?: TThis): Sequence<TResult | TItem> {
        return new Sequence(() => fromGeneratator(items, mapper, thisArg));
    }

    static of<TItem>(...items: TItem[]): Sequence<TItem> {
        return new Sequence(() => fromGeneratator(items));
    }

    static isSequence<TItem = any>(value: any): value is Sequence<TItem> {
        return value instanceof Sequence;
    }

    static empty<TItem = any>(): Sequence<TItem> {
        return new Sequence(() => emptyGenerator());
    }

    private findEntry<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): [number, TItem | undefined] {
        let index = 0;
        for (const item of this) {
            if (thisArg ? predicate.call(thisArg, item, index, this) : predicate(item, index, this)) {
                return [index, item];
            }

            index++;
        }

        return [-1, undefined];
    }

    private findLastEntry<TThis = undefined>(predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis): [number, TItem | undefined] {
        let index = 0;
        let foundIndex = -1;
        let foundItem: TItem | undefined;
        for (const item of this) {
            if (thisArg ? predicate.call(thisArg, item, index, this) : predicate(item, index, this)) {
                foundIndex = index;
                foundItem = item;
            }

            index++;
        }

        return [foundIndex, foundItem];   
    }

    private getIterator(): Iterator<TItem> {
        return this.generator();
    }
}

function* fromGeneratator<TItem, TResult, TThis>(items: ArrayLike<TItem>, mapper?: (item: TItem, index: number) => TResult, thisArg?: TThis) {
    let index = 0;
    if (isIterable(items)) {
        for (const item of items as Iterable<TItem>) {
            yield mapper ? thisArg ? mapper.call(thisArg, item, index++) : mapper(item, index++) : item;
        }
    }
    else {
        for (let i = 0; i < items.length; i++) {
            yield mapper ? thisArg ? mapper.call(thisArg, items[i], index++) : mapper(items[i], index++) : items[i];
        }
    }
}

function* emptyGenerator<TItem>() {
    // No items to yield.
}

function* fillGenerator<TItem>(sequence: Sequence<TItem>, value: TItem, start?: number, end?: number) {
    if ((start && start < 0) && (end && end < 0)) {
        // In order to support negative indices, we need to know the length of the sequence.
        const length = sequence.count();

        if (start && start < 0) {
            start += length;
        }
        if (end && end < 0) {
            end += length;
        }
    }

    let index = 0;
    for (const item of sequence) {
        if ((!start || index >= start) && (!end || index < end)) {
            yield value;
        } else {
            yield item;
        }

        index++;
    }
}

function* mapGenerator<TItem, TResult, TThis>(sequence: Sequence<TItem>, mapper: (item: TItem, index: number, sequence: Sequence<TItem>) => TResult, thisArg?: TThis) {
    let index = 0;
    for (const item of sequence) {
        yield thisArg ? mapper.call(thisArg, item, index++, sequence) : mapper(item, index++, sequence);
    }
}

function* flatMapGenerator<TItem, TResult, TThis>(sequence: Sequence<TItem>, mapper: (item: TItem, index: number, sequence: Sequence<TItem>) => TResult, thisArg?: TThis): Generator<TResult> {
    let index = 0;
    let depth = 1;
    for (const item of sequence) {
        const result = thisArg ? mapper.call(thisArg, item, index++, sequence) : mapper(item, index++, sequence);

        if (isIterable(result) && depth > 0) {
            yield* flatGenerator(result, depth - 1);
        } else {
            yield result;
        }
    }
}

function* filterGenerator<TItem, TThis>(sequence: Sequence<TItem>, predicate: (item: TItem, index: number, sequence: Sequence<TItem>) => boolean, thisArg?: TThis)  {
    let index = 0;
    for (const item of sequence) {
        if (thisArg ? predicate.call(thisArg, item, index++, sequence) : predicate(item, index++, sequence)) {
            yield item;
        }
    }
}

function* entriesGenerator<TItem>(sequence: Sequence<TItem>): Generator<[number, TItem]> {
    let index = 0;
    for (const item of sequence) {
        yield [index++, item];
    }
}

function* keysGenerator<TItem>(sequence: Sequence<TItem>) {
    let index = 0;
    for (const _ of sequence) {
        yield index++;
    }
}

function* valuesGenerator<TItem>(sequence: Sequence<TItem>) {
    yield* sequence;
}

function* concatGenerator<TItem>(sequence: Sequence<TItem>, others: (Iterable<TItem> | TItem)[]) {
    yield* sequence;
    for (const other of others) {
        if (isIterable(other)) {
            yield* other;
        } else {
            yield other;
        }
    }
}

function* reversedGenerator<TItem>(sequence: Sequence<TItem>) {
    const items = Array.from(sequence);

    for (let i = items.length - 1; i >= 0; i--) {
        yield items[i];
    }
}



function* flatGenerator<TItem>(sequence: Iterable<TItem>, depth: number): Generator<any> {
    let index = 0;
    for (const item of sequence) {
        if (isIterable(item) && depth > 0) {
            yield* flatGenerator(item, depth - 1);
        } else {
            yield item;
        }
    }
}

function* pushGenerator<TItem>(sequence: Sequence<TItem>, ...items: TItem[]) {
    yield* sequence;
    yield* items;
}

function* unshiftGenerator<TItem>(sequence: Sequence<TItem>, ...items: TItem[]) {
    yield* items;
    yield* sequence;
}

function* sliceGenerator<TItem>(sequence: Sequence<TItem>, start: number, end: number) {
    let index = 0;
    for (const item of sequence) {
        if (index >= start && index < end) {
            yield item;
        }

        index++;
    }
}

function* withGenerator<TItem>(sequence: Sequence<TItem>, index: number, item: TItem) {
    let currentIndex = 0;
    let isItemPlaced = false;
    for (const currentItem of sequence) {
        if (currentIndex++ === index) {
            isItemPlaced = true; 
            yield item;
        }
        else {
            yield currentItem;
        }
    }

    if (!isItemPlaced) {
        throw new RangeError(`Invalid index : ${index}`);
    }
}

function* toSortedGenerator<TItem>(sequence: Sequence<TItem>, comparer?: (a: TItem, b: TItem) => number) {
    const items = Array.from(sequence).sort(comparer);

    for (const item of items) {
        yield item;
    }
}

function* toSplicedGenerator<TItem>(sequence: Sequence<TItem>, start: number, deleteCount: number, items: TItem[]) {
    let index = 0;
    for (const item of sequence) {
        if (index < start) {
            yield item;
        } 
        
        if (index === start) {
            yield* items;
        }

        if (index >= start + deleteCount) {
            yield item;
        }

        index++;
    }

}

function isIterable<TItem>(value: any): value is Iterable<TItem> {
    return value && typeof value[Symbol.iterator] === 'function';
}