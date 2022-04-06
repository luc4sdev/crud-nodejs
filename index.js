const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const axios = require('axios');


let requestTime = function (req, res, next) {
    req.requestTime = new Date;
    next();
};

app.use(express.json());
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(__dirname + '/public'));
app.use(requestTime);



let planets = [];
let planetsOrdered = [];

// Função para fazer o webscraping da swapi api
async function getPlanets() {


    for (i = 1; i <= 6; i++) {
        const response = await axios.get(`https://swapi.dev/api/planets/?page=${i}`);

        planets = planets.concat(response.data.results);
    }

    for (let i in planets) {
        planetsOrdered[i] = planets[i];
    }

    planetsOrdered.sort(function (previous, next) {
        return previous.diameter - next.diameter;
    })

    let aux;
    for (let i in planetsOrdered) {
        if (planetsOrdered[i] == "unknown") {
            aux = planetsOrdered[i + 1];
            planetsOrdered[i + 1] = planetsOrdered[i];
            planetsOrdered[i] = planetsOrdered[i + 1];
        }
    }

}
getPlanets();

// Retornar todos os planetas
app.get('/planets', function (req, res) {
    console.log(req.requestTime.getHours() + ":" + (req.requestTime.getMinutes() < 10 ? '0' + req.requestTime.getMinutes() : '') + ":" + req.requestTime.getSeconds());
    res.render('views/index', {
        planets: planets

    })


});

// Retornar um planeta pelo index
app.get('/planets/:index', function (req, res) {
    const {
        index
    } = req.params;
    res.render('views/planet', {
        planet: planets[index]
    })
});


// Retornar planetas pelo diametro em ordem crescente
app.get('/planetsordered', function (req, res) {

    res.render('views/ordered', {
        planetsOrdered: planetsOrdered
    })
});


// Atualizar um planeta
app.put('/planets/:index', function (req, res) {
    const {
        index
    } = req.params;
    const newPlanet = req.body;

    planets[index] = newPlanet;

    return res.json(planets[index]);
})


// Deletar um planeta
app.delete('/planets/:index', function (req, res) {
    const {
        index
    } = req.params;

    planets.splice(index, 1);

    return res.json({
        message: "The planet has been deleted"
    });
})

app.listen(3003);