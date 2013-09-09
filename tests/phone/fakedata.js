var Faker = require('Faker');

var accounts = [
    { name:"Personal mail", id: "personal", type:"GMail" }
]

var people = [];

for(var i=0; i<30; i++) {
    people.push({
        id: Faker.Helpers.randomNumber(1000),
        first: Faker.Name.firstName(),
        last: Faker.Name.lastName(),
        streetAddress: Faker.Address.streetAddress(),
        city: Faker.Address.city(),
        state: Faker.Address.usState(),
        zip: Faker.Address.zipCode(),
        phones: [
            { type: "mobile", number: Faker.PhoneNumber.phoneNumber() },
        ],
        email: [
            Faker.Internet.email(),
            Faker.Internet.email(),
        ],
        social: [
            { type: "twitter", username: Faker.Internet.userName() },
            { type: "googleplus", username: Faker.Internet.userName() },
        ],
        provider: "personal" //matches id from accounts
    });
}



var music = {
    artists:[],
    songs:[],
    albums:[],
}

for(var i=0; i<10; i++) {
    var artist = {
        name: Faker.Name.findName(),
        id: Faker.Helpers.randomNumber(1000),
    };
    music.artists.push(artist);
}
for(var i=0; i<50; i++) {
    music.songs.push({
        title: Faker.Lorem.words(4).join(" "),
        length: Faker.Helpers.randomNumber(3*60)+2*60,
        id: Faker.Helpers.randomNumber(1000),
        artist: Faker.random.array_element(music.artists).id,
    });
}
for(var i=0; i<30; i++) {
    var songs = [];
    for(var j=0; j<10; j++) {
        songs.push(Faker.random.array_element(music.songs).id);
    }
    music.albums.push({
        title: Faker.Lorem.words(2).join(" "),
        songs: songs,
    });
}


//console.log(Faker.Helpers.createCard());


//podcasts;
//emails

var emails = [];
for(var i=0; i<30; i++) {
    emails.push({
        folder:'inbox',
        from: Faker.Internet.email(),
        subject: Faker.Lorem.sentence(),
        body:Faker.Lorem.paragraphs(3),
    });
}


var photos = [];
var testphotos = ["test/photos/photo1.jpg","test/photos/photo1.jpg","test/photos/photo1.jpg"];
for(var i=0; i<100; i++) {
    photos.push({
        path: Faker.Helpers.randomize(testphotos),
        width: 150,
        height: 150,
    });
}

var events = [];
for(var i=0; i<3; i++) {
    events.push({
        datetime: {
            year: 2013,
            month: 9,
            day: 30,
            hour: Faker.Helpers.randomNumber(24),
            minute: Faker.Helpers.randomNumber(60),
        },
        location: {
            title: Faker.Lorem.words(2).join(" "),
            lat: Faker.Address.latitude(),
            lon: Faker.Address.longitude(),
        },
        title: Faker.Lorem.words(3).join(" "),
        attendees: [
            Faker.Helpers.randomize(people).id,
            Faker.Helpers.randomize(people).id,
            Faker.Helpers.randomize(people).id,
        ],
    });
}

var newssources = [];

for(var i=0; i<10; i++) {
    var domain = Faker.Internet.domainName();
    newssources.push({
        title: "News of " + domain,
        feed: "http://"+domain+"/feed.xml",
        id: Faker.Helpers.randomNumber(1000),
        domain:domain,
    });
}

var newsitems = [];
for(var i=0; i<20; i++) {
    var feed = Faker.Helpers.randomize(newssources);
    newsitems.push({
        title: Faker.Lorem.words(3).join(" "),
        feed: feed.id,
        link: "http://"+feed.domain+"/news/item",
        summary: Faker.Lorem.paragraphs(3),
        read: (Faker.Helpers.randomNumber(100) < 20), //only 20% will be marked as read
        archived: (Faker.Helpers.randomNumber(100) < 40), //40% are archived
    });
}


var longreads = [];
for(var i=0; i<20; i++) {
    longreads.push(Faker.Helpers.randomize(newsitems));
}


var data = {
    accounts: accounts,
    photos: photos,
    events: events,
    newssources: newssources,
    newsitems: newsitems,
    longreads: longreads,
}


exports.people = people;
exports.music = music;
exports.emails = emails;
exports.events = events;
