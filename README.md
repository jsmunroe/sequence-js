# SequentialJS

A `Sequence` is like an `Array` but for a sequential list. A `Sequence` is an `Iterator`, yes, but it is more than that. It utilizes something called defferred execution. This is a technology that avoids expensive operations on a sequence until its items are evaluated. 

Consider the following example.

```JavaScript
const sequence = new Sequence(enormousList);
const mappedSequence = sequence.map(expensiveMapper);
const filteredSequence = sequence.filter(convolutedPredicate);

// At this point none of these callback are called.
const fifthItem = filteredSequence.at(4);
```

When `fifthItem` is retrieved, `expensiveMapper` and `convolutedPredicate` are each only called 5 times, the number of iterations until the sequence gets to the 5th element. 

What is more, each step is invoked for each element in tern. 

* The 0th element is retrieved from the `enormousList`.
* `expensiveMapper` is called on the 0th element.
* `convolutedPredicate` is called on the 0th element.
* The 1st element is retrieved from the `enormousList`.
* `expensiveMapper` is called on the 0th element.
* `convolutedPredicate` is called on the 0th element.
<br/>...
* The 4th element is retrieved from the `enormousList`.
* `expesniveMapper` is called on the 4th element.
* `convolutedPredicate` is called on the 4th element.
* The 4th element is returned.


## Uses Most of the Array Interface

`Sequence` uses most of the same method of the `Array` type with the same signature. 

The methods `push` and `unshift` are changed to do return the mutated sequence instead of mutating the sequece itself.

```JavaScript
const newSequence = sequence.push(5);
```

The benefit of this is that the sequence does not need to be realized in order to push the value 5 onto the end of it.

The methods `pop` and `shift` are left out because they do not fit this pattern. The return an element and so cannot return a mutated sequence. 

A workaround for this is as follows:

```JavaScript
const poppedValue = sequence.toArray().pop();
```

Since the sequence is converted into an array it is completely sequenced into memory. 

Other methods that mutate the state of the array are left out as well. These are `reverse`, `sort`, and `splice`. You can use the methods `toReversed`, `toSorted`, and `toSpliced` instead as they fit the returned mutation pattern.

The reversed methods `findLast`, `findLastIndex`, and `lastIndexOf` must iterate the sequence from beginning to end and hang on to the last matching element. Because of this, it is probably faster to convert the sequence to an array and call these methods on that.
