var person = {
    first: "Jimmy",
    last: "Fallon",
    get fullName() {
        return this.first + ' ' + this.last;
    },
}
console.log(person.fullName);
person.last = 'Walker';
console.log(person.fullName);
