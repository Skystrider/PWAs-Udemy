var deferredInstallPrompt = null;

if(!window.Promise) {
    window.Promise = Promise;
}

if('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function() {
            console.log('Service worker registered');
        }).catch(function(err) {
            console.log(err);
        });
}

window.addEventListener('beforeinstallprompt', function(event) {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredInstallPrompt = event;
    return false;
});

// setTimeout(function() {
//     console.log('after timer is done');
// }, 3000);

// console.log('Executed right after setTimeout');

var promise = new Promise(function(resolve, reject) {
    setTimeout(function() {
        // resolve('after time is done');
        reject({code:500, message: 'some error'});
        // console.log('after timer is done');
    }, 12000);
});

fetch('https://httpbin.org/ip')
    .then(function(response) {
        // console.log(response);
        return response.json();
    })
    .then(function(data) {
        console.log(data);
    })
    .catch(function(err) {
        console.log(err);
    });

    fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // mode: 'cors',//default
        // mode: 'no-cors',// useful to cache things like images that we cannot access the data here, but we can still cache the response so the page can display the image while offline
        body: JSON.stringify({message: 'Does this work?'})
    })
    .then(function(response) {
        console.log('Response1: ');
        // console.log(response);
        return response.json();
    })
    .then(function(data) {
        console.log('Response2: ');
        console.log(data);
    })
    .catch(function(err) {
        console.log('ERROR: ');
        console.log(err);
    });

// promise.then(function(text) {
//     return text;
// }).then(function(newText) {
//     console.log(newText);
// }, function(err) {
//     console.log(err);
// });
promise.then(function(text) {
    return text;
}).then(function(newText) {
    console.log(newText);
})
.catch(function(err) {
    console.log(err);
});

console.log('Executed right after setTimeout');