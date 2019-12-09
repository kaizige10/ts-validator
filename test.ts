




class Test {
    @annotation
    name1

    @annotation
    static name2
}

function annotation(target, property) {
    console.log(target);
    console.log(property);
    // console.log(descriptor);
}